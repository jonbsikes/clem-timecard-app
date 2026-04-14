import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Create a new time card with entries. */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const { project_id, work_date, gps_lat, gps_lng, entries } = body as {
    project_id: string;
    work_date: string;
    gps_lat: number | null;
    gps_lng: number | null;
    entries: {
      hours: number;
      work_type_id: string;
      equipment_id: string | null;
      job_status: "in_progress" | "complete";
      notes: string | null;
    }[];
  };

  if (!project_id || !work_date || !Array.isArray(entries) || entries.length === 0) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const { data: card, error: ce } = await supabase
    .from("time_cards")
    .insert({ user_id: user.id, project_id, work_date, gps_lat, gps_lng })
    .select()
    .single();
  if (ce) return NextResponse.json({ error: ce.message }, { status: 400 });

  const rows = entries.map((e) => ({ ...e, time_card_id: card!.id }));
  const { data: inserted, error: ee } = await supabase
    .from("time_card_entries")
    .insert(rows)
    .select("id");
  if (ee) {
    // Roll back the card on entry failure
    await supabase.from("time_cards").delete().eq("id", card!.id);
    return NextResponse.json({ error: ee.message }, { status: 400 });
  }

  return NextResponse.json(
    { id: card!.id, entry_ids: (inserted ?? []).map((r) => r.id) },
    { status: 201 }
  );
}
