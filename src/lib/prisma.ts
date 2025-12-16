import { PrismaClient } from '@prisma/client';

// Global declaration for Prisma singleton in development
declare global {
    // Using var for global declaration per Prisma best practices
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

/**
 * Get the database URL based on DB_ENV environment variable
 * Set DB_ENV to "local" or "testing" in .env.local to switch databases
 */
function getDatabaseUrl(): string {
    const dbEnv = process.env.DB_ENV || 'local';

    if (dbEnv === 'testing') {
        const testingUrl = process.env.DATABASE_URL_TESTING;
        if (testingUrl) {
            console.log('[Prisma] Using TESTING database');
            return testingUrl;
        }
    }

    const localUrl = process.env.DATABASE_URL_LOCAL || process.env.DATABASE_URL;
    if (localUrl) {
        console.log('[Prisma] Using LOCAL database');
        return localUrl;
    }

    throw new Error('No database URL configured. Set DATABASE_URL_LOCAL or DATABASE_URL_TESTING in .env.local');
}

/**
 * Prisma Client singleton for database operations
 * In development, we attach it to globalThis to prevent too many connections
 * due to hot reloading
 *
 * Database selection is controlled by DB_ENV environment variable:
 * - DB_ENV=local  -> Uses DATABASE_URL_LOCAL
 * - DB_ENV=testing -> Uses DATABASE_URL_TESTING
 */
function createPrismaClient(): PrismaClient {
    const databaseUrl = getDatabaseUrl();

    return new PrismaClient({
        log: process.env.NODE_ENV === 'development'
            ? ['error', 'warn']  // Reduced logging for cleaner output
            : ['error'],
        datasources: {
            db: {
                url: databaseUrl,
            },
        },
    });
}

export const prisma = globalThis.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}

export default prisma;
