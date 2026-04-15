import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProjectDocumentUploader from "@/components/ProjectDocumentUploader";
import ConfirmButton from "@/components/ConfirmButton";
import { IconDocs } from "@/components/Icons";
import { deleteProjectDocument } from "@/app/admin/documents/actions";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  site_plan: "Site plan",
  construction_doc: "Construction doc",
  photo: "Photo",
  other: "Other",
};

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: project }, { data: docs }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("project_documents")
      .select("*")
      .eq("project_id", id)
      .order("uploaded_at", { ascending: false }),
  ]);
  if (!project) return notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/projects" className="text-sm text-brand hover:underline">
          &larr; Projects
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <p className="text-sm text-slate-600">
          {[project.client_name, project.address, project.lot_block]
            .filter(Boolean)
            .join(" \u00b7 ") || "\u2014"}
        </p>
      </div>

      <section className="card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <IconDocs size={20} className="text-brand" />
          <h2 className="font-semibold">Site plans &amp; documents</h2>
        </div>
        <ProjectDocumentUploader projectId={project.id} />

        <ul className="divide-y divide-slate-100 border-t border-slate-100">
          {(docs ?? []).map((d: any) => (
            <li key={d.id} className="py-2 flex items-center gap-3">
              <span className="shrink-0 w-9 h-9 rounded-lg bg-brand-50 text-brand flex items-center justify-center">
                <IconDocs size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <a
                  href={d.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand hover:underline truncate block"
                >
                  {d.file_name}
                </a>
                <span className="text-[11px] text-slate-500">
                  {TYPE_LABEL[d.file_type] ?? d.file_type}
                </span>
              </div>
              <form action={deleteProjectDocument}>
                <input type="hidden" name="id" value={d.id} />
                <ConfirmButton
                  className="btn-secondary text-xs text-red-700"
                  message={`Delete "${d.file_name}"? This cannot be undone.`}
                >
                  Delete
                </ConfirmButton>
              </form>
            </li>
          ))}
          {(docs ?? []).length === 0 && (
            <li className="py-2 text-sm text-slate-600">No documents yet.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
