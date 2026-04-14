import { NextResponse, type NextRequest } from "next/server";
import { formatInTimeZone } from "date-fns-tz";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAuthorizedCron } from "@/lib/cron-auth";

export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  const { data: s } = await admin.from("app_settings").select("*").eq("id", 1).single();
  const tz = s?.timezone || process.env.DEFAULT_TIMEZONE || "America/Chicago";

  // Lock any unlocked time cards whose work_date is before today in the configured timezone.
  const todayLocal = formatInTimeZone(new Date(), tz, "yyyy-MM-dd");
  const { data, error } = await admin
    .from("time_cards")
    .update({ locked: true })
    .eq("locked", false)
    .lt("work_date", todayLocal)
    .select("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ locked: data?.length ?? 0, cutoff: todayLocal, tz });
}
