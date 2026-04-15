import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import ConfirmButton from "@/components/ConfirmButton";

export const dynamic = "force-dynamic";

async function add(formData: FormData) {
  "use server";
  const supabase = await createClient();
  await supabase.from("work_types").insert({
    name: String(formData.get("name") || "").trim(),
  });
  revalidatePath("/admin/work-types");
}

async function update(formData: FormData) {
  "use server";
  const supabase = await createClient();
  await supabase
    .from("work_types")
    .update({
      name: String(formData.get("name") || "").trim(),
      active: formData.get("active") === "on",
    })
    .eq("id", String(formData.get("id")));
  revalidatePath("/admin/work-types");
}

async function remove(formData: FormData) {
  "use server";
  const supabase = await createClient();
  await supabase.from("work_types").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/work-types");
}

export default async function WorkTypesAdmin() {
  const supabase = await createClient();
  const { data: items } = await supabase.from("work_types").select("*").order("name");

  return (
    <div className="space-y-6">
      <form action={add} className="card p-4 flex gap-2">
        <input className="input flex-1" name="name" placeholder="e.g., Grading" required />
        <button className="btn-primary">Add</button>
      </form>

      <div className="space-y-3">
        {(items ?? []).map((i) => (
          <details key={i.id} className="card p-4">
            <summary className="flex items-center justify-between gap-4 cursor-pointer">
              <span className="font-medium">{i.name}</span>
              <span className="text-xs uppercase tracking-wide text-stone-500">
                {i.active ? "active" : "inactive"}
              </span>
            </summary>

            <form action={update} className="grid md:grid-cols-3 gap-3 mt-4 items-end">
              <input type="hidden" name="id" value={i.id} />
              <div className="md:col-span-2">
                <label className="label">Name *</label>
                <input className="input" name="name" defaultValue={i.name} required />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="active" defaultChecked={i.active} /> Active
              </label>
              <div className="md:col-span-3"><button className="btn-primary">Save changes</button></div>
            </form>

            <form action={remove} className="mt-3 pt-3 border-t border-stone-200">
              <input type="hidden" name="id" value={i.id} />
              <ConfirmButton
                className="btn-secondary text-sm text-red-700"
                message={`Delete "${i.name}"? This cannot be undone.`}
              >
                Delete work type
              </ConfirmButton>
            </form>
          </details>
        ))}
      </div>
    </div>
  );
}
