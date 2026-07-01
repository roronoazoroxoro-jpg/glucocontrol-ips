#!/usr/bin/env node
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";

const __dirname = dirname(fileURLToPath(import.meta.url));

try {
  const envFile = readFileSync(join(__dirname, "../.env.turso"), "utf8");
  for (const line of envFile.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, "");
  }
} catch {
  // usar variables del entorno
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Faltan TURSO_DATABASE_URL y TURSO_AUTH_TOKEN");
  process.exit(1);
}

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

const client = createClient({ url, authToken });

for (const stmt of SCHEMA_SQL.split(";").map((s) => s.trim()).filter(Boolean)) {
  await client.execute(stmt);
  console.log("OK:", stmt.split("\n")[0]);
}

const tables = await client.execute(
  "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
);
console.log("\nTablas:", tables.rows.map((r) => r.name).join(", "));
client.close();
