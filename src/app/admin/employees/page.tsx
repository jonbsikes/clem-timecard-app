import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import ConfirmButton from "@/components/ConfirmButton";

export const dynamic = "force-dynamic";

async function invite(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const email = String(formData.get("email") || "").trim();
  const full_name = String(formData.get("full_name") || "").trim();
  const role = (String(formData.get("role") || "employee")) as "employee" | "admin";
  if (!email) return;

  // Invite via magic link; handle_new_user trigger creates profile row on confirmation.
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name },
  });
  if (error || !data.user) return;
  await admin.from("users").upsert({
    id: data.user.id,
    email,
    full_name,
    role,
    active: true,
  });
  revalidatePath("/admin/employees");
}

async function update(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const id = String(formData.get("id"));
  const full_name = String(formData.get("full_name") || "").trim();
  const role = String(formData.get("role")) as "employee" | "admin";
  const active = formData.get("active") === "on";
  await admin.from("users").update({ full_name, role, active }).eq("id", id);
  revalidatePath("/admin/employees");
}

async function remove(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const id = String(formData.get("id"));
  // Delete auth user first (cascade may clean profile row via trigger/FK).
  await admin.auth.admin.deleteUser(id);
  // Ensure profile row is gone even if no cascade.
  await admin.from("users").delete().eq("id", id);
  revalidatePath("/admin/employees");
}

async function resetPassword(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const email = String(formData.get("email") || "").trim();
  if (!email) return;
  await admin.auth.resetPasswordForEmail(email, {
    redirectTo: process.env.NEXT_PUBLIC_SITE_URL ?? undefined,
  });
}

export default async function EmployeesAdmin() {
  const supabase = await createClient();
  const { data: users } = await supabase.from("users").select("*").order("full_name");

  return (
    <div className="space-y-6">
      <form action={invite} className="card p-4 grid md:grid-cols-4 gap-3">
        <div><label className="label">Email *</label><input className="input" type="email" name="email" required /></div>
        <div><label className="label">Full name</label><input className="input" name="full_name" /></div>
        <div>
          <label className="label">Role</label>
          <select className="input" name="role" defaultValue="employee">
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex items-end"><button className="btn-primary w-full">Invite</button></div>
      </form>

      <div className="space-y-3">
        {(users ?? []).map((u) => (
          <details key={u.id} className="card p-4">
            <summary className="flex items-center justify-between gap-4 cursor-pointer">
              <div>
                <div className="font-medium">{u.full_name || "(no name)"}</div>
                <div className="text-xs text-stone-500">{u.email}</div>
              </div>
              <span className="text-xs uppercase tracking-wide text-stone-500">
                {u.role}{u.active ? "" : " · inactive"}
              </span>
            </summary>

            <form action={update} className="grid md:grid-cols-4 gap-3 mt-4 items-end">
              <input type="hidden" name="id" value={u.id} />
              <div className="md:col-span-2">
                <label className="label">Full name</label>
                <input className="input" name="full_name" defaultValue={u.full_name ?? ""} />
              </div>
              <div>
                <label className="label">Role</label>
                <select name="role" defaultValue={u.role} className="input">
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="active" defaultChecked={u.active} /> Active
              </label>
              <div className="md:col-span-4 flex gap-2">
                <button className="btn-primary">Save changes</button>
              </div>
            </form>

            <div className="mt-3 pt-3 border-t border-stone-200 flex flex-wrap gap-2">
              <form action={resetPassword}>
                <input type="hidden" name="email" value={u.email} />
                <button className="btn-secondary text-sm">Send password reset</button>
              </form>
              <form action={remove}>
                <input type="hidden" name="id" value={u.id} />
                <ConfirmButton
                  className="btn-secondary text-sm text-red-700"
                  message={`Delete ${u.email}? This removes their login and profile.`}
                >
                  Delete employee
                </ConfirmButton>
              </form>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
