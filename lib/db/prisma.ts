/**
 * Prisma Client Singleton
 * Prevents multiple Prisma Client instances in development
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Test database connection with a simple query
 * @returns Promise<boolean> - true if connection successful
 */
export async function testConnection(): Promise<boolean> {
  try {
    console.log('Testing database connection...');
    const result = await prisma.$queryRaw<
      Array<{ result: number }>
    >`SELECT 1 as result`;
    console.log('Database connection successful:', result);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return false;
  }
}
