// apps/api/server/utils/database.ts
import { PrismaClient } from './gen/prisma/client';

let prisma: PrismaClient;

declare global {
  var __prisma: PrismaClient | undefined;
}

// Initialize Prisma Client
const initializePrisma = () => {
  const config = useRuntimeConfig();

  return new PrismaClient({
    datasources: {
      db: {
        url: config.databaseUrl,
      },
    },
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });
};

// Singleton pattern for Prisma Client
if (process.env.NODE_ENV === 'production') {
  prisma = initializePrisma();
} else {
  if (!global.__prisma) {
    global.__prisma = initializePrisma();
  }
  prisma = global.__prisma;
}

export { prisma };

// Database connection test
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection() {
  await prisma.$disconnect();
}

// Health check for database
export async function getDatabaseHealth() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - start;

    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Transaction wrapper with error handling
export async function withTransaction<T>(
  callback: (tx: PrismaClient) => Promise<T>,
): Promise<T> {
  try {
    return await prisma.$transaction(callback, {
      maxWait: 5000, // 5 seconds
      timeout: 30000, // 30 seconds
    });
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

// Pagination helpers
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function createPaginationOptions(query: any): PaginationOptions {
  return {
    page: Math.max(1, parseInt(query.page) || 1),
    limit: Math.min(100, Math.max(1, parseInt(query.limit) || 20)),
    sortBy: query.sortBy || 'createdAt',
    sortOrder: query.sortOrder === 'asc' ? 'asc' : 'desc',
  };
}

export function createPrismaOrderBy(sortBy: string, sortOrder: 'asc' | 'desc') {
  // Handle nested sorting (e.g., 'user.name')
  if (sortBy.includes('.')) {
    const [relation, field] = sortBy.split('.');
    return {
      [relation]: {
        [field]: sortOrder,
      },
    };
  }

  return { [sortBy]: sortOrder };
}

export function createPaginationResult<T>(
  items: T[],
  total: number,
  options: PaginationOptions,
): PaginationResult<T> {
  const { page = 1, limit = 20 } = options;
  const totalPages = Math.ceil(total / limit);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

// Search helpers for full-text search
export function createSearchFilter(query: string, fields: string[]): any {
  if (!query?.trim()) return {};

  // PostgreSQL full-text search
  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: query,
        mode: 'insensitive',
      },
    })),
  };
}

export function createFullTextSearch(
  query: string,
  searchVector: string = 'searchVector',
): any {
  if (!query?.trim()) return {};

  // PostgreSQL tsvector search
  return {
    [searchVector]: {
      search: query.split(' ').join(' & '),
    },
  };
}

// Soft delete helpers
export const notDeleted = {
  deletedAt: null,
};

export function withSoftDelete<T extends Record<string, any>>(
  where: T = {} as T,
): T {
  return {
    ...where,
    ...notDeleted,
  };
}

// Audit log helper
export async function createAuditLog(data: {
  entity: string;
  entityId: string;
  action: string;
  details?: any;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        ...data,
        details: data.details ? JSON.stringify(data.details) : null,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error to avoid breaking the main operation
  }
}

// Batch operations
export async function batchDelete(
  model: keyof PrismaClient,
  ids: string[],
): Promise<{ count: number }> {
  return await (prisma[model] as any).deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
}

export async function batchUpdate(
  model: keyof PrismaClient,
  ids: string[],
  data: Record<string, any>,
): Promise<{ count: number }> {
  return await (prisma[model] as any).updateMany({
    where: {
      id: {
        in: ids,
      },
    },
    data,
  });
}

// Connection pool monitoring
export function getConnectionPoolStatus() {
  // This would be implementation-specific based on your database provider
  // For now, return basic info
  return {
    connected: true,
    // Add more metrics as needed
  };
}
