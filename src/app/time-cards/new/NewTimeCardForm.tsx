"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { enqueue, registerSyncListener } from "@/lib/offline-queue";

type Project = { id: string; name: string; client_name: string | null };
type Equipment = { id: string; name: string; category: string | null };
type WorkType = { id: string; name: string };

type Entry = {
  id: string;
  hours: string;
  work_type_id: string;
  equipment_id: string;
  job_status: "in_progress" | "complete";
  notes: string;
};

const uid = () => Math.random().toString(36).slice(2);

export default function NewTimeCardForm({
  projects,
  equipment,
  workTypes,
}: {
  projects: Project[];
  equipment: Equipment[];
  workTypes: WorkType[];
}) {
  const router = useRouter();
  const today = format(new Date(), "yyyy-MM-dd");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [workDate, setWorkDate] = useState(today);
  const [entries, setEntries] = useState<Entry[]>([
    { id: uid(), hours: "", work_type_id: workTypes[0]?.id ?? "", equipment_id: "", job_status: "in_progress", notes: "" },
  ]);
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [queued, setQueued] = useState(false);

  const total = useMemo(
    () => entries.reduce((s, e) => s + (parseFloat(e.hours) || 0), 0),
    [entries]
  );

  useEffect(() => {
    registerSyncListener();
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );
  }, []);

  function update(id: string, patch: Partial<Entry>) {
    setEntries((es) => es.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }
  function addEntry() {
    setEntries((es) => [
      ...es,
      { id: uid(), hours: "", work_type_id: workTypes[0]?.id ?? "", equipment_id: "", job_status: "in_progress", notes: "" },
    ]);
  }
  function removeEntry(id: string) {
    setEntries((es) => (es.length === 1 ? es : es.filter((e) => e.id !== id)));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!projectId) return setErr("Please select a project.");
    const cleaned = entries.map((en) => ({
      hours: parseFloat(en.hours),
      work_type_id: en.work_type_id,
      equipment_id: en.equipment_id || null,
      job_status: en.job_status,
      notes: en.notes || null,
    }));
    if (cleaned.some((e) => !e.hours || e.hours <= 0)) return setErr("Each entry needs hours > 0.");
    if (cleaned.some((e) => !e.work_type_id)) return setErr("Each entry needs a work type.");

    const payload = {
      project_id: projectId,
      work_date: workDate,
      gps_lat: gps?.lat ?? null,
      gps_lng: gps?.lng ?? null,
      entries: cleaned,
    };

    setBusy(true);
    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        await enqueue({ id: uid(), payload, queuedAt: Date.now() });
        setQueued(true);
        setTimeout(() => router.push("/time-cards"), 700);
        return;
      }
      const res = await fetch("/api/time-cards", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        if (res.status === 0 || res.status >= 500) {
          await enqueue({ id: uid(), payload, queuedAt: Date.now() });
          setQueued(true);
          setTimeout(() => router.push("/time-cards"), 700);
          return;
        }
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Submit failed");
      }
      router.push("/time-cards");
      router.refresh();
    } catch (ex: any) {
      // Network failure -> queue it
      try {
        await enqueue({ id: uid(), payload, queuedAt: Date.now() });
        setQueued(true);
        setTimeout(() => router.push("/time-cards"), 700);
      } catch {
        setErr(ex.message || "Something went wrong.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-2xl font-bold">New Time Card</h1>

      <div className="card p-4 space-y-3">
        <div>
          <label className="label" htmlFor="project">Project</label>
          <select id="project" className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {projects.length === 0 && <option value="">(no active projects)</option>}
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}{p.client_name ? ` — ${p.client_name}` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="date">Date</label>
          <input id="date" type="date" className="input" value={workDate}
                 onChange={(e) => setWorkDate(e.target.value)} />
        </div>
        <p className="text-xs text-stone-500">
          {gps ? `GPS: ${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : "Capturing GPS…"}
        </p>
      </div>

      {entries.map((en, i) => (
        <div key={en.id} className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Entry {i + 1}</h2>
            {entries.length > 1 && (
              <button type="button" className="text-sm text-red-700 underline" onClick={() => removeEntry(en.id)}>
                Remove
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Hours</label>
              <input type="number" step="0.25" min="0" max="24" inputMode="decimal"
                     className="input" value={en.hours}
                     onChange={(e) => update(en.id, { hours: e.target.value })} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={en.job_status}
                      onChange={(e) => update(en.id, { job_status: e.target.value as any })}>
                <option value="in_progress">In Progress</option>
                <option value="complete">Complete</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Type of Work</label>
            <select className="input" value={en.work_type_id}
                    onChange={(e) => update(en.id, { work_type_id: e.target.value })}>
              {workTypes.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Equipment (optional)</label>
            <select className="input" value={en.equipment_id}
                    onChange={(e) => update(en.id, { equipment_id: e.target.value })}>
              <option value="">—</option>
              {equipment.map((eq) => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={2} value={en.notes}
                      onChange={(e) => update(en.id, { notes: e.target.value })} />
          </div>
        </div>
      ))}

      <button type="button" className="btn-secondary w-full" onClick={addEntry}>+ Add another entry</button>

      <div className="card p-4 flex items-center justify-between">
        <span className="font-semibold">Total</span>
        <span className="text-xl font-bold">{total} hrs</span>
      </div>

      {err && <p className="text-red-700 text-sm">{err}</p>}
      {queued && <p className="text-amber-700 text-sm">Offline — time card queued. It will sync automatically.</p>}

      <button className="btn-primary w-full text-lg" disabled={busy}>
        {busy ? "Submitting…" : "Submit Time Card"}
      </button>
    </form>
  );
}
