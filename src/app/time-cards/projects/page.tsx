import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { IconDocs, IconProjects } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function FieldProjects() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, client_name, address, lot_block, project_documents(count)")
    .eq("status", "active")
    .order("name");

  const list = projects ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Project Documents</h1>
        <p className="text-sm text-slate-600">
          Pick a project to view its site plans and uploaded documents.
        </p>
      </div>

      {list.length === 0 ? (
        <div className="card p-8 text-center text-slate-600">
          <IconProjects size={32} className="mx-auto text-brand mb-2" />
          No active projects yet.
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {list.map((p: any) => {
            const count = p.project_documents?.[0]?.count ?? 0;
            return (
              <li key={p.id}>
                <Link
                  href={`/time-cards/projects/${p.id}`}
                  className="card p-4 flex items-center gap-3 hover:border-brand hover:shadow-md transition"
                >
                  <span className="shrink-0 w-11 h-11 rounded-lg bg-brand-50 text-brand flex items-center justify-center">
                    <IconDocs size={22} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-slate-900 truncate">
                      {p.name}
                    </span>
                    <span className="block text-xs text-slate-600 truncate">
                      {[p.client_name, p.address, p.lot_block]
                        .filter(Boolean)
                        .join(" \u00b7 ") || "\u2014"}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-slate-500 whitespace-nowrap">
                    {count} doc{count === 1 ? "" : "s"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
