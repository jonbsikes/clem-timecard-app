import { revalidatePath } from "next/cache";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ConfirmButton from "@/components/ConfirmButton";

export const dynamic = "force-dynamic";

async function create(formData: FormData) {
  "use server";
  const supabase = await createClient();
  await supabase.from("projects").insert({
    name: String(formData.get("name") || "").trim(),
    client_name: String(formData.get("client_name") || "") || null,
    address: String(formData.get("address") || "") || null,
    lot_block: String(formData.get("lot_block") || "") || null,
    notes: String(formData.get("notes") || "") || null,
  });
  revalidatePath("/admin/projects");
}

async function update(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = String(formData.get("id"));
  await supabase
    .from("projects")
    .update({
      name: String(formData.get("name") || "").trim(),
      client_name: String(formData.get("client_name") || "") || null,
      address: String(formData.get("address") || "") || null,
      lot_block: String(formData.get("lot_block") || "") || null,
      notes: String(formData.get("notes") || "") || null,
      status: String(formData.get("status") || "active") as
        | "active"
        | "complete"
        | "archived",
    })
    .eq("id", id);
  revalidatePath("/admin/projects");
}

async function remove(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = String(formData.get("id"));
  await supabase.from("projects").delete().eq("id", id);
  revalidatePath("/admin/projects");
}

export default async function ProjectsAdmin() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <form action={create} className="card p-4 grid md:grid-cols-2 gap-3">
        <h2 className="md:col-span-2 font-semibold">Add project</h2>
        <div><label className="label">Name *</label><input className="input" name="name" required /></div>
        <div><label className="label">Client</label><input className="input" name="client_name" /></div>
        <div><label className="label">Address</label><input className="input" name="address" /></div>
        <div><label className="label">Lot & Block</label><input className="input" name="lot_block" /></div>
        <div className="md:col-span-2"><label className="label">Notes</label><textarea className="input" name="notes" rows={2} /></div>
        <div className="md:col-span-2"><button className="btn-primary">Create project</button></div>
      </form>

      <div className="space-y-3">
        {(projects ?? []).map((p) => (
          <details key={p.id} className="card p-4">
            <summary className="flex items-center justify-between gap-4 cursor-pointer">
              <div>
                <div className="font-semibold">
                  <Link href={`/admin/projects/${p.id}`} className="hover:underline">{p.name}</Link>
                </div>
                <div className="text-sm text-stone-600">
                  {[p.client_name, p.address, p.lot_block].filter(Boolean).join(" · ")}
                </div>
              </div>
              <span className="text-xs uppercase tracking-wide text-stone-500">{p.status}</span>
            </summary>

            <form action={update} className="grid md:grid-cols-2 gap-3 mt-4">
              <input type="hidden" name="id" value={p.id} />
              <div><label className="label">Name *</label><input className="input" name="name" defaultValue={p.name} required /></div>
              <div><label className="label">Client</label><input className="input" name="client_name" defaultValue={p.client_name ?? ""} /></div>
              <div><label className="label">Address</label><input className="input" name="address" defaultValue={p.address ?? ""} /></div>
              <div><label className="label">Lot & Block</label><input className="input" name="lot_block" defaultValue={p.lot_block ?? ""} /></div>
              <div className="md:col-span-2">
                <label className="label">Notes</label>
                <textarea className="input" name="notes" rows={2} defaultValue={p.notes ?? ""} />
              </div>
              <div>
                <label className="label">Status</label>
                <select name="status" defaultValue={p.status} className="input">
                  <option value="active">Active</option>
                  <option value="complete">Complete</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="md:col-span-2 flex gap-2">
                <button className="btn-primary">Save changes</button>
              </div>
            </form>

            <form action={remove} className="mt-3 pt-3 border-t border-stone-200">
              <input type="hidden" name="id" value={p.id} />
              <ConfirmButton
                className="btn-secondary text-sm text-red-700"
                message="Delete this project? This cannot be undone."
              >
                Delete project
              </ConfirmButton>
            </form>
          </details>
        ))}
      </div>
    </div>
  );
}
