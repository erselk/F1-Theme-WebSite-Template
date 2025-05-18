import { PrismaClient } from '@prisma/client';

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

declare global {
  var prisma: PrismaClient | typeof mockPrismaClient | undefined;
}

const useMock = !process.env.DATABASE_URL; 

let prismaClient;
try {
  prismaClient = useMock ? mockPrismaClient : new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
} catch (error) {
  prismaClient = mockPrismaClient;
}

export const prisma = global.prisma || prismaClient;

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}