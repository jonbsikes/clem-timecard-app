import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
  const role = String(formData.get("role")) as "employee" | "admin";
  const active = formData.get("active") === "on";
  await admin.from("users").update({ role, active }).eq("id", id);
  revalidatePath("/admin/employees");
}

async function resetPassword(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const email = String(formData.get("email") || "").trim();
  if (!email) return;
  // Send a magic link the user can follow to set a new password.
  await admin.auth.resetPasswordForEmail(email, {
    redirectTo: process.env.NEXT_PUBLIC_SITE_URL ?? undefined,
  });
}

export default async function EmployeesAdmin() {
  const supabase = await createClient();
  const { data: users } = await supabase.from("users").select("*").order("full_name");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Employees</h1>

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

      <div className="space-y-2">
        {(users ?? []).map((u) => (
          <div key={u.id} className="card p-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-medium">{u.full_name || "(no name)"}</div>
              <div className="text-xs text-stone-500">{u.email}</div>
            </div>
            <div className="flex items-center gap-2">
              <form action={resetPassword}>
                <input type="hidden" name="email" value={u.email} />
                <button className="btn-secondary text-sm">Send reset</button>
              </form>
              <form action={update} className="flex items-center gap-2 text-sm">
                <input type="hidden" name="id" value={u.id} />
                <select name="role" defaultValue={u.role} className="input !py-2 text-sm">
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
                <label className="flex items-center gap-1">
                  <input type="checkbox" name="active" defaultChecked={u.active} /> Active
                </label>
                <button className="btn-primary text-sm">Save</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
