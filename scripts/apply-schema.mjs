#!/usr/bin/env node
/**
 * Aplica schema v3 completo en Turso (recrea tablas).
 * Uso: node scripts/apply-schema.mjs
 */
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
  console.error("Faltan TURSO_DATABASE_URL y TURSO_AUTH_TOKEN (.env.turso o entorno)");
  process.exit(1);
}

const DROP_SQL = `
DROP TABLE IF EXISTS "ChatMessage";
DROP TABLE IF EXISTS "MealEntry";
DROP TABLE IF EXISTS "GlucoseReading";
DROP TABLE IF EXISTS "NutritionCache";
DROP TABLE IF EXISTS "User";
`;

const SCHEMA_SQL = `
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "diabetesType" TEXT NOT NULL DEFAULT 'tipo2',
    "targetMin" INTEGER NOT NULL DEFAULT 70,
    "targetMax" INTEGER NOT NULL DEFAULT 140,
    "doctorName" TEXT,
    "medications" TEXT,
    "mealTimes" TEXT,
    "glucoseIntervalHours" INTEGER NOT NULL DEFAULT 4,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "profileComplete" BOOLEAN NOT NULL DEFAULT false,
    "acceptedTermsAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "GlucoseReading" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "notes" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX "GlucoseReading_userId_createdAt_idx" ON "GlucoseReading"("userId", "createdAt");
CREATE TABLE "MealEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX "MealEntry_userId_createdAt_idx" ON "MealEntry"("userId", "createdAt");
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX "ChatMessage_userId_createdAt_idx" ON "ChatMessage"("userId", "createdAt");
CREATE TABLE "NutritionCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "query" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "NutritionCache_query_key" ON "NutritionCache"("query");
`;

const client = createClient({ url, authToken });

console.log("Eliminando tablas anteriores...");
for (const stmt of DROP_SQL.split(";").map((s) => s.trim()).filter(Boolean)) {
  await client.execute(stmt);
}

console.log("Creando schema v3...");
for (const stmt of SCHEMA_SQL.split(";").map((s) => s.trim()).filter(Boolean)) {
  await client.execute(stmt);
  console.log("OK:", stmt.split("\n")[0]);
}

client.close();
console.log("\nSchema v3 aplicado en Turso.");
