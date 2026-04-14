import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import PhotoUploader from "./PhotoUploader";

export const dynamic = "force-dynamic";

export default async function TimeCardDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: card } = await supabase
    .from("time_cards")
    .select(`
      id, work_date, submitted_at, locked, gps_lat, gps_lng,
      projects(name, client_name),
      time_card_entries(
        id, hours, job_status, notes,
        work_types(name),
        equipment(name),
        entry_photos(id, file_url)
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (!card) return notFound();

  const total = (card.time_card_entries ?? []).reduce(
    (s: number, e: any) => s + Number(e.hours ?? 0),
    0
  );

  return (
    <div className="space-y-4">
      <div>
        <Link href="/time-cards" className="text-sm text-stone-600 underline">← Back</Link>
      </div>
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{format(new Date(card.work_date), "EEEE, MMM d")}</h1>
            <p className="text-stone-600">{(card as any).projects?.name}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{total} hrs</div>
            <div className={`text-xs ${card.locked ? "text-red-700" : "text-green-700"}`}>
              {card.locked ? "Locked" : "Editable until midnight"}
            </div>
          </div>
        </div>
        {card.gps_lat && card.gps_lng && (
          <p className="text-xs text-stone-500 mt-2">
            GPS: {card.gps_lat.toFixed(4)}, {card.gps_lng.toFixed(4)}
          </p>
        )}
      </div>

      {(card.time_card_entries ?? []).map((e: any) => (
        <div key={e.id} className="card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-semibold">{e.hours} hrs — {e.work_types?.name}</div>
            <span className={`text-xs px-2 py-1 rounded-full ${e.job_status === "complete" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
              {e.job_status === "complete" ? "Complete" : "In Progress"}
            </span>
          </div>
          {e.equipment?.name && <div className="text-sm text-stone-600">Equipment: {e.equipment.name}</div>}
          {e.notes && <p className="text-sm">{e.notes}</p>}

          <div className="grid grid-cols-3 gap-2">
            {(e.entry_photos ?? []).map((p: any) => (
              <a key={p.id} href={p.file_url} target="_blank" rel="noreferrer" className="block">
                <img src={p.file_url} alt="" className="rounded-lg object-cover w-full h-24" />
              </a>
            ))}
          </div>
          {!card.locked && <PhotoUploader entryId={e.id} />}
        </div>
      ))}
    </div>
  );
}
