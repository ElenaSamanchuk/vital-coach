import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { Pool } from "pg";

function createPrismaClient() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";

  if (url.startsWith("postgresql://")) {
    const pool = new Pool({ connectionString: url });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }

  const dbPath = url.replace("file:", "");
  const resolved = path.isAbsolute(dbPath) ? dbPath : path.join(process.cwd(), dbPath);
  const adapter = new PrismaBetterSqlite3({ url: resolved });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
