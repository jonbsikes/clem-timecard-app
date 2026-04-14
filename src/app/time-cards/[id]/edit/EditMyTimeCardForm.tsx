"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

type Project = { id: string; name: string };
type WorkType = { id: string; name: string };
type Equipment = { id: string; name: string };

type Entry = {
  id?: string;
  _key: string;
  hours: string;
  work_type_id: string;
  equipment_id: string;
  job_status: "in_progress" | "complete";
  notes: string;
};

type Card = {
  id: string;
  work_date: string;
  submitted_at: string;
  locked: boolean;
  project_id: string;
  user_id: string;
  time_card_entries: {
    id: string;
    hours: number;
    work_type_id: string;
    equipment_id: string | null;
    job_status: "in_progress" | "complete";
    notes: string | null;
  }[];
};

const uid = () => Math.random().toString(36).slice(2);

export default function EditMyTimeCardForm({
  card,
  projects,
  workTypes,
  equipment,
  editExpiresAt,
}: {
  card: Card;
  projects: Project[];
  workTypes: WorkType[];
  equipment: Equipment[];
  editExpiresAt: string;
}) {
  const router = useRouter();

  const [projectId, setProjectId] = useState(card.project_id);
  const [workDate, setWorkDate] = useState(card.work_date);
  const [entries, setEntries] = useState<Entry[]>(
    (card.time_card_entries ?? []).map((e) => ({
      id: e.id,
      _key: e.id,
      hours: String(e.hours ?? ""),
      work_type_id: e.work_type_id,
      equipment_id: e.equipment_id ?? "",
      job_status: e.job_status,
      notes: e.notes ?? "",
    }))
  );
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const total = useMemo(
    () => entries.reduce((s, e) => s + (parseFloat(e.hours) || 0), 0),
    [entries]
  );

  function update(key: string, patch: Partial<Entry>) {
    setEntries((es) => es.map((e) => (e._key === key ? { ...e, ...patch } : e)));
  }

  function addEntry() {
    setEntries((es) => [
      ...es,
      {
        _key: uid(),
        hours: "",
        work_type_id: workTypes[0]?.id ?? "",
        equipment_id: "",
        job_status: "in_progress",
        notes: "",
      },
    ]);
  }

  function removeEntry(key: string) {
    setEntries((es) => {
      if (es.length === 1) return es;
      const target = es.find((e) => e._key === key);
      if (target?.id) setDeletedIds((d) => [...d, target.id!]);
      return es.filter((e) => e._key !== key);
    });
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const cleaned = entries.map((en) => ({
      id: en.id,
      hours: parseFloat(en.hours),
      work_type_id: en.work_type_id,
      equipment_id: en.equipment_id || null,
      job_status: en.job_status,
      notes: en.notes || null,
    }));
    if (cleaned.some((e) => !e.hours || e.hours <= 0)) return setErr("Each entry needs hours > 0.");
    if (cleaned.some((e) => !e.work_type_id)) return setErr("Each entry needs a work type.");

    setBusy(true);
    try {
      const res = await fetch(`/api/time-cards/${card.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          work_date: workDate,
          entries: cleaned,
          deleted_entry_ids: deletedIds,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Save failed");
      }
      router.push(`/time-cards/${card.id}`);
      router.refresh();
    } catch (ex: any) {
      setErr(ex.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSave} className="space-y-4">
      <h1 className="text-2xl font-bold">Edit Time Card</h1>

      <div className="card p-4 text-sm bg-amber-50 border-amber-200">
        Editable until {format(new Date(editExpiresAt), "PPp")}.
      </div>

      <div className="card p-4 space-y-3">
        <div>
          <label className="label" htmlFor="project">Project</label>
          <select id="project" className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="date">Work date</label>
          <input id="date" type="date" className="input" value={workDate}
                 onChange={(e) => setWorkDate(e.target.value)} />
        </div>
      </div>

      {entries.map((en, i) => (
        <div key={en._key} className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Entry {i + 1}</h2>
            {entries.length > 1 && (
              <button type="button" className="text-sm text-red-700 underline" onClick={() => removeEntry(en._key)}>
                Remove
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Hours</label>
              <input type="number" step="0.25" min="0" max="24" inputMode="decimal"
                     className="input" value={en.hours}
                     onChange={(e) => update(en._key, { hours: e.target.value })} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={en.job_status}
                      onChange={(e) => update(en._key, { job_status: e.target.value as any })}>
                <option value="in_progress">In Progress</option>
                <option value="complete">Complete</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Type of Work</label>
            <select className="input" value={en.work_type_id}
                    onChange={(e) => update(en._key, { work_type_id: e.target.value })}>
              {workTypes.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Equipment (optional)</label>
            <select className="input" value={en.equipment_id}
                    onChange={(e) => update(en._key, { equipment_id: e.target.value })}>
              <option value="">—</option>
              {equipment.map((eq) => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={2} value={en.notes}
                      onChange={(e) => update(en._key, { notes: e.target.value })} />
          </div>
        </div>
      ))}

      <button type="button" className="btn-secondary w-full" onClick={addEntry}>
        + Add another entry
      </button>

      <div className="card p-4 flex items-center justify-between">
        <span className="font-semibold">Total</span>
        <span className="text-xl font-bold">{total} hrs</span>
      </div>

      {err && <p className="text-red-700 text-sm">{err}</p>}

      <button className="btn-primary w-full text-lg" disabled={busy}>
        {busy ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
