import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { storage } from "@/src/utils/storage";
import { TASKS, MaintenanceTask } from "@/src/content";

export type Feeling = "bien" | "moyen" | "fatigue";
export type NightLog = { id: string; date: string; hours: number; feeling: Feeling };

const LOGS_KEY = "mo2_logs";
const DONE_KEY = "mo2_task_done";

export function dateKey(d: Date = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseKey(k: string) {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(a: string, b: string) {
  return Math.round((parseKey(b).getTime() - parseKey(a).getTime()) / 86400000);
}

export type TaskStatus = MaintenanceTask & { lastDone: string | null; dueIn: number; due: boolean };

type Ctx = {
  ready: boolean;
  logs: NightLog[];
  saveLog: (l: Omit<NightLog, "id">) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
  tasks: TaskStatus[];
  markDone: (taskId: string) => Promise<void>;
};

const DataContext = createContext<Ctx | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [logs, setLogs] = useState<NightLog[]>([]);
  const [done, setDone] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const rawLogs = await storage.getItem(LOGS_KEY, "[]");
      const rawDone = await storage.getItem(DONE_KEY, "{}");
      try {
        setLogs(JSON.parse(String(rawLogs)));
        setDone(JSON.parse(String(rawDone)));
      } catch {
        // corrupted local data: start fresh
      }
      setReady(true);
    })();
  }, []);

  const saveLog = useCallback(async (l: Omit<NightLog, "id">) => {
    setLogs((prev) => {
      const next = [{ ...l, id: `${l.date}-${Date.now()}` }, ...prev.filter((p) => p.date !== l.date)].sort((a, b) =>
        b.date.localeCompare(a.date),
      );
      storage.setItem(LOGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteLog = useCallback(async (id: string) => {
    setLogs((prev) => {
      const next = prev.filter((p) => p.id !== id);
      storage.setItem(LOGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const markDone = useCallback(async (taskId: string) => {
    setDone((prev) => {
      const next = { ...prev, [taskId]: dateKey() };
      storage.setItem(DONE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const tasks = useMemo<TaskStatus[]>(() => {
    const today = dateKey();
    return TASKS.map((t) => {
      const lastDone = done[t.id] ?? null;
      const dueIn = lastDone ? t.freqDays - daysBetween(lastDone, today) : 0;
      return { ...t, lastDone, dueIn, due: dueIn <= 0 };
    }).sort((a, b) => a.dueIn - b.dueIn);
  }, [done]);

  return (
    <DataContext.Provider value={{ ready, logs, saveLog, deleteLog, tasks, markDone }}>{children}</DataContext.Provider>
  );
}

export function useData() {
  const c = useContext(DataContext);
  if (!c) throw new Error("useData outside DataProvider");
  return c;
}

export const FEELINGS: Record<Feeling, { label: string; icon: "happy" | "remove-circle" | "sad" }> = {
  bien: { label: "Bien", icon: "happy" },
  moyen: { label: "Moyen", icon: "remove-circle" },
  fatigue: { label: "Fatigué", icon: "sad" },
};

export function formatHours(h: number) {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return mm ? `${hh} h ${String(mm).padStart(2, "0")}` : `${hh} h`;
}
