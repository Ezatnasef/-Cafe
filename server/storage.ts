import fs from "fs";
import path from "path";
import {
  type Staff, type InsertStaff,
  type Category, type InsertCategory,
  type Item, type InsertItem, type UpdateItemRequest,
  type Customer, type InsertCustomer,
  type Session, type InsertSession, type UpdateSessionRequest,
  type OrderItem,
} from "@shared/schema";

export interface IStorage {
  // Auth
  validateLogin(username: string, password: string): Promise<boolean>;
  changePassword(oldPassword: string, newPassword: string): Promise<boolean>;

  // Staff
  getStaff(): Promise<Staff[]>;
  createStaff(data: InsertStaff): Promise<Staff>;
  updateStaff(id: number, data: Partial<InsertStaff>): Promise<Staff>;
  deleteStaff(id: number): Promise<void>;

  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(data: InsertCategory): Promise<Category>;

  // Items
  getItems(): Promise<Item[]>;
  createItem(data: InsertItem): Promise<Item>;
  updateItem(id: number, data: UpdateItemRequest): Promise<Item>;
  deleteItem(id: number): Promise<void>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomerByName(name: string): Promise<Customer | undefined>;
  createCustomer(data: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, data: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: number): Promise<void>;

  // Sessions (Orders)
  getSessions(status?: string): Promise<any[]>;
  getSession(id: number): Promise<any>;
  createSession(data: InsertSession): Promise<Session>;
  updateSession(id: number, data: UpdateSessionRequest): Promise<Session>;
  deleteSession(id: number): Promise<void>;
  checkoutSession(id: number, paymentMethod: string): Promise<Session>;

  // Order Items
  addOrderItem(sessionId: number, itemId: number, quantity: number): Promise<OrderItem>;
  updateOrderItem(id: number, quantity: number): Promise<OrderItem>;
  deleteOrderItem(id: number): Promise<void>;
}

interface DbData {
  _counters: Record<string, number>;
  _settings: { username: string; password: string };
  staff: Staff[];
  categories: Category[];
  items: Item[];
  customers: Customer[];
  sessions: Session[];
  orderItems: OrderItem[];
}

const DB_PATH = path.resolve("data", "db.json");

function emptyDb(): DbData {
  return {
    _counters: { staff: 0, categories: 0, items: 0, customers: 0, sessions: 0, orderItems: 0 },
    _settings: { username: "admin", password: "cafe2026" },
    staff: [],
    categories: [],
    items: [],
    customers: [],
    sessions: [],
    orderItems: [],
  };
}

export class JsonFileStorage implements IStorage {
  private data: DbData;

  constructor() {
    this.data = this.load();
  }

