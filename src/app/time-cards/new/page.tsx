import { createClient } from "@/lib/supabase/server";
import NewTimeCardForm from "./NewTimeCardForm";

export const dynamic = "force-dynamic";

export default async function NewTimeCardPage() {
  const supabase = await createClient();
  const [{ data: projects }, { data: equipment }, { data: workTypes }] = await Promise.all([
    supabase.from("projects").select("id, name, client_name").eq("status", "active").order("name"),
    supabase.from("equipment").select("id, name, category").eq("active", true).order("name"),
    supabase.from("work_types").select("id, name").eq("active", true).order("name"),
  ]);

  return (
    <NewTimeCardForm
      projects={projects ?? []}
      equipment={equipment ?? []}
      workTypes={workTypes ?? []}
    />
  );
}
