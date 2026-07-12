#!/usr/bin/env node
/**
 * Migración no destructiva: columnas de salud integral + tablas nuevas (Turso/SQLite).
 * Uso: node scripts/migrate-salud-integral.mjs
 *      node scripts/migrate-salud-integral.mjs --turso
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const useTurso = process.argv.includes("--turso");

function loadEnv(name) {
  try {
    const envFile = readFileSync(join(__dirname, "..", name), "utf8");
    for (const line of envFile.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, "");
    }
  } catch {
    // ignore
  }
}

loadEnv(".env");
if (useTurso) loadEnv(".env.turso");

const url = useTurso
  ? process.env.TURSO_DATABASE_URL
  : process.env.DATABASE_URL?.startsWith("file:")
    ? process.env.DATABASE_URL
    : "file:./prisma/dev.db";

const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("Falta DATABASE_URL o TURSO_DATABASE_URL");
  process.exit(1);
}

const client =
  url.startsWith("libsql://") || url.startsWith("https://")
    ? createClient({ url, authToken: authToken ?? undefined })
    : createClient({ url });

async function columnExists(table, column) {
  const r = await client.execute(`PRAGMA table_info("${table}")`);
  return r.rows.some((row) => row.name === column);
}

async function tableExists(table) {
  const r = await client.execute(
    `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
    [table]
  );
  return r.rows.length > 0;
}

async function addColumn(table, column, def) {
  if (await columnExists(table, column)) {
    console.log(`  · ${table}.${column} ya existe`);
    return;
  }
  await client.execute(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${def}`);
  console.log(`  ✓ ${table}.${column} agregada`);
}

async function main() {
  console.log(useTurso ? "Migrando Turso..." : "Migrando SQLite local...");

  await addColumn("User", "conditions", `TEXT NOT NULL DEFAULT '[]'`);
  await addColumn("User", "heightCm", `REAL`);
  await addColumn("User", "bpTargetSys", `INTEGER NOT NULL DEFAULT 130`);
  await addColumn("User", "bpTargetDia", `INTEGER NOT NULL DEFAULT 80`);

  const tables = [
    [
      "BloodPressureReading",
      `CREATE TABLE "BloodPressureReading" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "systolic" INTEGER NOT NULL,
        "diastolic" INTEGER NOT NULL,
        "pulse" INTEGER,
        "notes" TEXT,
        "source" TEXT NOT NULL DEFAULT 'manual',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      )`,
      `CREATE INDEX IF NOT EXISTS "BloodPressureReading_userId_createdAt_idx" ON "BloodPressureReading"("userId", "createdAt")`,
    ],
    [
      "WeightEntry",
      `CREATE TABLE "WeightEntry" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "weightKg" REAL NOT NULL,
        "notes" TEXT,
        "source" TEXT NOT NULL DEFAULT 'manual',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      )`,
      `CREATE INDEX IF NOT EXISTS "WeightEntry_userId_createdAt_idx" ON "WeightEntry"("userId", "createdAt")`,
    ],
    [
      "HeartRateReading",
      `CREATE TABLE "HeartRateReading" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "bpm" INTEGER NOT NULL,
        "context" TEXT NOT NULL DEFAULT 'reposo',
        "notes" TEXT,
        "source" TEXT NOT NULL DEFAULT 'manual',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      )`,
      `CREATE INDEX IF NOT EXISTS "HeartRateReading_userId_createdAt_idx" ON "HeartRateReading"("userId", "createdAt")`,
    ],
    [
      "CholesterolLab",
      `CREATE TABLE "CholesterolLab" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "total" REAL,
        "ldl" REAL,
        "hdl" REAL,
        "triglycerides" REAL,
        "notes" TEXT,
        "measuredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      )`,
      `CREATE INDEX IF NOT EXISTS "CholesterolLab_userId_measuredAt_idx" ON "CholesterolLab"("userId", "measuredAt")`,
    ],
    [
      "SymptomLog",
      `CREATE TABLE "SymptomLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "severity" INTEGER NOT NULL DEFAULT 2,
        "notes" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      )`,
      `CREATE INDEX IF NOT EXISTS "SymptomLog_userId_createdAt_idx" ON "SymptomLog"("userId", "createdAt")`,
    ],
  ];

  for (const [name, createSql, indexSql] of tables) {
    if (await tableExists(name)) {
      console.log(`  · Tabla ${name} ya existe`);
    } else {
      await client.execute(createSql);
      await client.execute(indexSql);
      console.log(`  ✓ Tabla ${name} creada`);
    }
  }

  console.log("Migración salud integral completada.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
