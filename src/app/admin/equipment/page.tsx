import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

async function toggle(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "on";
  await supabase.from("equipment").update({ active }).eq("id", id);
  revalidatePath("/admin/equipment");
}

export default async function EquipmentAdmin() {
  const supabase = await createClient();
  const { data: items } = await supabase.from("equipment").select("*").order("name");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Equipment</h1>
      <form action={add} className="card p-4 grid md:grid-cols-4 gap-3">
        <div><label className="label">Name *</label><input className="input" name="name" required /></div>
        <div><label className="label">Category</label><input className="input" name="category" /></div>
        <div><label className="label">Internal ID</label><input className="input" name="internal_id" /></div>
        <div className="flex items-end"><button className="btn-primary w-full">Add</button></div>
      </form>
      <div className="space-y-2">
        {(items ?? []).map((i) => (
          <form key={i.id} action={toggle} className="card p-3 flex items-center justify-between gap-3">
            <div>
              <div className="font-medium">{i.name}</div>
              <div className="text-xs text-stone-500">{[i.category, i.internal_id].filter(Boolean).join(" · ")}</div>
            </div>
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
