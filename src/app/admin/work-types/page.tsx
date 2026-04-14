import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function add(formData: FormData) {
  "use server";
  const supabase = await createClient();
  await supabase.from("work_types").insert({ name: String(formData.get("name") || "").trim() });
  revalidatePath("/admin/work-types");
}

async function toggle(formData: FormData) {
  "use server";
  const supabase = await createClient();
  await supabase.from("work_types")
    .update({ active: formData.get("active") === "on" })
    .eq("id", String(formData.get("id")));
  revalidatePath("/admin/work-types");
}

export default async function WorkTypesAdmin() {
  const supabase = await createClient();
  const { data: items } = await supabase.from("work_types").select("*").order("name");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Work Types</h1>
      <form action={add} className="card p-4 flex gap-2">
        <input className="input flex-1" name="name" placeholder="e.g., Grading" required />
        <button className="btn-primary">Add</button>
      </form>
      <div className="space-y-2">
        {(items ?? []).map((i) => (
          <form key={i.id} action={toggle} className="card p-3 flex items-center justify-between">
            <span>{i.name}</span>
            <label className="flex items-center gap-2 text-sm">
              <input type="hidden" name="id" value={i.id} />
              <input type="checkbox" name="active" defaultChecked={i.active} />
              Active
              <button className="btn-secondary text-sm">Save</button>
            </label>
          </form>
        ))}
      </div>
    </div>
  );
}
