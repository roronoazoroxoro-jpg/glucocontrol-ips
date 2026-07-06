#!/usr/bin/env node
/**
 * Migración v3: auth multi-usuario. Ejecutar una vez en Turso:
 * node scripts/migrate-v3.mjs
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
  // env del sistema
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken) {
  console.error("Configurá .env.turso con TURSO_DATABASE_URL y TURSO_AUTH_TOKEN");
  process.exit(1);
}

const client = createClient({ url, authToken });

async function trySql(sql) {
  try {
    await client.execute(sql);
    console.log("OK:", sql.slice(0, 60));
  } catch (e) {
    if (String(e).includes("duplicate column") || String(e).includes("already exists")) {
      console.log("SKIP (ya existe):", sql.slice(0, 40));
    } else {
      console.warn("WARN:", e.message ?? e);
    }
  }
}

// Migrar tablas existentes
await trySql(`ALTER TABLE "User" ADD COLUMN "email" TEXT`);
await trySql(`ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT`);
await trySql(`ALTER TABLE "User" ADD COLUMN "profileComplete" BOOLEAN DEFAULT false`);
await trySql(`ALTER TABLE "User" ADD COLUMN "acceptedTermsAt" DATETIME`);
await trySql(`ALTER TABLE "GlucoseReading" ADD COLUMN "userId" TEXT`);
await trySql(`ALTER TABLE "MealEntry" ADD COLUMN "userId" TEXT`);
await trySql(`ALTER TABLE "ChatMessage" ADD COLUMN "userId" TEXT`);

// Schema completo para instalaciones nuevas
const schema = readFileSync(join(__dirname, "../scripts/apply-schema.mjs"), "utf8");
// Re-run apply-schema instead
client.close();
console.log("\nEjecutá también: node scripts/apply-schema.mjs");
console.log("Migración v3 completada.");
