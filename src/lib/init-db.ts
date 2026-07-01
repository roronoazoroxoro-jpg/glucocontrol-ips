import { readFileSync } from "fs";
import { join } from "path";
import { prisma } from "./db";

let initialized = false;

export async function ensureProductionDatabase() {
  if (initialized) return;
  if (process.env.TURSO_DATABASE_URL) {
    initialized = true;
    return;
  }

  const dbUrl = process.env.DATABASE_URL ?? "";
  if (!dbUrl.includes("/tmp")) {
    initialized = true;
    return;
  }

  try {
    const schemaPath = join(process.cwd(), "prisma", "turso-schema.sql");
    const sql = readFileSync(schemaPath, "utf8");
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith("--"));

    for (const statement of statements) {
      await prisma.$executeRawUnsafe(statement);
    }
  } catch (error) {
    console.error("[ensureProductionDatabase]", error);
  } finally {
    initialized = true;
  }
}
