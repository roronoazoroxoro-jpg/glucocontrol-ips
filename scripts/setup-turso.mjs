#!/usr/bin/env node
/**
 * Configura Turso para producción.
 * Requiere: TURSO_PLATFORM_TOKEN y TURSO_ORG (de turso.tech → Settings → API Tokens)
 *
 * Uso: node scripts/setup-turso.mjs
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_NAME = "glucocontrol-ips";

async function main() {
  const org = process.env.TURSO_ORG;
  const platformToken = process.env.TURSO_PLATFORM_TOKEN;

  if (!org || !platformToken) {
    console.error("Faltan TURSO_ORG y TURSO_PLATFORM_TOKEN.");
    console.error("1. Creá cuenta en https://turso.tech");
    console.error("2. turso auth login && turso auth api-tokens mint glucocontrol --org TU_ORG");
    process.exit(1);
  }

  const { createClient: createTursoClient } = await import("@tursodatabase/api");
  const turso = createTursoClient({ org, token: platformToken });

  let db;
  try {
    db = await turso.databases.create(DB_NAME, { group: "default" });
    console.log("Base de datos creada:", db.name);
  } catch (e) {
    if (String(e).includes("409") || String(e).includes("already exists")) {
      db = await turso.databases.get(DB_NAME);
      console.log("Base de datos ya existe:", db.name);
    } else {
      throw e;
    }
  }

  const { jwt } = await turso.databases.createToken(DB_NAME, {
    expiration: "never",
    authorization: "full-access",
  });

  const url = `libsql://${DB_NAME}-${org}.turso.io`;
  console.log("\n=== Variables para Vercel ===");
  console.log(`TURSO_DATABASE_URL=${url}`);
  console.log(`TURSO_AUTH_TOKEN=${jwt}`);

  const libsql = createClient({ url, authToken: jwt });
  const schema = readFileSync(join(__dirname, "../prisma/turso-schema.sql"), "utf8");
  const statements = schema
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("--"));

  for (const stmt of statements) {
    await libsql.execute(stmt);
  }
  console.log("\nEsquema aplicado correctamente.");
  libsql.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
