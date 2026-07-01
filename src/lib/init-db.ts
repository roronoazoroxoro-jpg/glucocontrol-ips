import { prisma } from "./db";

let initialized = false;

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "diabetesType" TEXT NOT NULL DEFAULT 'tipo2',
    "targetMin" INTEGER NOT NULL DEFAULT 70,
    "targetMax" INTEGER NOT NULL DEFAULT 140,
    "doctorName" TEXT,
    "medications" TEXT,
    "mealTimes" TEXT,
    "glucoseIntervalHours" INTEGER NOT NULL DEFAULT 4,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS "GlucoseReading" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" INTEGER NOT NULL,
    "notes" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "MealEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'comida',
    "carbs" REAL NOT NULL DEFAULT 0,
    "sugar" REAL,
    "fat" REAL,
    "saturatedFat" REAL,
    "protein" REAL,
    "fiber" REAL,
    "sodium" REAL,
    "calories" REAL,
    "servingSize" TEXT,
    "autoAnalyzed" BOOLEAN NOT NULL DEFAULT true,
    "nutritionSource" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "NutritionCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "query" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "NutritionCache_query_key" ON "NutritionCache"("query");
`;

export async function ensureProductionDatabase() {
  if (initialized) return;

  const needsInit =
    process.env.TURSO_DATABASE_URL ||
    process.env.VERCEL ||
    (process.env.DATABASE_URL ?? "").includes("/tmp");

  if (!needsInit) {
    initialized = true;
    return;
  }

  if (process.env.TURSO_DATABASE_URL) {
    initialized = true;
    return;
  }

  try {
    const statements = SCHEMA_SQL.split(";")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await prisma.$executeRawUnsafe(statement);
    }
  } catch (error) {
    console.error("[ensureProductionDatabase]", error);
  } finally {
    initialized = true;
  }
}
