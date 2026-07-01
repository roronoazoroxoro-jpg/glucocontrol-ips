#!/usr/bin/env node
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Cargar .env.turso si existe (generado por vercel env pull)
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

const client = createClient({ url, authToken });
const schema = readFileSync(join(__dirname, "../prisma/turso-schema.sql"), "utf8");

for (const stmt of schema.split(";").map((s) => s.trim()).filter((s) => s && !s.startsWith("--"))) {
  await client.execute(stmt);
  console.log("OK:", stmt.slice(0, 50) + "...");
}

client.close();
console.log("\nEsquema aplicado en Turso.");
