"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DocumentUploader({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"site_plan"|"construction_doc"|"photo"|"other">("site_plan");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function upload() {
    if (!file) return;
    setBusy(true); setErr(null);
    const supabase = createClient();
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${projectId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("project-docs").upload(path, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
      if (upErr) throw upErr;
      const { data: signed, error: signErr } = await supabase.storage
        .from("project-docs")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      if (signErr) throw signErr;
      const { error: dbErr } = await supabase.from("project_documents").insert({
        project_id: projectId,
        file_url: signed.signedUrl,
        storage_path: path,
        file_name: file.name,
        file_type: fileType,
      });
      if (dbErr) throw dbErr;
      setFile(null);
      router.refresh();
    } catch (e: any) {
      setErr(e.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div>
        <label className="label">Type</label>
        <select className="input" value={fileType} onChange={(e) => setFileType(e.target.value as any)}>
          <option value="site_plan">Site plan</option>
          <option value="construction_doc">Construction doc</option>
          <option value="photo">Photo</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="flex-1 min-w-[200px]">
        <label className="label">File</label>
        <input className="input" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>
      <button type="button" className="btn-primary" disabled={!file || busy} onClick={upload}>
        {busy ? "Uploading…" : "Upload"}
      </button>
      {err && <p className="text-red-700 text-sm w-full">{err}</p>}
    </div>
  );
}
