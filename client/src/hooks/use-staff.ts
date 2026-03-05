import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertStaff } from "@shared/routes";

export function useStaff() {
  return useQuery({
    queryKey: [api.staff.list.path],
    queryFn: async () => {
      const res = await fetch(api.staff.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch staff");
      return api.staff.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertStaff) => {
      const res = await fetch(api.staff.create.path, {
        method: api.staff.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create staff");
      return api.staff.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.staff.list.path] }),
  });
}
