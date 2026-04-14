import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DocumentUploader from "./DocumentUploader";

export const dynamic = "force-dynamic";

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: project }, { data: docs }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).maybeSingle(),
    supabase.from("project_documents").select("*").eq("project_id", id).order("uploaded_at", { ascending: false }),
  ]);
  if (!project) return notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/projects" className="text-sm text-stone-600 underline">← Projects</Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <p className="text-stone-600">
          {[project.client_name, project.address, project.lot_block].filter(Boolean).join(" · ")}
        </p>
      </div>

      <section className="card p-4 space-y-3">
        <h2 className="font-semibold">Site plans & documents</h2>
        <DocumentUploader projectId={project.id} />
        <ul className="divide-y">
          {(docs ?? []).map((d) => (
            <li key={d.id} className="py-2 flex items-center justify-between gap-3">
              <a className="underline" href={d.file_url} target="_blank" rel="noreferrer">{d.file_name}</a>
              <span className="text-xs text-stone-500 capitalize">{d.file_type.replace("_", " ")}</span>
            </li>
          ))}
          {(docs ?? []).length === 0 && <li className="py-2 text-sm text-stone-600">No documents yet.</li>}
        </ul>
      </section>
    </div>
  );
}
