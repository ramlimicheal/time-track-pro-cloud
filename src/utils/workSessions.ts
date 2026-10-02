import type { WorkSessionRow } from "@/types/database";
import { localDate } from "./cloudTime";

export function sessionSeconds(session: WorkSessionRow, now = Date.now()): number {
  const running = session.status === "active" && session.last_started_at
    ? Math.max(0, Math.floor((now - Date.parse(session.last_started_at)) / 1000)) : 0;
  return session.elapsed_seconds + running;
}

export function todaySessionHours(sessions: WorkSessionRow[], now = Date.now()): number {
  return sessions.filter(row => row.work_date === localDate(new Date(now)))
    .reduce((sum, row) => sum + sessionSeconds(row, now), 0) / 3600;
}

export function formatSeconds(seconds: number): string {
  return [Math.floor(seconds / 3600), Math.floor(seconds % 3600 / 60), Math.floor(seconds % 60)]
    .map(value => String(value).padStart(2, "0")).join(":");
}
