import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EditTimeCardForm from "./EditTimeCardForm";

export const dynamic = "force-dynamic";

export default async function AdminEditTimeCard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: card }, { data: projects }, { data: workTypes }, { data: equipment }] =
    await Promise.all([
      supabase
        .from("time_cards")
        .select(
          `id, work_date, submitted_at, locked, project_id, user_id,
           users(id, full_name, email),
           projects(id, name),
           time_card_entries(id, hours, work_type_id, equipment_id, job_status, notes)`
        )
        .eq("id", id)
        .maybeSingle(),
      supabase.from("projects").select("id, name").order("name"),
      supabase.from("work_types").select("id, name").eq("active", true).order("name"),
      supabase.from("equipment").select("id, name").eq("active", true).order("name"),
    ]);

  if (!card) return notFound();

  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin" className="text-sm text-stone-600 underline">
          ← Back to Dashboard
        </Link>
      </div>
      <EditTimeCardForm
        card={card as any}
        projects={projects ?? []}
        workTypes={workTypes ?? []}
        equipment={equipment ?? []}
      />
    </div>
  );
}
