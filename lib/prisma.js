import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'stdout', level: 'error' },
      { emit: 'stdout', level: 'info' },
      { emit: 'stdout', level: 'warn' },
    ],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
