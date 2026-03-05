import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useDailyReport(date?: string) {
  return useQuery({
    queryKey: [api.reports.daily.path, date],
    queryFn: async () => {
      const url = date ? `${api.reports.daily.path}?date=${date}` : api.reports.daily.path;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch daily report");
      return api.reports.daily.responses[200].parse(await res.json());
    },
  });
}
