import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProjectDocumentUploader from "@/components/ProjectDocumentUploader";
import ConfirmButton from "@/components/ConfirmButton";
import { IconDocs } from "@/components/Icons";
import { deleteProjectDocument } from "./actions";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  site_plan: "Site plan",
  construction_doc: "Construction doc",
  photo: "Photo",
  other: "Other",
};

export default async function AdminDocuments() {
  const supabase = await createClient();

  const [{ data: projects }, { data: activeProjects }] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id, name, client_name, project_documents(id, file_name, file_url, file_type, uploaded_at)"
      )
      .order("name"),
    supabase
      .from("projects")
      .select("id, name")
      .eq("status", "active")
      .order("name"),
  ]);

  const all = projects ?? [];
  const totalDocs = all.reduce(
    (s: number, p: any) => s + (p.project_documents?.length ?? 0),
    0
  );

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin" className="text-sm text-brand hover:underline">
          &larr; Admin
        </Link>
        <p className="text-sm text-slate-600">
          {totalDocs} document{totalDocs === 1 ? "" : "s"} linked across{" "}
          {all.length} project{all.length === 1 ? "" : "s"}.
        </p>
      </div>

      <section className="card p-4 space-y-2">
        <div className="flex items-center gap-2">
          <IconDocs size={20} className="text-brand" />
          <h2 className="font-semibold">Upload a document</h2>
        </div>
        <p className="text-xs text-slate-600">
          Pick the project, choose a type, and upload. Employees see it instantly
          under Project Documents.
        </p>
        <ProjectDocumentUploader projects={activeProjects ?? []} />
      </section>

      <div className="space-y-3">
        {all.map((p: any) => (
          <div key={p.id} className="card p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold truncate">{p.name}</div>
                <div className="text-xs text-slate-600 truncate">
                  {p.client_name ?? "\u2014"}
                </div>
              </div>
              <Link
                href={`/admin/projects/${p.id}`}
                className="text-xs text-brand underline shrink-0"
              >
                Open project
              </Link>
            </div>

            {(p.project_documents?.length ?? 0) > 0 ? (
              <ul className="mt-3 divide-y divide-slate-100 border-t border-slate-100">
                {p.project_documents.map((d: any) => (
                  <li
                    key={d.id}
                    className="py-2 flex items-center gap-3"
                  >
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
              </ul>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                No documents yet for this project.
              </p>
            )}
          </div>
        ))}
        {all.length === 0 && <p className="text-slate-600">No projects yet.</p>}
      </div>
    </div>
  );
}
