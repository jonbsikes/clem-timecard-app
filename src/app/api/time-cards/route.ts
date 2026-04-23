import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Create time card(s) with per-entry projects. One card is created per unique project. */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const { work_date, gps_lat, gps_lng, entries } = body as {
    work_date: string;
    gps_lat: number | null;
    gps_lng: number | null;
    entries: {
      project_id: string;
      hours: number;
      work_type_id: string;
      equipment_id: string | null;
      job_status: "in_progress" | "complete";
      notes: string | null;
    }[];
  };

  if (!work_date || !Array.isArray(entries) || entries.length === 0) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  if (entries.some((e) => !e.project_id)) {
    return NextResponse.json({ error: "each entry needs a project" }, { status: 400 });
  }

  // Create one card per unique project_id, preserving first-seen order.
  const projectIds: string[] = [];
  for (const e of entries) {
    if (!projectIds.includes(e.project_id)) projectIds.push(e.project_id);
  }

  const cardRows = projectIds.map((pid) => ({
    user_id: user.id,
    project_id: pid,
    work_date,
    gps_lat,
    gps_lng,
  }));
  const { data: cards, error: ce } = await supabase
    .from("time_cards")
    .insert(cardRows)
    .select("id, project_id");
  if (ce || !cards) return NextResponse.json({ error: ce?.message ?? "insert failed" }, { status: 400 });

  const cardIdByProject = new Map<string, string>();
  for (const c of cards) cardIdByProject.set(c.project_id as string, c.id as string);

  // Insert entries one per input row (preserving order), so we can return entry_ids aligned to input.
  const entryRows = entries.map((e) => ({
    time_card_id: cardIdByProject.get(e.project_id)!,
    hours: e.hours,
    work_type_id: e.work_type_id,
    equipment_id: e.equipment_id,
    job_status: e.job_status,
    notes: e.notes,
  }));

  const entryIds: string[] = [];
  for (const row of entryRows) {
    const { data: inserted, error: ee } = await supabase
      .from("time_card_entries")
      .insert(row)
      .select("id")
      .single();
    if (ee || !inserted) {
      // Roll back all cards (cascades entries) on failure
      await supabase.from("time_cards").delete().in("id", cards.map((c) => c.id));
      return NextResponse.json({ error: ee?.message ?? "entry insert failed" }, { status: 400 });
    }
    entryIds.push(inserted.id as string);
  }

  return NextResponse.json(
    { card_ids: cards.map((c) => c.id), entry_ids: entryIds },
    { status: 201 }
  );
}
