import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { IconDocs } from "@/components/Icons";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  site_plan: "Site plan",
  construction_doc: "Construction doc",
  photo: "Photo",
  other: "Other",
};

export default async function FieldProjectDetail({ params }: { params: Promise<{ id: string }> }) {
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
  if (\!project) return notFound();

  const list = docs ?? [];

  return (
    <div className="space-y-4">
      <Link
        href="/time-cards/projects"
        className="text-sm text-brand hover:underline"
      >
        &larr; Projects
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
        <p className="text-sm text-slate-600">
          {[project.client_name, project.address, project.lot_block]
            .filter(Boolean)
            .join(" \u00b7 ") || "\u2014"}
        </p>
      </div>

      <div className="card">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold">Documents</h2>
          <span className="text-xs text-slate-500">{list.length}</span>
        </div>

        {list.length === 0 ? (
          <p className="p-6 text-slate-600 text-center text-sm">
            No documents uploaded yet. Ask your admin to upload site plans here.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {list.map((d: any) => (
              <li key={d.id}>
                <a
                  href={d.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 active:bg-slate-100"
                >
                  <span className="shrink-0 w-10 h-10 rounded-lg bg-brand-50 text-brand flex items-center justify-center">
                    <IconDocs size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-slate-900 truncate">
                      {d.file_name}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {TYPE_LABEL[d.file_type] ?? d.file_type}
                    </span>
                  </span>
                  <span className="text-xs text-brand font-semibold">Open</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
