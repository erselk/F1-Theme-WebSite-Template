import { PrismaClient } from '@prisma/client';

// Mock veri tabanı işlemleri için kullanılacak
const mockPrismaClient = {
  event: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
    deleteMany: async () => ({ count: 0 }),
  },
  blog: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
  },
  booking: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
  },
  user: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
  },
  simulator: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
  },
  payment: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
  },
};

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | typeof mockPrismaClient | undefined;
}

// Veritabanı bağlantısı yoksa mock client kullan
const useMock = process.env.NODE_ENV === 'production' || !process.env.DATABASE_URL;

// Process environment'ın erişilemediği durumlarda mockPrismaClient'ı kullan
let prismaClient;
try {
  prismaClient = useMock ? mockPrismaClient : new PrismaClient();
} catch (error) {
  console.warn('Prisma Client oluşturulamadı, mock client kullanılıyor:', error);
  prismaClient = mockPrismaClient;
}

export const prisma = global.prisma || prismaClient;

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}