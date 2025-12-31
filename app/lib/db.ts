/**
 * @file lib/db.ts
 * @description Prisma client singleton for database access
 * @author Team Kenya Dev
 */

import { PrismaClient } from '@prisma/client'

/**
 * Declare global Prisma client to prevent multiple instances in development
 */
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

/**
 * Create Prisma client with appropriate logging based on environment
 */
const createPrismaClient = () => {
  // For SQLite, we don't need an adapter
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
  
  return client
}

/**
 * Singleton Prisma client instance
 * In development, store in global to prevent hot-reload issues
 */
export const prisma: PrismaClient = global.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

/**
 * Gracefully disconnect Prisma on shutdown
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect()
}

export default prisma
