import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import ConfirmButton from "@/components/ConfirmButton";

export const dynamic = "force-dynamic";

async function add(formData: FormData) {
  "use server";
  const supabase = await createClient();
  await supabase.from("equipment").insert({
    name: String(formData.get("name") || "").trim(),
    category: String(formData.get("category") || "") || null,
    internal_id: String(formData.get("internal_id") || "") || null,
  });
  revalidatePath("/admin/equipment");
}

async function update(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = String(formData.get("id"));
  await supabase
    .from("equipment")
    .update({
      name: String(formData.get("name") || "").trim(),
      category: String(formData.get("category") || "") || null,
      internal_id: String(formData.get("internal_id") || "") || null,
      active: formData.get("active") === "on",
    })
    .eq("id", id);
  revalidatePath("/admin/equipment");
}

async function remove(formData: FormData) {
  "use server";
  const supabase = await createClient();
  await supabase.from("equipment").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/equipment");
}

export default async function EquipmentAdmin() {
  const supabase = await createClient();
  const { data: items } = await supabase.from("equipment").select("*").order("name");

  return (
    <div className="space-y-6">
      <form action={add} className="card p-4 grid md:grid-cols-4 gap-3">
        <div><label className="label">Name *</label><input className="input" name="name" required /></div>
        <div><label className="label">Category</label><input className="input" name="category" /></div>
        <div><label className="label">Internal ID</label><input className="input" name="internal_id" /></div>
        <div className="flex items-end"><button className="btn-primary w-full">Add</button></div>
      </form>

      <div className="space-y-3">
        {(items ?? []).map((i) => (
          <details key={i.id} className="card p-4">
            <summary className="flex items-center justify-between gap-4 cursor-pointer">
              <div>
                <div className="font-medium">{i.name}</div>
                <div className="text-xs text-stone-500">
                  {[i.category, i.internal_id].filter(Boolean).join(" · ")}
                </div>
              </div>
              <span className="text-xs uppercase tracking-wide text-stone-500">
                {i.active ? "active" : "inactive"}
              </span>
            </summary>

            <form action={update} className="grid md:grid-cols-4 gap-3 mt-4 items-end">
              <input type="hidden" name="id" value={i.id} />
              <div><label className="label">Name *</label><input className="input" name="name" defaultValue={i.name} required /></div>
              <div><label className="label">Category</label><input className="input" name="category" defaultValue={i.category ?? ""} /></div>
              <div><label className="label">Internal ID</label><input className="input" name="internal_id" defaultValue={i.internal_id ?? ""} /></div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="active" defaultChecked={i.active} /> Active
              </label>
              <div className="md:col-span-4"><button className="btn-primary">Save changes</button></div>
            </form>

            <form action={remove} className="mt-3 pt-3 border-t border-stone-200">
              <input type="hidden" name="id" value={i.id} />
              <ConfirmButton
                className="btn-secondary text-sm text-red-700"
                message={`Delete ${i.name}? This cannot be undone.`}
              >
                Delete equipment
              </ConfirmButton>
            </form>
          </details>
        ))}
      </div>
    </div>
  );
}
