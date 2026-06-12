import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const getPrisma = () => {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  // Connection URL matching prisma.config.ts/env
  const rawDbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";

  const adapter = new PrismaBetterSqlite3({ url: rawDbUrl });
  const client = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
};

export const prisma = getPrisma();
export default prisma;
