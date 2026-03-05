import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertCustomer } from "@shared/routes";

export function useCustomers() {
  return useQuery({
    queryKey: [api.customers.list.path],
    queryFn: async () => {
      const res = await fetch(api.customers.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch customers");
      return api.customers.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertCustomer) => {
      const res = await fetch(api.customers.create.path, {
        method: api.customers.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create customer");
      return api.customers.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.customers.list.path] }),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCustomer> }) => {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update customer");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.customers.list.path] }),
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete customer");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.customers.list.path] }),
  });
}
