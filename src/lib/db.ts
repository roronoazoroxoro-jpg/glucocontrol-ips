import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;
  const log = process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"];

  if (tursoUrl) {
    const adapter = new PrismaLibSql({
      url: tursoUrl,
      authToken: tursoToken,
    });
    return new PrismaClient({ adapter, log: log as ["error", "warn"] });
  }

  // SQLite en archivo no funciona en Vercel serverless — libsql en memoria hasta configurar Turso
  if (process.env.VERCEL) {
    const adapter = new PrismaLibSql({ url: ":memory:" });
    return new PrismaClient({ adapter, log: log as ["error", "warn"] });
  }

  return new PrismaClient({ log: log as ["error", "warn"] });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prisma;

export async function withDbTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Database timeout")), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
