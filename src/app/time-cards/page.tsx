import Link from "next/link";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MyTimeCards() {
  const supabase = await createClient();
  const { data: cards } = await supabase
    .from("time_cards")
    .select("id, work_date, submitted_at, locked, project_id, projects(name, client_name), time_card_entries(hours)")
    .order("work_date", { ascending: false })
    .limit(30);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Time Cards</h1>
        <Link href="/time-cards/new" className="btn-primary">+ New Time Card</Link>
      </div>
      <div className="space-y-2">
        {(cards ?? []).length === 0 && (
          <p className="text-stone-600">No time cards yet. Tap <strong>New Time Card</strong> to submit one.</p>
        )}
        {(cards ?? []).map((c: any) => {
          const total = (c.time_card_entries ?? []).reduce((s: number, e: any) => s + Number(e.hours ?? 0), 0);
          return (
            <Link key={c.id} href={`/time-cards/${c.id}`} className="card block p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{format(new Date(c.work_date), "EEE, MMM d")}</div>
                  <div className="text-sm text-stone-600">{c.projects?.name ?? "—"}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{total} hrs</div>
                  <div className={`text-xs ${c.locked ? "text-red-700" : "text-green-700"}`}>
                    {c.locked ? "Locked" : "Editable"}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
