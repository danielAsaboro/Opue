import { PrismaClient } from '@prisma/client';

// Global declaration for Prisma singleton in development
// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
    // Using var for global declaration per Prisma best practices
    var prisma: PrismaClient | undefined;
}

/**
 * Prisma Client singleton for database operations
 * In development, we attach it to global to prevent too many connections
 * due to hot reloading
 */
export const prisma =
    global.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
    });

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

export default prisma;
