"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/supabase/server";

export async function deleteProjectDocument(formData: FormData) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    throw new Error("Not authorized");
  }
  const id = String(formData.get("id"));
  if (!id) return;

  const supabase = await createClient();
  const { data: doc } = await supabase
    .from("project_documents")
    .select("id, storage_path")
    .eq("id", id)
    .maybeSingle();
  if (!doc) return;

  // Remove the storage object if we have its path; swallow errors so the DB row is
  // always cleaned up even if the blob is already gone.
  if (doc.storage_path) {
    const admin = createAdminClient();
    await admin.storage.from("project-docs").remove([doc.storage_path]);
  }
  await supabase.from("project_documents").delete().eq("id", id);

  revalidatePath("/admin/documents");
  revalidatePath("/admin/projects");
  revalidatePath("/time-cards/projects");
}
