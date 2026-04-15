"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Project = { id: string; name: string };

type Props = {
  /** When provided, the project is fixed and no project picker is shown. */
  projectId?: string;
  /** When provided (and projectId is not), render a dropdown so the uploader can pick the project. */
  projects?: Project[];
};

export default function ProjectDocumentUploader({ projectId, projects }: Props) {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState<string>(
    projectId ?? projects?.[0]?.id ?? ""
  );
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] =
    useState<"site_plan" | "construction_doc" | "photo" | "other">("site_plan");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const targetProject = projectId ?? selectedProject;

  async function upload() {
    if (\!file || \!targetProject) return;
    setBusy(true);
    setErr(null);
    setOk(null);
    const supabase = createClient();
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${targetProject}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("project-docs")
        .upload(path, file, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });
      if (upErr) throw upErr;
      const { data: signed, error: signErr } = await supabase.storage
        .from("project-docs")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      if (signErr) throw signErr;
      const { error: dbErr } = await supabase.from("project_documents").insert({
        project_id: targetProject,
        file_url: signed.signedUrl,
        storage_path: path,
        file_name: file.name,
        file_type: fileType,
      });
      if (dbErr) throw dbErr;
      setFile(null);
      setOk("Uploaded.");
      router.refresh();
    } catch (e: any) {
      setErr(e.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end gap-2">
        {\!projectId && projects && projects.length > 0 && (
          <div className="min-w-[200px]">
            <label className="label">Project</label>
            <select
              className="input"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="label">Type</label>
          <select
            className="input"
            value={fileType}
            onChange={(e) => setFileType(e.target.value as any)}
          >
            <option value="site_plan">Site plan</option>
            <option value="construction_doc">Construction doc</option>
            <option value="photo">Photo</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="label">File</label>
          <input
            className="input"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <button
          type="button"
          className="btn-primary"
          disabled={\!file || \!targetProject || busy}
          onClick={upload}
        >
          {busy ? "Uploading..." : "Upload"}
        </button>
      </div>
      {err && <p className="text-red-700 text-sm">{err}</p>}
      {ok && <p className="text-emerald-700 text-sm">{ok}</p>}
    </div>
  );
}
