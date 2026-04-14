import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import EditMyTimeCardForm from "./EditMyTimeCardForm";

export const dynamic = "force-dynamic";

export default async function EmployeeEditTimeCard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const [{ data: card }, { data: projects }, { data: workTypes }, { data: equipment }] =
    await Promise.all([
      supabase
        .from("time_cards")
        .select(
          `id, work_date, submitted_at, locked, project_id, user_id,
           time_card_entries(id, hours, work_type_id, equipment_id, job_status, notes)`
        )
        .eq("id", id)
        .maybeSingle(),
      supabase.from("projects").select("id, name").eq("status", "active").order("name"),
      supabase.from("work_types").select("id, name").eq("active", true).order("name"),
      supabase.from("equipment").select("id, name").eq("active", true).order("name"),
    ]);

  if (!card) return notFound();
  if (card.user_id !== user.id) redirect(`/time-cards/${id}`);

  const submittedMs = new Date(card.submitted_at).getTime();
  const within24h = Date.now() - submittedMs <= 24 * 60 * 60 * 1000;
  const canEdit = !card.locked && within24h;

  if (!canEdit) {
    return (
      <div className="space-y-4">
        <Link href={`/time-cards/${id}`} className="text-sm text-stone-600 underline">← Back</Link>
        <div className="card p-4">
          <h1 className="text-xl font-bold mb-2">Edit window closed</h1>
          <p className="text-stone-700 text-sm">
            {card.locked
              ? "This time card has been locked."
              : "The 24-hour edit window for this time card has passed."}
            {" "}Please contact an admin if changes are still needed.
          </p>
        </div>
      </div>
    );
  }

  const editExpiresAt = new Date(submittedMs + 24 * 60 * 60 * 1000).toISOString();

  return (
    <div className="space-y-4">
      <Link href={`/time-cards/${id}`} className="text-sm text-stone-600 underline">← Back</Link>
      <EditMyTimeCardForm
        card={card as any}
        projects={projects ?? []}
        workTypes={workTypes ?? []}
        equipment={equipment ?? []}
        editExpiresAt={editExpiresAt}
      />
    </div>
  );
}
