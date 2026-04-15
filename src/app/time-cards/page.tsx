import Link from "next/link";
import { format, startOfWeek, endOfWeek, subWeeks, startOfYear } from "date-fns";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function sundayWeekRange(ref: Date) {
  return {
    start: startOfWeek(ref, { weekStartsOn: 0 }),
    end: endOfWeek(ref, { weekStartsOn: 0 }),
  };
}

function sum(entries: any[] | null | undefined): number {
  return (entries ?? []).reduce((s, e) => s + Number(e?.hours ?? 0), 0);
}

function fmtHrs(n: number): string {
  return (Math.round(n * 100) / 100).toString();
}

export default async function MyTimeCards() {
  const supabase = await createClient();
  const now = new Date();

  const yearStart = startOfYear(now);
  const { data: cards } = await supabase
    .from("time_cards")
    .select(
      "id, work_date, submitted_at, locked, project_id, projects(name, client_name), time_card_entries(hours)"
    )
    .gte("work_date", format(yearStart, "yyyy-MM-dd"))
    .order("work_date", { ascending: false });

  const all = cards ?? [];

  const thisWeek = sundayWeekRange(now);
  const lastWeek = sundayWeekRange(subWeeks(now, 1));

  const inRange = (d: string, s: Date, e: Date) => {
    const dd = new Date(d + "T00:00:00");
    return dd >= s && dd <= e;
  };

  let thisWeekHrs = 0;
  let lastWeekHrs = 0;
  let ytdHrs = 0;

  for (const c of all) {
    const hrs = sum((c as any).time_card_entries);
    ytdHrs += hrs;
    if (inRange((c as any).work_date, thisWeek.start, thisWeek.end)) thisWeekHrs += hrs;
    else if (inRange((c as any).work_date, lastWeek.start, lastWeek.end)) lastWeekHrs += hrs;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Log History</h1>
        <p className="text-sm text-slate-600">
          Week of {format(thisWeek.start, "MMM d")} to {format(thisWeek.end, "MMM d, yyyy")}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="kpi">
          <span className="kpi-label">This Week</span>
          <span className="kpi-value">{fmtHrs(thisWeekHrs)}</span>
          <span className="kpi-sub">hours &middot; Sun-Sat</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Last Week</span>
          <span className="kpi-value">{fmtHrs(lastWeekHrs)}</span>
          <span className="kpi-sub">
            {format(lastWeek.start, "MMM d")} - {format(lastWeek.end, "MMM d")}
          </span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Year to Date</span>
          <span className="kpi-value">{fmtHrs(ytdHrs)}</span>
          <span className="kpi-sub">{format(now, "yyyy")}</span>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold">Time Cards</h2>
          <span className="text-xs text-slate-500">{all.length} entries</span>
        </div>

        {all.length === 0 ? (
          <p className="p-6 text-slate-600 text-center">
            No time cards yet. Tap <strong>+</strong> below to log one.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {all.map((c: any) => {
              const hrs = sum(c.time_card_entries);
              return (
                <li key={c.id}>
                  <Link
                    href={`/time-cards/${c.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 active:bg-slate-100"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900 truncate">
                        {format(new Date(c.work_date + "T00:00:00"), "EEE, MMM d")}
                      </div>
                      <div className="text-xs text-slate-600 truncate">
                        {c.projects?.name ?? "-"}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-brand-dark">
                        {fmtHrs(hrs)} <span className="text-xs font-medium text-slate-500">hrs</span>
                      </div>
                      <span
                        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          c.locked
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {c.locked ? "Locked" : "Editable"}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
