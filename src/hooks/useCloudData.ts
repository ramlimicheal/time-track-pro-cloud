import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { timesheetService } from "@/services/timesheetService";
import { leaveService } from "@/services/leaveService";
import { employeeService } from "@/services/employeeService";

export function useTimesheets(all = false) {
  const { user, profile } = useAuth();
  return useQuery({
    queryKey: ["timesheets", user?.id, all ? "review" : "own"],
    queryFn: () => timesheetService.list(all ? undefined : user!.id),
    enabled: Boolean(user && profile && (!all || profile.role !== "employee")),
    refetchInterval: 30000,
  });
}

export function useLeaves(all = false) {
  const { user, profile } = useAuth();
  return useQuery({
    queryKey: ["leaves", user?.id, all ? "review" : "own"],
    queryFn: () => leaveService.list(all ? undefined : user!.id),
    enabled: Boolean(user && profile && (!all || profile.role !== "employee")),
    refetchInterval: 30000,
  });
}

export function useProfiles() {
  const { user, profile } = useAuth();
  return useQuery({
    queryKey: ["profiles", user?.id],
    queryFn: () => employeeService.list(),
    enabled: Boolean(user && profile && profile.role !== "employee"),
    refetchInterval: 30000,
  });
}

export function useRefreshWorkforce() {
  const client = useQueryClient();
  return async () => {
    await Promise.all(["timesheets", "leaves", "profiles", "balances", "roles"].map(key =>
      client.invalidateQueries({ queryKey: [key] })));
  };
}
