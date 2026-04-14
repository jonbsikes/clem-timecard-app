import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function FieldProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: project }, { data: docs }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).maybeSingle(),
    supabase.from("project_documents").select("*").eq("project_id", id).order("uploaded_at", { ascending: false }),
  ]);
  if (!project) return notFound();

  return (
    <div className="space-y-4">
      <Link href="/time-cards/projects" className="text-sm text-stone-600 underline">← Projects</Link>
      <h1 className="text-2xl font-bold">{project.name}</h1>
      <p className="text-stone-600">
        {[project.client_name, project.address, project.lot_block].filter(Boolean).join(" · ")}
      </p>
      <ul className="space-y-2">
        {(docs ?? []).map((d) => (
          <li key={d.id} className="card p-3 flex items-center justify-between">
            <a className="underline" href={d.file_url} target="_blank" rel="noreferrer">{d.file_name}</a>
            <span className="text-xs text-stone-500 capitalize">{d.file_type.replace("_", " ")}</span>
          </li>
        ))}
        {(docs ?? []).length === 0 && <li className="text-stone-600">No documents uploaded yet.</li>}
      </ul>
    </div>
  );
}