  private load(): DbData {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, "utf-8");
        const parsed = JSON.parse(raw);
        // Restore Date objects for sessions
        if (parsed.sessions) {
          parsed.sessions = parsed.sessions.map((s: any) => ({
            ...s,
            startTime: new Date(s.startTime),
            endTime: s.endTime ? new Date(s.endTime) : null,
          }));
        }
        // Migrate: add _settings if missing
        if (!parsed._settings) {
          parsed._settings = { username: "admin", password: "cafe2026" };
        }
        return parsed;
      }
    } catch {
      // ignore read errors, start fresh
    }
    return emptyDb();
  }

  private save(): void {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), "utf-8");
  }

  private nextId(table: string): number {
    this.data._counters[table] = (this.data._counters[table] || 0) + 1;
    return this.data._counters[table];
  }

  // Auth
  async validateLogin(username: string, password: string): Promise<boolean> {
    return this.data._settings.username === username && this.data._settings.password === password;
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
    if (this.data._settings.password !== oldPassword) return false;
    this.data._settings.password = newPassword;
    this.save();
    return true;
  }

  // Staff
  async getStaff(): Promise<Staff[]> {
    return this.data.staff;
  }

  async createStaff(data: InsertStaff): Promise<Staff> {
    const entry: Staff = { id: this.nextId("staff"), ...data };
    this.data.staff.push(entry);
    this.save();
    return entry;
  }

  async updateStaff(id: number, data: Partial<InsertStaff>): Promise<Staff> {
    const idx = this.data.staff.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error("Staff not found");
    this.data.staff[idx] = { ...this.data.staff[idx], ...data };
    this.save();
    return this.data.staff[idx];
  }

  async deleteStaff(id: number): Promise<void> {
    this.data.staff = this.data.staff.filter((s) => s.id !== id);
    this.save();
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.data.categories;
  }

  async createCategory(data: InsertCategory): Promise<Category> {
    const entry: Category = {
      id: this.nextId("categories"),
      name: data.name,
      color: data.color ?? null,
    };
    this.data.categories.push(entry);
    this.save();
    return entry;
  }

  // Items
  async getItems(): Promise<Item[]> {
    return this.data.items;
  }

  async createItem(data: InsertItem): Promise<Item> {
    const entry: Item = {
      id: this.nextId("items"),
      categoryId: data.categoryId ?? null,
      name: data.name,
      price: data.price,
    };
    this.data.items.push(entry);
    this.save();
    return entry;
  }

  async updateItem(id: number, data: UpdateItemRequest): Promise<Item> {
    const idx = this.data.items.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error("Item not found");
    this.data.items[idx] = { ...this.data.items[idx], ...data };
    this.save();
    return this.data.items[idx];
  }

  async deleteItem(id: number): Promise<void> {
    this.data.items = this.data.items.filter((i) => i.id !== id);
    this.save();
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return this.data.customers;
  }

  async getCustomerByName(name: string): Promise<Customer | undefined> {
    return this.data.customers.find((c) => c.name.toLowerCase() === name.toLowerCase());
  }

  async createCustomer(data: InsertCustomer): Promise<Customer> {
    const entry: Customer = {
      id: this.nextId("customers"),
      name: data.name,
      notes: data.notes ?? null,
      isRegular: data.isRegular ?? false,
    };
    this.data.customers.push(entry);
    this.save();
    return entry;
  }

  async updateCustomer(id: number, data: Partial<InsertCustomer>): Promise<Customer> {
    const idx = this.data.customers.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Customer not found");
    this.data.customers[idx] = { ...this.data.customers[idx], ...data };
    this.save();
    return this.data.customers[idx];
  }

  async deleteCustomer(id: number): Promise<void> {
    this.data.customers = this.data.customers.filter((c) => c.id !== id);
    this.save();
  }

  // Sessions
  async getSessions(status?: string): Promise<any[]> {
    let filtered = this.data.sessions;
    if (status) {
      filtered = filtered.filter((s) => s.status === status);
    }
    return filtered.map((session) => this.attachItems(session));
  }

  async getSession(id: number): Promise<any> {
    const session = this.data.sessions.find((s) => s.id === id);
    if (!session) return undefined;
    return this.attachItems(session);
  }

  private attachItems(session: Session) {
    const sItems = this.data.orderItems
      .filter((oi) => oi.sessionId === session.id)
      .map((oi) => ({
        id: oi.id,
        sessionId: oi.sessionId,
        itemId: oi.itemId,
        quantity: oi.quantity,
        priceAtTime: oi.priceAtTime,
        item: this.data.items.find((i) => i.id === oi.itemId) || null,
      }));
    return { ...session, items: sItems };
  }

  async createSession(data: InsertSession): Promise<Session> {
    const entry: Session = {
      id: this.nextId("sessions"),
      customerName: data.customerName,
      customerId: data.customerId ?? null,
      staffId: data.staffId ?? null,
      startTime: new Date(),
      endTime: null,
      status: "active",
      paymentMethod: null,
      total: 0,
    };
    this.data.sessions.push(entry);
    this.save();
    return entry;
  }

  async updateSession(id: number, data: UpdateSessionRequest): Promise<Session> {
    const idx = this.data.sessions.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error("Session not found");
    this.data.sessions[idx] = { ...this.data.sessions[idx], ...data } as Session;
    this.save();
    return this.data.sessions[idx];
  }

  async deleteSession(id: number): Promise<void> {
    this.data.orderItems = this.data.orderItems.filter((oi) => oi.sessionId !== id);
    this.data.sessions = this.data.sessions.filter((s) => s.id !== id);
    this.save();
  }

  async checkoutSession(id: number, paymentMethod: string): Promise<Session> {
    const idx = this.data.sessions.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error("Session not found");

    const sessionItems = this.data.orderItems.filter((oi) => oi.sessionId === id);
    const total = sessionItems.reduce((sum, oi) => sum + oi.priceAtTime * oi.quantity, 0);

    this.data.sessions[idx] = {
      ...this.data.sessions[idx],
      status: "completed",
      paymentMethod,
      endTime: new Date(),
      total,
    };
    this.save();
    return this.data.sessions[idx];
  }

  // Order Items
  async addOrderItem(sessionId: number, itemId: number, quantity: number): Promise<OrderItem> {
    const item = this.data.items.find((i) => i.id === itemId);
    if (!item) throw new Error("Item not found");

    // Check if item already in session
    const existing = this.data.orderItems.find(
      (oi) => oi.sessionId === sessionId && oi.itemId === itemId
    );

    if (existing) {
      existing.quantity += quantity;
      this.updateSessionTotal(sessionId);
      this.save();
      return existing;
    }

    const entry: OrderItem = {
      id: this.nextId("orderItems"),
      sessionId,
      itemId,
      quantity,
      priceAtTime: item.price,
    };
    this.data.orderItems.push(entry);
    this.updateSessionTotal(sessionId);
    this.save();
    return entry;
  }

  async updateOrderItem(id: number, quantity: number): Promise<OrderItem> {
    const oi = this.data.orderItems.find((o) => o.id === id);
    if (!oi) throw new Error("Order item not found");
    oi.quantity = quantity;
    this.updateSessionTotal(oi.sessionId);
    this.save();
    return oi;
  }

  async deleteOrderItem(id: number): Promise<void> {
    const oi = this.data.orderItems.find((o) => o.id === id);
    if (oi) {
      this.data.orderItems = this.data.orderItems.filter((o) => o.id !== id);
      this.updateSessionTotal(oi.sessionId);
      this.save();
    }
  }

  private updateSessionTotal(sessionId: number): void {
    const sessionItems = this.data.orderItems.filter((oi) => oi.sessionId === sessionId);
    const total = sessionItems.reduce((sum, oi) => sum + oi.priceAtTime * oi.quantity, 0);
    const idx = this.data.sessions.findIndex((s) => s.id === sessionId);
    if (idx !== -1) {
      this.data.sessions[idx].total = total;
    }
  }
}

export const storage = new JsonFileStorage();
