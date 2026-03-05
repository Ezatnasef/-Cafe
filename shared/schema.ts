import { z } from "zod";

// ---- Types ----

export interface User {
  id: number;
  username: string;
  password: string;
  role: string;
}

export interface Staff {
  id: number;
  name: string;
  role: string;
}

export interface Category {
  id: number;
  name: string;
  color: string | null;
}

export interface Item {
  id: number;
  categoryId: number | null;
  name: string;
  price: number;
}

export interface Customer {
  id: number;
  name: string;
  notes: string | null;
  isRegular: boolean | null;
}

export interface Session {
  id: number;
  customerName: string;
  customerId: number | null;
  staffId: number | null;
  startTime: Date;
  endTime: Date | null;
  status: string;
  paymentMethod: string | null;
  total: number | null;
}

export interface OrderItem {
  id: number;
  sessionId: number;
  itemId: number;
  quantity: number;
  priceAtTime: number;
}

// ---- Zod Insert Schemas ----

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
  role: z.string().default("staff"),
});

export const insertStaffSchema = z.object({
  name: z.string(),
  role: z.string(),
});

export const insertCategorySchema = z.object({
  name: z.string(),
  color: z.string().nullable().optional(),
});

export const insertItemSchema = z.object({
  categoryId: z.number().nullable().optional(),
  name: z.string(),
  price: z.number(),
});

export const insertCustomerSchema = z.object({
  name: z.string(),
  notes: z.string().nullable().optional(),
  isRegular: z.boolean().nullable().optional(),
});

export const insertSessionSchema = z.object({
  customerName: z.string(),
  customerId: z.number().nullable().optional(),
  staffId: z.number().nullable().optional(),
  status: z.string().optional(),
  paymentMethod: z.string().nullable().optional(),
  endTime: z.coerce.date().nullable().optional(),
});

export const insertOrderItemSchema = z.object({
  sessionId: z.number(),
  itemId: z.number(),
  quantity: z.number().default(1),
  priceAtTime: z.number(),
});

// ---- Inferred Insert Types ----

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

// ---- Request Types ----

export type UpdateItemRequest = Partial<InsertItem>;
export type UpdateSessionRequest = Partial<InsertSession>;
export type CheckoutSessionRequest = {
  paymentMethod: string;
};

// ---- Compatibility shims for shared/routes.ts ----
// These are used only at the type level: z.custom<typeof staff.$inferSelect>()

export const staff = {} as { $inferSelect: Staff };
export const categories = {} as { $inferSelect: Category };
export const items = {} as { $inferSelect: Item };
export const customers = {} as { $inferSelect: Customer };
export const sessions = {} as { $inferSelect: Session };
export const orderItems = {} as { $inferSelect: OrderItem };
