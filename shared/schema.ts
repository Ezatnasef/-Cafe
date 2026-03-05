import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(), // cashier, waiter, shisha
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color"), 
});

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id),
  name: text("name").notNull(),
  price: integer("price").notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  notes: text("notes"),
  isRegular: boolean("is_regular").default(false),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerId: integer("customer_id").references(() => customers.id),
  staffId: integer("staff_id").references(() => staff.id),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  status: text("status").notNull().default("active"), // active, completed, cancelled
  paymentMethod: text("payment_method"), // cash, vodafone_cash, card
  total: integer("total").default(0),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => sessions.id).notNull(),
  itemId: integer("item_id").references(() => items.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  priceAtTime: integer("price_at_time").notNull(),
});

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  items: many(items),
}));

export const itemsRelations = relations(items, ({ one }) => ({
  category: one(categories, {
    fields: [items.categoryId],
    references: [categories.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  staff: one(staff, {
    fields: [sessions.staffId],
    references: [staff.id],
  }),
  customer: one(customers, {
    fields: [sessions.customerId],
    references: [customers.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  session: one(sessions, {
    fields: [orderItems.sessionId],
    references: [sessions.id],
  }),
  item: one(items, {
    fields: [orderItems.itemId],
    references: [items.id],
  }),
}));

export const insertStaffSchema = createInsertSchema(staff).omit({ id: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertItemSchema = createInsertSchema(items).omit({ id: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true, startTime: true, total: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });

export type Staff = typeof staff.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

// Request Types
export type UpdateItemRequest = Partial<InsertItem>;
export type UpdateSessionRequest = Partial<InsertSession>;
export type CheckoutSessionRequest = {
  paymentMethod: string;
};
