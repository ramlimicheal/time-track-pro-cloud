import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workSessionService } from "@/services/workSessionService";
import { localDate } from "@/utils/cloudTime";
import { formatSeconds, sessionSeconds, todaySessionHours } from "@/utils/workSessions";
import { toast } from "sonner";

export function useWorkTimer(employeeId: string, _employeeName: string) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["work-sessions", employeeId],
    queryFn: () => workSessionService.list(employeeId),
    enabled: Boolean(employeeId),
    refetchInterval: 15000,
  });
  const [now, setNow] = useState(Date.now());
  const currentSession = query.data?.find(row => row.status === "active" || row.status === "paused") ?? null;
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  const mutation = useMutation({
    mutationFn: (action: "start" | "pause" | "resume" | "complete") => {
      if (action === "start") return workSessionService.start(localDate());
      if (!currentSession) throw new Error("No current work session.");
      return workSessionService.transition(currentSession, action);
    },
    onSuccess: async record => {
      await client.invalidateQueries({ queryKey: ["work-sessions", employeeId] });
      if (record.status === "completed") toast.success("Session saved. Submit your daily timesheet for approval.");
    },
    onError: async () => { await client.invalidateQueries({ queryKey: ["work-sessions", employeeId] }); },
  });
  const elapsedTime = currentSession ? sessionSeconds(currentSession, now) : 0;
  return {
    isRunning: currentSession?.status === "active",
    currentSession, elapsedTime,
    todayHours: todaySessionHours(query.data ?? [], now),
    formattedTime: formatSeconds(elapsedTime),
    loading: query.isPending, busy: mutation.isPending,
    error: query.error || mutation.error,
    retry: () => { mutation.reset(); void query.refetch(); },
    startWork: () => { if (!mutation.isPending) mutation.mutate("start"); },
    takeBreak: () => { if (!mutation.isPending) mutation.mutate("pause"); },
    resumeWork: () => { if (!mutation.isPending) mutation.mutate("resume"); },
    endWork: () => { if (!mutation.isPending) mutation.mutate("complete"); },
  };
}
