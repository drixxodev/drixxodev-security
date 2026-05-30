/**
 * lib/db.ts — Prisma Client singleton.
 *
 * Guards against multiple PrismaClient instances during Next.js hot-reload in
 * development (each hot-reload would otherwise open a new DB connection pool).
 *
 * Pattern: attach to globalThis in dev so the instance survives module re-evaluation.
 * In production (NODE_ENV === "production") a fresh instance is always created once.
 *
 * Usage:
 *   import { prisma } from "@/lib/db";
 *   const clients = await prisma.client.findMany();
 */

import { PrismaClient } from "@prisma/client";

// Extend the global type so TypeScript knows about our cached instance.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
