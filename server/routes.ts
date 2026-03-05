import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { db } from "./db";
import { categories, items, staff, customers, sessions, orderItems } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Seed Database with initial data if empty
  app.post("/api/seed", async (req, res) => {
    try {
      const existingCategories = await storage.getCategories();
      if (existingCategories.length === 0) {
        // Categories
        const catData = [
          { name: "مشروبات غازية", color: "bg-blue-500" },
          { name: "مشروبات طاقة", color: "bg-yellow-500" },
          { name: "عصائر وفريش", color: "bg-green-500" },
          { name: "كوكتيلات وسبيشيال", color: "bg-purple-500" },
          { name: "الشيشة", color: "bg-red-500" },
          { name: "بلايستيشن", color: "bg-indigo-500" }
        ];
        
        const insertedCategories = await db.insert(categories).values(catData).returning();
        const catMap = insertedCategories.reduce((acc, cat) => {
          acc[cat.name] = cat.id;
          return acc;
        }, {} as Record<string, number>);

        // Items
        const itemData = [
          { categoryId: catMap["مشروبات غازية"], name: "بيبسي", price: 20 },
          { categoryId: catMap["مشروبات غازية"], name: "اسبرايت", price: 20 },
          { categoryId: catMap["مشروبات غازية"], name: "فولت", price: 20 },
          { categoryId: catMap["مشروبات طاقة"], name: "مشروب طاقة", price: 30 },
          { categoryId: catMap["مشروبات طاقة"], name: "موهيتو طاقة", price: 40 },
          { categoryId: catMap["عصائر وفريش"], name: "مانجو", price: 35 },
          { categoryId: catMap["عصائر وفريش"], name: "ليمون نعناع", price: 25 },
          { categoryId: catMap["الشيشة"], name: "شيشة تفاح فاخر", price: 35 },
          { categoryId: catMap["الشيشة"], name: "شيشة ميكس فواكه", price: 40 },
          { categoryId: catMap["بلايستيشن"], name: "ساعة بلايستيشن", price: 20 },
          { categoryId: catMap["بلايستيشن"], name: "ساعة رباعي", price: 25 },
        ];
        
        await db.insert(items).values(itemData);

        // Staff
        await db.insert(staff).values([
          { name: "أحمد (كاشير)", role: "cashier" },
          { name: "محمد (ويتر)", role: "waiter" }
        ]);

        res.json({ success: true, message: "Database seeded successfully" });
      } else {
        res.json({ success: true, message: "Database already has data" });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API Routes based on contract

  // Staff
  app.get(api.staff.list.path, async (req, res) => {
    const result = await storage.getStaff();
    res.json(result);
  });

  app.post(api.staff.create.path, async (req, res) => {
    try {
      const input = api.staff.create.input.parse(req.body);
      const result = await storage.createStaff(input);
      res.status(201).json(result);
    } catch (e: any) {
      if (e instanceof z.ZodError) res.status(400).json({ message: e.errors[0].message });
      else res.status(500).json({ message: e.message });
    }
  });

  // Categories
  app.get(api.categories.list.path, async (req, res) => {
    const result = await storage.getCategories();
    res.json(result);
  });

  // Items
  app.get(api.items.list.path, async (req, res) => {
    const result = await storage.getItems();
    res.json(result);
  });

  app.post(api.items.create.path, async (req, res) => {
    try {
      const input = api.items.create.input.parse(req.body);
      const result = await storage.createItem(input);
      res.status(201).json(result);
    } catch (e: any) {
      if (e instanceof z.ZodError) res.status(400).json({ message: e.errors[0].message });
      else res.status(500).json({ message: e.message });
    }
  });

  app.put(api.items.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.items.update.input.parse(req.body);
      const result = await storage.updateItem(id, input);
      res.json(result);
    } catch (e: any) {
      if (e instanceof z.ZodError) res.status(400).json({ message: e.errors[0].message });
      else res.status(500).json({ message: e.message });
    }
  });

  app.delete(api.items.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteItem(id);
    res.status(204).end();
  });

  // Customers
  app.get(api.customers.list.path, async (req, res) => {
    const result = await storage.getCustomers();
    res.json(result);
  });

  app.post(api.customers.create.path, async (req, res) => {
    try {
      const input = api.customers.create.input.parse(req.body);
      const result = await storage.createCustomer(input);
      res.status(201).json(result);
    } catch (e: any) {
      if (e instanceof z.ZodError) res.status(400).json({ message: e.errors[0].message });
      else res.status(500).json({ message: e.message });
    }
  });

  // Sessions
  app.get(api.sessions.list.path, async (req, res) => {
    const status = req.query.status as string;
    const result = await storage.getSessions(status);
    res.json(result);
  });

  app.get(api.sessions.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const result = await storage.getSession(id);
    if (!result) return res.status(404).json({ message: "Session not found" });
    res.json(result);
  });

  app.post(api.sessions.create.path, async (req, res) => {
    try {
      const input = api.sessions.create.input.parse(req.body);
      const result = await storage.createSession(input);
      res.status(201).json(result);
    } catch (e: any) {
      if (e instanceof z.ZodError) res.status(400).json({ message: e.errors[0].message });
      else res.status(500).json({ message: e.message });
    }
  });

  app.put(api.sessions.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.sessions.update.input.parse(req.body);
      const result = await storage.updateSession(id, input);
      res.json(result);
    } catch (e: any) {
      if (e instanceof z.ZodError) res.status(400).json({ message: e.errors[0].message });
      else res.status(500).json({ message: e.message });
    }
  });

  app.post(api.sessions.checkout.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.sessions.checkout.input.parse(req.body);
      const result = await storage.checkoutSession(id, input.paymentMethod);
      res.json(result);
    } catch (e: any) {
      if (e instanceof z.ZodError) res.status(400).json({ message: e.errors[0].message });
      else res.status(500).json({ message: e.message });
    }
  });

  // Order Items
  app.post(api.sessions.addItem.path, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const input = api.sessions.addItem.input.parse(req.body);
      const result = await storage.addOrderItem(sessionId, input.itemId, input.quantity);
      res.status(201).json(result);
    } catch (e: any) {
      if (e instanceof z.ZodError) res.status(400).json({ message: e.errors[0].message });
      else res.status(500).json({ message: e.message });
    }
  });

  app.put(api.sessions.updateItem.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.sessions.updateItem.input.parse(req.body);
      const result = await storage.updateOrderItem(id, input.quantity);
      res.json(result);
    } catch (e: any) {
      if (e instanceof z.ZodError) res.status(400).json({ message: e.errors[0].message });
      else res.status(500).json({ message: e.message });
    }
  });

  app.delete(api.sessions.deleteItem.path, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteOrderItem(id);
    res.status(204).end();
  });

  // Reports
  app.get(api.reports.daily.path, async (req, res) => {
    try {
      // Basic mock implementation for daily reports
      // In a real app, you would filter by date and aggregate
      const allCompletedSessions = await storage.getSessions("completed");
      
      let totalSales = 0;
      let totalOrders = allCompletedSessions.length;
      let salesByCategory: Record<string, number> = {};
      
      allCompletedSessions.forEach(session => {
        totalSales += (session.total || 0);
      });

      res.json({
        totalSales,
        totalOrders,
        bestSellingItem: "شيشة تفاح", // Mock
        salesByCategory: {
          "مشروبات": 500,
          "شيشة": 1200
        },
        staffProfits: {
          "أحمد": 1500
        }
      });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  return httpServer;
}