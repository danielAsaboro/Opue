import { PrismaClient } from '@prisma/client';

// Global declaration for Prisma singleton in development
declare global {
    // Using var for global declaration per Prisma best practices
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

/**
 * Prisma Client singleton for database operations
 * In development, we attach it to globalThis to prevent too many connections
 * due to hot reloading
 */
export const prisma =
    globalThis.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
    });

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}

export default prisma;
