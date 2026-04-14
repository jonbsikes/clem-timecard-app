import { NextResponse, type NextRequest } from "next/server";
import { createClient, getSessionUser } from "@/lib/supabase/server";

/** Admin-only: update a time card and its entries. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const supabase = await createClient();

  const isAdmin = user.role === "admin";

  // If not admin, require ownership and an unexpired edit window (<=24h since submit, not locked).
  if (!isAdmin) {
    const { data: existing, error: fe } = await supabase
      .from("time_cards")
      .select("user_id, locked, submitted_at")
      .eq("id", id)
      .maybeSingle();
    if (fe) return NextResponse.json({ error: fe.message }, { status: 400 });
    if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });
    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    if (existing.locked) {
      return NextResponse.json({ error: "Time card is locked." }, { status: 403 });
    }
    const submittedMs = new Date(existing.submitted_at).getTime();
    if (Date.now() - submittedMs > 24 * 60 * 60 * 1000) {
      return NextResponse.json({ error: "24-hour edit window has passed." }, { status: 403 });
    }
  }

  const {
    project_id,
    work_date,
    locked,
    entries,
    deleted_entry_ids,
  } = body as {
    project_id?: string;
    work_date?: string;
    locked?: boolean;
    entries?: {
      id?: string; // present for existing entries
      hours: number;
      work_type_id: string;
      equipment_id: string | null;
      job_status: "in_progress" | "complete";
      notes: string | null;
    }[];
    deleted_entry_ids?: string[];
  };

  // Update card-level fields
  const cardPatch: Record<string, unknown> = {};
  if (project_id !== undefined) cardPatch.project_id = project_id;
  if (work_date !== undefined) cardPatch.work_date = work_date;
  if (isAdmin && locked !== undefined) cardPatch.locked = locked;

  if (Object.keys(cardPatch).length > 0) {
    const { error } = await supabase.from("time_cards").update(cardPatch).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Delete entries removed by admin
  if (Array.isArray(deleted_entry_ids) && deleted_entry_ids.length > 0) {
    const { error } = await supabase
      .from("time_card_entries")
      .delete()
      .in("id", deleted_entry_ids)
      .eq("time_card_id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Upsert entries
  if (Array.isArray(entries)) {
    for (const e of entries) {
      if (!e.hours || e.hours <= 0 || !e.work_type_id) {
        return NextResponse.json({ error: "each entry needs hours > 0 and a work type" }, { status: 400 });
      }
      if (e.id) {
        const { error } = await supabase
          .from("time_card_entries")
          .update({
            hours: e.hours,
            work_type_id: e.work_type_id,
            equipment_id: e.equipment_id,
            job_status: e.job_status,
            notes: e.notes,
          })
          .eq("id", e.id)
          .eq("time_card_id", id);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      } else {
        const { error } = await supabase.from("time_card_entries").insert({
          time_card_id: id,
          hours: e.hours,
          work_type_id: e.work_type_id,
          equipment_id: e.equipment_id,
          job_status: e.job_status,
          notes: e.notes,
        });
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
  }

  return NextResponse.json({ ok: true });
}

/** Admin-only: delete a time card (and its entries via cascade). */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const supabase = await createClient();
  const { error } = await supabase.from("time_cards").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
