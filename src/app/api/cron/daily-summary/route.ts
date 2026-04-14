import { NextResponse, type NextRequest } from "next/server";
import { formatInTimeZone } from "date-fns-tz";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAuthorizedCron } from "@/lib/cron-auth";

export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: settings } = await admin.from("app_settings").select("*").eq("id", 1).single();
  const tz = settings?.timezone || process.env.DEFAULT_TIMEZONE || "America/Chicago";
  const to = settings?.summary_recipient_email;
  const forceParam = req.nextUrl.searchParams.get("force");

  if (!to) return NextResponse.json({ skipped: "no recipient configured" });

  const nowLocalHour = Number(formatInTimeZone(new Date(), tz, "H"));
  const sendHour = settings?.summary_send_hour ?? 18;
  if (!forceParam && nowLocalHour !== sendHour) {
    return NextResponse.json({ skipped: `hour ${nowLocalHour} != ${sendHour}`, tz });
  }

  const workDate = formatInTimeZone(new Date(), tz, "yyyy-MM-dd");

  const { data: cards, error } = await admin
    .from("time_cards")
    .select(`
      id, work_date,
      users(full_name),
      projects(name, lot_block, client_name),
      time_card_entries(hours, job_status, notes, work_types(name), equipment(name))
    `)
    .eq("work_date", workDate)
    .order("project_id");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!cards || cards.length === 0) {
    return NextResponse.json({ sent: false, reason: "no submissions today" });
  }

  // Group by project
  const byProject = new Map<string, { name: string; rows: string[]; total: number }>();
  let dayTotal = 0;
  for (const c of cards as any[]) {
    const pname = c.projects?.name || "Unknown project";
    const lot = c.projects?.lot_block ? ` — ${c.projects.lot_block}` : "";
    const key = `${pname}${lot}`;
    if (!byProject.has(key)) byProject.set(key, { name: key, rows: [], total: 0 });
    const bucket = byProject.get(key)!;
    for (const e of c.time_card_entries ?? []) {
      const hrs = Number(e.hours);
      bucket.total += hrs;
      dayTotal += hrs;
      const status = e.job_status === "complete" ? "<strong>Complete</strong>" : "In Progress";
      const eq = e.equipment?.name ? ` (${e.equipment.name})` : "";
      const notes = e.notes ? ` — ${escapeHtml(e.notes)}` : "";
      bucket.rows.push(
        `<li>${escapeHtml(c.users?.full_name || "Unknown")} — ${hrs} hrs ${escapeHtml(e.work_types?.name || "")}${escapeHtml(eq)} — ${status}${notes}</li>`
      );
    }
  }

  const dateLabel = formatInTimeZone(new Date(), tz, "EEE, MMM d");
  let html = `<h2 style="font-family:system-ui">Daily Time Summary — ${dateLabel}</h2>`;
  for (const b of byProject.values()) {
    html += `<h3 style="font-family:system-ui;margin-bottom:4px">${escapeHtml(b.name)}</h3><ul style="font-family:system-ui">${b.rows.join("")}</ul><p style="font-family:system-ui"><em>Project total: <strong>${b.total} hrs</strong></em></p>`;
  }
  html += `<hr><p style="font-family:system-ui"><strong>Day total: ${dayTotal} hrs across ${byProject.size} project(s).</strong></p>`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  if (siteUrl) html += `<p style="font-family:system-ui"><a href="${siteUrl}/admin">View dashboard</a></p>`;

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return NextResponse.json({ error: "RESEND_API_KEY missing" }, { status: 500 });
  const resend = new Resend(resendKey);
  const from = process.env.SUMMARY_FROM_EMAIL || "Clem Time Cards <onboarding@resend.dev>";

  const { error: mailErr } = await resend.emails.send({
    from,
    to,
    subject: `Daily Time Summary — ${dateLabel}`,
    html,
  });
  if (mailErr) return NextResponse.json({ error: mailErr.message }, { status: 500 });

  return NextResponse.json({ sent: true, to, projects: byProject.size, dayTotal });
}

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
