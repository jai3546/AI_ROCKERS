import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const getPrisma = () => {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/vidyai?schema=public";

  const isAccelerate = connectionString.startsWith("prisma://") || connectionString.startsWith("prisma+postgres://");

  let client: PrismaClient;
  if (isAccelerate) {
    client = new PrismaClient();
  } else {
    const adapter = new PrismaPg({ connectionString });
    client = new PrismaClient({ adapter });
  }

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
};

export const prisma = getPrisma();
export default prisma;
