import { PrismaClient } from '@prisma/client';

// Global declaration for Prisma singleton in development
declare global {
    // Using var for global declaration per Prisma best practices
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

/**
 * Prisma Client singleton for database operations
 * Uses DATABASE_URL from environment (standard Prisma convention)
 * In development, we attach it to globalThis to prevent too many connections
 * due to hot reloading
 */
function createPrismaClient(): PrismaClient {
    return new PrismaClient({
        log: process.env.NODE_ENV === 'development'
            ? ['error', 'warn']
            : ['error'],
    });
}

export const prisma = globalThis.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}

export default prisma;
