import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function FieldProjects() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, client_name, address, lot_block, project_documents(count)")
    .eq("status", "active")
    .order("name");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Active Projects</h1>
      <div className="space-y-2">
        {(projects ?? []).map((p: any) => (
          <Link key={p.id} href={`/time-cards/projects/${p.id}`} className="card p-4 block">
            <div className="font-semibold">{p.name}</div>
            <div className="text-sm text-stone-600">
              {[p.client_name, p.address, p.lot_block].filter(Boolean).join(" · ")}
            </div>
            <div className="text-xs text-stone-500 mt-1">{p.project_documents?.[0]?.count ?? 0} document(s)</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
