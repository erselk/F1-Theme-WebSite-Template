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
  contactMessage: {
    findMany: async () => [],
    create: async () => ({}),
    count: async () => 0,
  },
};

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | typeof mockPrismaClient | undefined;
}

// Veritabanı bağlantısı yoksa mock client kullan
// Eğer DATABASE_URL tanımlanmışsa, gerçek Prisma Client'ı kullan
const useMock = !process.env.DATABASE_URL; 

// Process environment'ın erişilemediği durumlarda mockPrismaClient'ı kullan
let prismaClient;
try {
  prismaClient = useMock ? mockPrismaClient : new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
  console.log("Prisma Client bağlantı durumu:", useMock ? "Mock client kullanılıyor" : "Gerçek veritabanına bağlanıldı");
} catch (error) {
  console.warn('Prisma Client oluşturulamadı, mock client kullanılıyor:', error);
  prismaClient = mockPrismaClient;
}

export const prisma = global.prisma || prismaClient;

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}