import { db } from "./db";
import { eq, desc, and, isNull } from "drizzle-orm";
import {
  staff, categories, items, customers, sessions, orderItems,
  type Staff, type InsertStaff,
  type Category, type InsertCategory,
  type Item, type InsertItem, type UpdateItemRequest,
  type Customer, type InsertCustomer,
  type Session, type InsertSession, type UpdateSessionRequest,
  type OrderItem, type InsertOrderItem
} from "@shared/schema";

export interface IStorage {
  // Staff
  getStaff(): Promise<Staff[]>;
  createStaff(data: InsertStaff): Promise<Staff>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  
  // Items
  getItems(): Promise<Item[]>;
  createItem(data: InsertItem): Promise<Item>;
  updateItem(id: number, data: UpdateItemRequest): Promise<Item>;
  deleteItem(id: number): Promise<void>;
  
  // Customers
  getCustomers(): Promise<Customer[]>;
  createCustomer(data: InsertCustomer): Promise<Customer>;
  
  // Sessions (Orders)
  getSessions(status?: string): Promise<any[]>; // returns sessions with items
  getSession(id: number): Promise<any>;
  createSession(data: InsertSession): Promise<Session>;
  updateSession(id: number, data: UpdateSessionRequest): Promise<Session>;
  checkoutSession(id: number, paymentMethod: string): Promise<Session>;
  
  // Order Items
  addOrderItem(sessionId: number, itemId: number, quantity: number): Promise<OrderItem>;
  updateOrderItem(id: number, quantity: number): Promise<OrderItem>;
  deleteOrderItem(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Staff
  async getStaff(): Promise<Staff[]> {
    return await db.select().from(staff);
  }
  
  async createStaff(data: InsertStaff): Promise<Staff> {
    const [result] = await db.insert(staff).values(data).returning();
    return result;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  // Items
  async getItems(): Promise<Item[]> {
    return await db.select().from(items);
  }
  
  async createItem(data: InsertItem): Promise<Item> {
    const [result] = await db.insert(items).values(data).returning();
    return result;
  }
  
  async updateItem(id: number, data: UpdateItemRequest): Promise<Item> {
    const [result] = await db.update(items)
      .set(data)
      .where(eq(items.id, id))
      .returning();
    return result;
  }
  
  async deleteItem(id: number): Promise<void> {
    await db.delete(items).where(eq(items.id, id));
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }
  
  async createCustomer(data: InsertCustomer): Promise<Customer> {
    const [result] = await db.insert(customers).values(data).returning();
    return result;
  }

  // Sessions
  async getSessions(status?: string): Promise<any[]> {
    let query = db.select().from(sessions);
    if (status) {
      query = query.where(eq(sessions.status, status)) as any;
    }
    const allSessions = await query;
    
    // Fetch items for all sessions
    const sessionsWithItems = await Promise.all(allSessions.map(async (session) => {
      const sItems = await db.select({
        id: orderItems.id,
        sessionId: orderItems.sessionId,
        itemId: orderItems.itemId,
        quantity: orderItems.quantity,
        priceAtTime: orderItems.priceAtTime,
        item: items
      })
      .from(orderItems)
      .leftJoin(items, eq(orderItems.itemId, items.id))
      .where(eq(orderItems.sessionId, session.id));
      
      return { ...session, items: sItems };
    }));
    
    return sessionsWithItems;
  }

  async getSession(id: number): Promise<any> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    if (!session) return undefined;
    
    const sItems = await db.select({
      id: orderItems.id,
      sessionId: orderItems.sessionId,
      itemId: orderItems.itemId,
      quantity: orderItems.quantity,
      priceAtTime: orderItems.priceAtTime,
      item: items
    })
    .from(orderItems)
    .leftJoin(items, eq(orderItems.itemId, items.id))
    .where(eq(orderItems.sessionId, id));
    
    return { ...session, items: sItems };
  }

  async createSession(data: InsertSession): Promise<Session> {
    const [result] = await db.insert(sessions).values({
      ...data,
      status: "active",
      total: 0
    }).returning();
    return result;
  }

  async updateSession(id: number, data: UpdateSessionRequest): Promise<Session> {
    const [result] = await db.update(sessions)
      .set(data)
      .where(eq(sessions.id, id))
      .returning();
    return result;
  }

  async checkoutSession(id: number, paymentMethod: string): Promise<Session> {
    // Recalculate total just to be safe
    const sessionItems = await db.select().from(orderItems).where(eq(orderItems.sessionId, id));
    const total = sessionItems.reduce((sum, item) => sum + (item.priceAtTime * item.quantity), 0);
    
    const [result] = await db.update(sessions)
      .set({
        status: "completed",
        paymentMethod,
        endTime: new Date(),
        total
      })
      .where(eq(sessions.id, id))
      .returning();
    return result;
  }

  // Order Items
  async addOrderItem(sessionId: number, itemId: number, quantity: number): Promise<OrderItem> {
    // Get item price
    const [item] = await db.select().from(items).where(eq(items.id, itemId));
    if (!item) throw new Error("Item not found");
    
    // Check if item already in session
    const [existing] = await db.select()
      .from(orderItems)
      .where(and(
        eq(orderItems.sessionId, sessionId),
        eq(orderItems.itemId, itemId)
      ));
      
    if (existing) {
      const [updated] = await db.update(orderItems)
        .set({ quantity: existing.quantity + quantity })
        .where(eq(orderItems.id, existing.id))
        .returning();
      await this.updateSessionTotal(sessionId);
      return updated;
    }

    const [result] = await db.insert(orderItems).values({
      sessionId,
      itemId,
      quantity,
      priceAtTime: item.price
    }).returning();
    
    await this.updateSessionTotal(sessionId);
    return result;
  }

  async updateOrderItem(id: number, quantity: number): Promise<OrderItem> {
    const [item] = await db.select().from(orderItems).where(eq(orderItems.id, id));
    if (!item) throw new Error("Order item not found");
    
    const [updated] = await db.update(orderItems)
      .set({ quantity })
      .where(eq(orderItems.id, id))
      .returning();
      
    await this.updateSessionTotal(item.sessionId);
    return updated;
  }

  async deleteOrderItem(id: number): Promise<void> {
    const [item] = await db.select().from(orderItems).where(eq(orderItems.id, id));
    if (item) {
      await db.delete(orderItems).where(eq(orderItems.id, id));
      await this.updateSessionTotal(item.sessionId);
    }
  }
  
  private async updateSessionTotal(sessionId: number) {
    const sessionItems = await db.select().from(orderItems).where(eq(orderItems.sessionId, sessionId));
    const total = sessionItems.reduce((sum, item) => sum + (item.priceAtTime * item.quantity), 0);
    
    await db.update(sessions)
      .set({ total })
      .where(eq(sessions.id, sessionId));
  }
}

export const storage = new DatabaseStorage();