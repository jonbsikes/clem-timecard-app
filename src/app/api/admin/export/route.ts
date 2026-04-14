import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const { data: me } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const sp = Object.fromEntries(req.nextUrl.searchParams.entries()) as Record<string, string>;
  const from = sp.from, to = sp.to;

  let q = supabase
    .from("time_cards")
    .select(`
      work_date, submitted_at, locked, gps_lat, gps_lng,
      users(full_name, email),
      projects(name, client_name, address, lot_block),
      time_card_entries(hours, job_status, notes, work_types(name), equipment(name))
    `);
  if (from) q = q.gte("work_date", from);
  if (to) q = q.lte("work_date", to);
  if (sp.project) q = q.eq("project_id", sp.project);
  if (sp.employee) q = q.eq("user_id", sp.employee);
  q = q.order("work_date", { ascending: false });

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const header = [
    "work_date","employee","employee_email","project","client","address","lot_block",
    "hours","work_type","equipment","job_status","notes","submitted_at","gps_lat","gps_lng","locked",
  ];
  const lines: string[] = [header.join(",")];
  for (const card of data ?? []) {
    let entries = (card as any).time_card_entries ?? [];
    if (sp.work_type) entries = entries.filter((e: any) => e.work_types?.name === sp.work_type);
    if (sp.status) entries = entries.filter((e: any) => e.job_status === sp.status);
    for (const e of entries) {
      lines.push([
        (card as any).work_date,
        (card as any).users?.full_name,
        (card as any).users?.email,
        (card as any).projects?.name,
        (card as any).projects?.client_name,
        (card as any).projects?.address,
        (card as any).projects?.lot_block,
        e.hours,
        e.work_types?.name,
        e.equipment?.name,
        e.job_status,
        e.notes,
        (card as any).submitted_at,
        (card as any).gps_lat,
        (card as any).gps_lng,
        (card as any).locked,
      ].map(csvEscape).join(","));
    }
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="time-cards-${from ?? "all"}-to-${to ?? "now"}.csv"`,
    },
  });
}
