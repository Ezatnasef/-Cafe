import { z } from 'zod';
import { insertStaffSchema, insertCategorySchema, insertItemSchema, insertCustomerSchema, insertSessionSchema, staff, categories, items, customers, sessions, orderItems } from './schema';

// Re-export types for convenience
export type { InsertStaff, InsertCategory, InsertItem, InsertCustomer, InsertSession } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  staff: {
    list: {
      method: 'GET' as const,
      path: '/api/staff' as const,
      responses: {
        200: z.array(z.custom<typeof staff.$inferSelect>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/staff' as const,
      input: insertStaffSchema,
      responses: {
        201: z.custom<typeof staff.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/staff/:id' as const,
      input: insertStaffSchema.partial(),
      responses: {
        200: z.custom<typeof staff.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/staff/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      }
    }
  },
  categories: {
    list: {
      method: 'GET' as const,
      path: '/api/categories' as const,
      responses: {
        200: z.array(z.custom<typeof categories.$inferSelect>()),
      }
    }
  },
  items: {
    list: {
      method: 'GET' as const,
      path: '/api/items' as const,
      responses: {
        200: z.array(z.custom<typeof items.$inferSelect>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/items' as const,
      input: insertItemSchema,
      responses: {
        201: z.custom<typeof items.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/items/:id' as const,
      input: insertItemSchema.partial(),
      responses: {
        200: z.custom<typeof items.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/items/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      }
    }
  },
  customers: {
    list: {
      method: 'GET' as const,
      path: '/api/customers' as const,
      responses: {
        200: z.array(z.custom<typeof customers.$inferSelect>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/customers' as const,
      input: insertCustomerSchema,
      responses: {
        201: z.custom<typeof customers.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/customers/:id' as const,
      input: insertCustomerSchema.partial(),
      responses: {
        200: z.custom<typeof customers.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/customers/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      }
    }
  },
  sessions: {
    list: {
      method: 'GET' as const,
      path: '/api/sessions' as const,
      input: z.object({
        status: z.string().optional(), // active, completed
      }).optional(),
      responses: {
        200: z.array(z.any()), // returning sessions with items attached
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/sessions/:id' as const,
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/sessions' as const,
      input: insertSessionSchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
      }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/sessions/:id' as const,
      input: insertSessionSchema.partial(),
      responses: {
        200: z.any(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      }
    },
    checkout: {
      method: 'POST' as const,
      path: '/api/sessions/:id/checkout' as const,
      input: z.object({ paymentMethod: z.string() }),
      responses: {
        200: z.any(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      }
    },
    addItem: {
      method: 'POST' as const,
      path: '/api/sessions/:id/items' as const,
      input: z.object({
        itemId: z.coerce.number(),
        quantity: z.coerce.number().default(1)
      }),
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      }
    },
    updateItem: {
      method: 'PUT' as const,
      path: '/api/sessions/:sessionId/items/:id' as const,
      input: z.object({
        quantity: z.coerce.number()
      }),
      responses: {
        200: z.any(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      }
    },
    deleteItem: {
      method: 'DELETE' as const,
      path: '/api/sessions/:sessionId/items/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      }
    }
  },
  reports: {
    daily: {
      method: 'GET' as const,
      path: '/api/reports/daily' as const,
      input: z.object({ date: z.string().optional() }).optional(),
      responses: {
        200: z.object({
          totalSales: z.number(),
          totalOrders: z.number(),
          bestSellingItem: z.string().nullable(),
          salesByCategory: z.record(z.string(), z.number()),
          staffProfits: z.record(z.string(), z.number())
        })
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
