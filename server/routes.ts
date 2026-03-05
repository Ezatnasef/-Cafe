import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Auth endpoints
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const valid = await storage.validateLogin(username, password);
      if (valid) {
        res.json({ success: true });
      } else {
        res.status(401).json({ success: false, message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      }
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/auth/change-password", async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      if (!newPassword || newPassword.length < 4) {
        res.status(400).json({ success: false, message: "كلمة المرور الجديدة يجب أن تكون 4 أحرف على الأقل" });
        return;
      }
      const changed = await storage.changePassword(oldPassword, newPassword);
      if (changed) {
        res.json({ success: true });
      } else {
        res.status(400).json({ success: false, message: "كلمة المرور الحالية غير صحيحة" });
      }
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

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

        const insertedCategories = [];
        for (const cat of catData) {
          insertedCategories.push(await storage.createCategory(cat));
        }
        const catMap = insertedCategories.reduce((acc, cat) => {
          acc[cat.name] = cat.id;
          return acc;
        }, {} as Record<string, number>);

        // Items - Complete Menu
        const itemData = [
          // مشروبات غازية
          { categoryId: catMap["مشروبات غازية"], name: "بيبسي", price: 20 },
          { categoryId: catMap["مشروبات غازية"], name: "اسبرايت", price: 20 },
          { categoryId: catMap["مشروبات غازية"], name: "فولت", price: 20 },
          { categoryId: catMap["مشروبات غازية"], name: "تويست", price: 20 },
          { categoryId: catMap["مشروبات غازية"], name: "استينج", price: 20 },
          // مشروبات طاقة
          { categoryId: catMap["مشروبات طاقة"], name: "مشروب طاقة", price: 30 },
          { categoryId: catMap["مشروبات طاقة"], name: "موهيتو", price: 30 },
          { categoryId: catMap["مشروبات طاقة"], name: "موهيتو طاقة", price: 40 },
          // عصائر وفريش
          { categoryId: catMap["عصائر وفريش"], name: "موز حليب", price: 35 },
          { categoryId: catMap["عصائر وفريش"], name: "مانجو", price: 35 },
          { categoryId: catMap["عصائر وفريش"], name: "فراولة", price: 35 },
          { categoryId: catMap["عصائر وفريش"], name: "جوافة", price: 35 },
          { categoryId: catMap["عصائر وفريش"], name: "ليمون نعناع", price: 25 },
          { categoryId: catMap["عصائر وفريش"], name: "عناب", price: 15 },
          { categoryId: catMap["عصائر وفريش"], name: "برتقال", price: 30 },
          { categoryId: catMap["عصائر وفريش"], name: "بلح حليب", price: 35 },
          // كوكتيلات وسبيشيال
          { categoryId: catMap["كوكتيلات وسبيشيال"], name: "طبقات", price: 40 },
          { categoryId: catMap["كوكتيلات وسبيشيال"], name: "فروت سلاط", price: 40 },
          { categoryId: catMap["كوكتيلات وسبيشيال"], name: "كوكتيل اسموزي", price: 50 },
          { categoryId: catMap["كوكتيلات وسبيشيال"], name: "افوكادو عسل مكسرات", price: 65 },
          { categoryId: catMap["كوكتيلات وسبيشيال"], name: "كوكتيل كازابلانكا", price: 65 },
          // الشيشة
          { categoryId: catMap["الشيشة"], name: "شيشة سلوم", price: 10 },
          { categoryId: catMap["الشيشة"], name: "شيشة عباس", price: 5 },
          { categoryId: catMap["الشيشة"], name: "شيشة قص", price: 10 },
          { categoryId: catMap["الشيشة"], name: "شيشة ليمون نعناع", price: 35 },
          { categoryId: catMap["الشيشة"], name: "شيشة نعناع", price: 35 },
          { categoryId: catMap["الشيشة"], name: "شيشة تويست", price: 35 },
          { categoryId: catMap["الشيشة"], name: "شيشة ايس نعناع", price: 35 },
          { categoryId: catMap["الشيشة"], name: "شيشة مانجو كيوي", price: 35 },
          { categoryId: catMap["الشيشة"], name: "شيشة ميجا بيري", price: 35 },
          { categoryId: catMap["الشيشة"], name: "شيشة كيوي", price: 35 },
          { categoryId: catMap["الشيشة"], name: "شيشة روبي كراش", price: 35 },
          { categoryId: catMap["الشيشة"], name: "شيشة تفاح فاخر", price: 35 },
          { categoryId: catMap["الشيشة"], name: "شيشة تفاح نخلة", price: 40 },
          { categoryId: catMap["الشيشة"], name: "شيشة ميكس فواكه", price: 40 },
          { categoryId: catMap["الشيشة"], name: "شيشة كازابلانكا", price: 50 },
          // بلايستيشن
          { categoryId: catMap["بلايستيشن"], name: "ساعة بلايستيشن", price: 20 },
          { categoryId: catMap["بلايستيشن"], name: "ساعة رباعي", price: 25 },
        ];

        for (const item of itemData) {
          await storage.createItem(item);
        }

        // Staff
        await storage.createStaff({ name: "أحمد (كاشير)", role: "cashier" });
        await storage.createStaff({ name: "محمد (ويتر)", role: "waiter" });

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

  app.put("/api/staff/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.staff.update.input.parse(req.body);
      const result = await storage.updateStaff(id, input);
      res.json(result);
    } catch (e: any) {
      if (e instanceof z.ZodError) res.status(400).json({ message: e.errors[0].message });
      else res.status(500).json({ message: e.message });
    }
  });

  app.delete("/api/staff/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteStaff(id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
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

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.customers.update.input.parse(req.body);
      const result = await storage.updateCustomer(id, input);
      res.json(result);
    } catch (e: any) {
      if (e instanceof z.ZodError) res.status(400).json({ message: e.errors[0].message });
      else res.status(500).json({ message: e.message });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCustomer(id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
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

      // Auto-add customer if not exists (skip for "زائر" or empty names)
      const customerName = input.customerName.trim();
      if (customerName && customerName !== "زائر" && customerName.toLowerCase() !== "visitor") {
        const existingCustomer = await storage.getCustomerByName(customerName);
        if (!existingCustomer) {
          const newCustomer = await storage.createCustomer({ name: customerName, isRegular: false });
          input.customerId = newCustomer.id;
        } else {
          input.customerId = existingCustomer.id;
        }
      }

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

  app.delete("/api/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSession(id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
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
      const dateParam = req.query.date as string | undefined;
      const allCompletedSessions = await storage.getSessions("completed");
      const allItems = await storage.getItems();
      const allCategories = await storage.getCategories();
      const allStaff = await storage.getStaff();

      // Filter sessions by date if provided
      let filteredSessions = allCompletedSessions;
      if (dateParam) {
        const targetDate = new Date(dateParam);
        filteredSessions = allCompletedSessions.filter(session => {
          const sessionDate = new Date(session.endTime || session.startTime);
          return sessionDate.toDateString() === targetDate.toDateString();
        });
      }

      // Calculate total sales
      let totalSales = 0;
      let totalOrders = filteredSessions.length;

      filteredSessions.forEach(session => {
        totalSales += (session.total || 0);
      });

      // Calculate sales by category
      const salesByCategory: Record<string, number> = {};
      const itemSalesCount: Record<number, number> = {};

      filteredSessions.forEach(session => {
        if (session.items) {
          session.items.forEach((orderItem: any) => {
            const item = allItems.find(i => i.id === orderItem.itemId);
            if (item) {
              // Count item sales
              itemSalesCount[item.id] = (itemSalesCount[item.id] || 0) + orderItem.quantity;

              // Calculate category sales
              const category = allCategories.find(c => c.id === item.categoryId);
              const categoryName = category?.name || "غير مصنف";
              salesByCategory[categoryName] = (salesByCategory[categoryName] || 0) + (orderItem.priceAtTime * orderItem.quantity);
            }
          });
        }
      });

      // Find best selling item
      let bestSellingItem: string | null = null;
      let maxSales = 0;
      Object.entries(itemSalesCount).forEach(([itemId, count]) => {
        if (count > maxSales) {
          maxSales = count;
          const item = allItems.find(i => i.id === parseInt(itemId));
          bestSellingItem = item?.name || null;
        }
      });

      // Calculate staff profits
      const staffProfits: Record<string, number> = {};
      filteredSessions.forEach(session => {
        const staffMember = allStaff.find(s => s.id === session.staffId);
        const staffName = staffMember?.name || "غير محدد";
        staffProfits[staffName] = (staffProfits[staffName] || 0) + (session.total || 0);
      });

      res.json({
        totalSales,
        totalOrders,
        bestSellingItem,
        salesByCategory,
        staffProfits
      });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Auto-seed on startup if database is empty
  try {
    const existingCategories = await storage.getCategories();
    if (existingCategories.length === 0) {
      // Trigger seed by making an internal request
      const catData = [
        { name: "مشروبات غازية", color: "bg-blue-500" },
        { name: "مشروبات طاقة", color: "bg-yellow-500" },
        { name: "عصائر وفريش", color: "bg-green-500" },
        { name: "كوكتيلات وسبيشيال", color: "bg-purple-500" },
        { name: "الشيشة", color: "bg-red-500" },
        { name: "بلايستيشن", color: "bg-indigo-500" }
      ];
      const insertedCategories = [];
      for (const cat of catData) {
        insertedCategories.push(await storage.createCategory(cat));
      }
      const catMap = insertedCategories.reduce((acc, cat) => {
        acc[cat.name] = cat.id;
        return acc;
      }, {} as Record<string, number>);

      const itemData = [
        { categoryId: catMap["مشروبات غازية"], name: "بيبسي", price: 20 },
        { categoryId: catMap["مشروبات غازية"], name: "اسبرايت", price: 20 },
        { categoryId: catMap["مشروبات غازية"], name: "فولت", price: 20 },
        { categoryId: catMap["مشروبات غازية"], name: "تويست", price: 20 },
        { categoryId: catMap["مشروبات غازية"], name: "استينج", price: 20 },
        { categoryId: catMap["مشروبات طاقة"], name: "مشروب طاقة", price: 30 },
        { categoryId: catMap["مشروبات طاقة"], name: "موهيتو", price: 30 },
        { categoryId: catMap["مشروبات طاقة"], name: "موهيتو طاقة", price: 40 },
        { categoryId: catMap["عصائر وفريش"], name: "موز حليب", price: 35 },
        { categoryId: catMap["عصائر وفريش"], name: "مانجو", price: 35 },
        { categoryId: catMap["عصائر وفريش"], name: "فراولة", price: 35 },
        { categoryId: catMap["عصائر وفريش"], name: "جوافة", price: 35 },
        { categoryId: catMap["عصائر وفريش"], name: "ليمون نعناع", price: 25 },
        { categoryId: catMap["عصائر وفريش"], name: "عناب", price: 15 },
        { categoryId: catMap["عصائر وفريش"], name: "برتقال", price: 30 },
        { categoryId: catMap["عصائر وفريش"], name: "بلح حليب", price: 35 },
        { categoryId: catMap["كوكتيلات وسبيشيال"], name: "طبقات", price: 40 },
        { categoryId: catMap["كوكتيلات وسبيشيال"], name: "فروت سلاط", price: 40 },
        { categoryId: catMap["كوكتيلات وسبيشيال"], name: "كوكتيل اسموزي", price: 50 },
        { categoryId: catMap["كوكتيلات وسبيشيال"], name: "افوكادو عسل مكسرات", price: 65 },
        { categoryId: catMap["كوكتيلات وسبيشيال"], name: "كوكتيل كازابلانكا", price: 65 },
        { categoryId: catMap["الشيشة"], name: "شيشة سلوم", price: 10 },
        { categoryId: catMap["الشيشة"], name: "شيشة عباس", price: 5 },
        { categoryId: catMap["الشيشة"], name: "شيشة قص", price: 10 },
        { categoryId: catMap["الشيشة"], name: "شيشة ليمون نعناع", price: 35 },
        { categoryId: catMap["الشيشة"], name: "شيشة نعناع", price: 35 },
        { categoryId: catMap["الشيشة"], name: "شيشة تويست", price: 35 },
        { categoryId: catMap["الشيشة"], name: "شيشة ايس نعناع", price: 35 },
        { categoryId: catMap["الشيشة"], name: "شيشة مانجو كيوي", price: 35 },
        { categoryId: catMap["الشيشة"], name: "شيشة ميجا بيري", price: 35 },
        { categoryId: catMap["الشيشة"], name: "شيشة كيوي", price: 35 },
        { categoryId: catMap["الشيشة"], name: "شيشة روبي كراش", price: 35 },
        { categoryId: catMap["الشيشة"], name: "شيشة تفاح فاخر", price: 35 },
        { categoryId: catMap["الشيشة"], name: "شيشة تفاح نخلة", price: 40 },
        { categoryId: catMap["الشيشة"], name: "شيشة ميكس فواكه", price: 40 },
        { categoryId: catMap["الشيشة"], name: "شيشة كازابلانكا", price: 50 },
        { categoryId: catMap["بلايستيشن"], name: "ساعة بلايستيشن", price: 20 },
        { categoryId: catMap["بلايستيشن"], name: "ساعة رباعي", price: 25 },
      ];
      for (const item of itemData) {
        await storage.createItem(item);
      }
      await storage.createStaff({ name: "أحمد (كاشير)", role: "cashier" });
      await storage.createStaff({ name: "محمد (ويتر)", role: "waiter" });
      console.log("[seed] Database seeded with initial data (38 items, 6 categories, 2 staff)");
    }
  } catch (e) {
    console.error("[seed] Failed to auto-seed:", e);
  }

  return httpServer;
}
