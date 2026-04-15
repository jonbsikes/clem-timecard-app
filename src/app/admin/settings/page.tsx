import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function save(formData: FormData) {
  "use server";
  const supabase = await createClient();
  await supabase.from("app_settings").update({
    summary_recipient_email: String(formData.get("email") || "") || null,
    summary_send_hour: Number(formData.get("hour") || 18),
    timezone: String(formData.get("tz") || "America/Chicago"),
    updated_at: new Date().toISOString(),
  }).eq("id", 1);
  revalidatePath("/admin/settings");
}

export default async function SettingsAdmin() {
  const supabase = await createClient();
  const { data: s } = await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle();
  return (
    <div className="space-y-6 max-w-lg">
      <form action={save} className="card p-4 space-y-3">
        <div>
          <label className="label">Daily summary recipient email</label>
          <input className="input" type="email" name="email" defaultValue={s?.summary_recipient_email ?? ""} />
        </div>
        <div>
          <label className="label">Send hour (local, 0–23)</label>
          <input className="input" type="number" min={0} max={23} name="hour" defaultValue={s?.summary_send_hour ?? 18} />
        </div>
        <div>
          <label className="label">Timezone (IANA)</label>
          <input className="input" name="tz" defaultValue={s?.timezone ?? "America/Chicago"} />
        </div>
        <button className="btn-primary">Save</button>
      </form>
    </div>
  );
}
