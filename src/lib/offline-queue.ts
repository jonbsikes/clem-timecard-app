"use client";
import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "clem-offline";
const STORE = "pending-timecards";

async function db(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, 1, {
    upgrade(d) {
      if (!d.objectStoreNames.contains(STORE)) {
        d.createObjectStore(STORE, { keyPath: "id" });
      }
    },
  });
}

export interface QueuedTimeCard {
  id: string; // local uuid
  payload: {
    work_date: string;
    gps_lat: number | null;
    gps_lng: number | null;
    entries: {
      project_id: string;
      hours: number;
      work_type_id: string;
      equipment_id: string | null;
      job_status: "in_progress" | "complete";
      notes: string | null;
    }[];
  };
  queuedAt: number;
}

export async function enqueue(card: QueuedTimeCard) {
  const d = await db();
  await d.put(STORE, card);
}

export async function allQueued(): Promise<QueuedTimeCard[]> {
  const d = await db();
  return d.getAll(STORE);
}

export async function remove(id: string) {
  const d = await db();
  await d.delete(STORE, id);
}

/** Attempt to sync all queued time cards. Returns number synced. */
export async function flushQueue(): Promise<number> {
  const items = await allQueued();
  let synced = 0;
  for (const it of items) {
    try {
      const res = await fetch("/api/time-cards", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(it.payload),
      });
      if (res.ok) {
        await remove(it.id);
        synced++;
      }
    } catch {
      // stay queued
    }
  }
  return synced;
}

export function registerSyncListener() {
  if (typeof window === "undefined") return;
  window.addEventListener("online", () => void flushQueue());
  navigator.serviceWorker?.addEventListener?.("message", (e) => {
    if ((e.data as any)?.type === "SYNC_TIMECARDS") void flushQueue();
  });
}
