import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertSession } from "@shared/routes";
import type { Session, OrderItem, Item, Customer, Staff } from "@shared/schema";

// Helper type since backend returns sessions with relations attached
export type PopulatedSession = Session & {
  items: (OrderItem & { item: Item })[];
  customer?: Customer;
  staff?: Staff;
};

export function useSessions(status?: string) {
  return useQuery({
    queryKey: [api.sessions.list.path, status],
    queryFn: async () => {
      const url = status ? `${api.sessions.list.path}?status=${status}` : api.sessions.list.path;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch sessions");
      return (await res.json()) as PopulatedSession[];
    },
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertSession) => {
      const res = await fetch(api.sessions.create.path, {
        method: api.sessions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create session");
      return (await res.json()) as PopulatedSession;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.sessions.list.path] }),
  });
}

export function useCheckoutSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, paymentMethod }: { id: number; paymentMethod: string }) => {
      const url = buildUrl(api.sessions.checkout.path, { id });
      const res = await fetch(url, {
        method: api.sessions.checkout.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to checkout session");
      return await res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.sessions.list.path] }),
  });
}

export function useAddSessionItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, itemId, quantity }: { sessionId: number; itemId: number; quantity: number }) => {
      const url = buildUrl(api.sessions.addItem.path, { id: sessionId });
      const res = await fetch(url, {
        method: api.sessions.addItem.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add item");
      return await res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.sessions.list.path] }),
  });
}

export function useUpdateSessionItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, itemId, quantity }: { sessionId: number; itemId: number; quantity: number }) => {
      const url = buildUrl(api.sessions.updateItem.path, { sessionId, id: itemId });
      const res = await fetch(url, {
        method: api.sessions.updateItem.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update item quantity");
      return await res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.sessions.list.path] }),
  });
}

export function useDeleteSessionItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, itemId }: { sessionId: number; itemId: number }) => {
      const url = buildUrl(api.sessions.deleteItem.path, { sessionId, id: itemId });
      const res = await fetch(url, {
        method: api.sessions.deleteItem.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete item");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.sessions.list.path] }),
  });
}
