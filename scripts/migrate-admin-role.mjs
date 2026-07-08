#!/usr/bin/env node
/**
 * Agrega columna role a User sin borrar datos (Turso / SQLite).
 * Uso: node scripts/migrate-admin-role.mjs
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

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL?.replace(/^file:/, "file:");
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("Falta TURSO_DATABASE_URL o DATABASE_URL");
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

async function main() {
  const exists = await columnExists("User", "role");
  if (exists) {
    console.log("✓ Columna role ya existe en User");
  } else {
    await client.execute(`ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'patient'`);
    console.log("✓ Columna role agregada a User");
  }
  console.log("Migración admin completada.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
