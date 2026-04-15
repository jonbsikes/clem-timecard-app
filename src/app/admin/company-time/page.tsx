import Link from "next/link";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SearchParams = {
  from?: string; to?: string; project?: string; employee?: string;
  work_type?: string; status?: string;
};

export default async function CompanyTimeDashboard({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const supabase = await createClient();

  const today = format(new Date(), "yyyy-MM-dd");
  const from = sp.from || format(new Date(Date.now() - 7 * 864e5), "yyyy-MM-dd");
  const to = sp.to || today;

  let q = supabase
    .from("time_cards")
    .select(`
      id, work_date, submitted_at, locked,
      users(id, full_name),
      projects(id, name),
      time_card_entries(id, hours, job_status, work_types(name), equipment(name), notes)
    `)
    .gte("work_date", from)
    .lte("work_date", to)
    .order("work_date", { ascending: false });

  if (sp.project) q = q.eq("project_id", sp.project);
  if (sp.employee) q = q.eq("user_id", sp.employee);

  const [{ data: cards }, { data: projects }, { data: employees }, { data: workTypes }] =
    await Promise.all([
      q,
      supabase.from("projects").select("id, name").order("name"),
      supabase.from("users").select("id, full_name").eq("active", true).order("full_name"),
      supabase.from("work_types").select("id, name").order("name"),
    ]);

  const filtered = (cards ?? []).map((c: any) => {
    let entries = c.time_card_entries ?? [];
    if (sp.work_type) entries = entries.filter((e: any) => e.work_types?.name === sp.work_type);
    if (sp.status) entries = entries.filter((e: any) => e.job_status === sp.status);
    return { ...c, time_card_entries: entries };
  }).filter((c: any) => (c.time_card_entries?.length ?? 0) > 0);

  const totalHours = filtered.reduce(
    (s: number, c: any) => s + c.time_card_entries.reduce((ss: number, e: any) => ss + Number(e.hours), 0),
    0
  );

  const csvParams = new URLSearchParams(sp as any).toString();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <Link href="/admin" className="text-sm text-brand hover:underline">&larr; Admin</Link>
          <h1 className="text-2xl font-bold">Company Time</h1>
        </div>
        <a href={`/api/admin/export?${csvParams}`} className="btn-secondary text-sm">Export CSV</a>
      </div>

      <form className="card p-4 grid md:grid-cols-6 gap-3 text-sm">
        <div>
          <label className="label">From</label>
          <input className="input" type="date" name="from" defaultValue={from} />
        </div>
        <div>
          <label className="label">To</label>
          <input className="input" type="date" name="to" defaultValue={to} />
        </div>
        <div>
          <label className="label">Project</label>
          <select className="input" name="project" defaultValue={sp.project ?? ""}>
            <option value="">All</option>
            {(projects ?? []).map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Employee</label>
          <select className="input" name="employee" defaultValue={sp.employee ?? ""}>
            <option value="">All</option>
            {(employees ?? []).map((e: any) => <option key={e.id} value={e.id}>{e.full_name || e.id.slice(0,6)}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Work type</label>
          <select className="input" name="work_type" defaultValue={sp.work_type ?? ""}>
            <option value="">All</option>
            {(workTypes ?? []).map((w: any) => <option key={w.id} value={w.name}>{w.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" name="status" defaultValue={sp.status ?? ""}>
            <option value="">All</option>
            <option value="in_progress">In Progress</option>
            <option value="complete">Complete</option>
          </select>
        </div>
        <div className="md:col-span-6 flex gap-2">
          <button className="btn-primary text-sm">Apply</button>
          <Link href="/admin/company-time" className="btn-secondary text-sm">Reset</Link>
        </div>
      </form>

      <div className="card p-4 flex items-center justify-between">
        <span className="text-slate-600">{filtered.length} time card(s)</span>
        <span className="font-semibold">Total: {totalHours} hrs</span>
      </div>

      <div className="space-y-2">
        {filtered.map((c: any) => {
          const total = c.time_card_entries.reduce((s: number, e: any) => s + Number(e.hours), 0);
          return (
            <div key={c.id} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">
                    {format(new Date(c.work_date), "EEE, MMM d")} — {c.projects?.name}
                  </div>
                  <div className="text-sm text-slate-600">
                    {c.users?.full_name || "Unknown"} · submitted {format(new Date(c.submitted_at), "p")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{total} hrs</div>
                  <Link
                    href={`/admin/time-cards/${c.id}`}
                    className="text-xs text-brand underline"
                  >
                    Edit
                  </Link>
                </div>
              </div>
              <ul className="mt-2 text-sm text-slate-700 space-y-1">
                {c.time_card_entries.map((e: any) => (
                  <li key={e.id}>
                    • {e.hours} hrs {e.work_types?.name}
                    {e.equipment?.name ? ` (${e.equipment.name})` : ""} — {e.job_status === "complete" ? "Complete" : "In Progress"}
                    {e.notes ? ` — ${e.notes}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-slate-600">No time cards match these filters.</p>}
      </div>
    </div>
  );
}
