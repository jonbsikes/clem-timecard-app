import { revalidatePath } from "next/cache";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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

async function updateStatus(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as "active" | "complete" | "archived";
  await supabase.from("projects").update({ status }).eq("id", id);
  revalidatePath("/admin/projects");
}

export default async function ProjectsAdmin() {
  const supabase = await createClient();
  const { data: projects } = await supabase.from("projects").select("*").order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Projects</h1>

      <form action={create} className="card p-4 grid md:grid-cols-2 gap-3">
        <h2 className="md:col-span-2 font-semibold">Add project</h2>
        <div><label className="label">Name *</label><input className="input" name="name" required /></div>
        <div><label className="label">Client</label><input className="input" name="client_name" /></div>
        <div><label className="label">Address</label><input className="input" name="address" /></div>
        <div><label className="label">Lot & Block</label><input className="input" name="lot_block" /></div>
        <div className="md:col-span-2"><label className="label">Notes</label><textarea className="input" name="notes" rows={2} /></div>
        <div className="md:col-span-2"><button className="btn-primary">Create project</button></div>
      </form>

      <div className="space-y-2">
        {(projects ?? []).map((p) => (
          <div key={p.id} className="card p-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold">
                <Link href={`/admin/projects/${p.id}`} className="hover:underline">{p.name}</Link>
              </div>
              <div className="text-sm text-stone-600">
                {[p.client_name, p.address, p.lot_block].filter(Boolean).join(" · ")}
              </div>
            </div>
            <form action={updateStatus} className="flex items-center gap-2">
              <input type="hidden" name="id" value={p.id} />
              <select name="status" defaultValue={p.status} className="input !py-2 text-sm">
                <option value="active">Active</option>
                <option value="complete">Complete</option>
                <option value="archived">Archived</option>
              </select>
              <button className="btn-secondary text-sm">Save</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
