#!/usr/bin/env node
/**
 * Provisiona Turso + Vercel en un solo paso (requiere turso auth login previo en WSL).
 * Uso: node scripts/provision-all.mjs
 */
import { execSync, spawnSync } from "child_process";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_NAME = "VitalIPS-ips";
const TURSO = "wsl -d kali-linux bash -lc";
const TOOLS = "/mnt/c/Users/mcneumaticos/Desktop/Proyecto para diabeticos/tools";

function turso(cmd) {
  const full = `${TURSO} "cd '${TOOLS}' && ./turso ${cmd} 2>&1"`;
  return execSync(full, { encoding: "utf8" }).trim();
}

function vercelEnvAdd(name, value) {
  spawnSync(
    "npx",
    ["vercel", "env", "add", name, "production", "--value", value, "--yes", "--force"],
    { stdio: "inherit", shell: true, cwd: join(__dirname, "..") }
  );
}

async function main() {
  console.log("Verificando login Turso...");
  const whoami = turso("auth whoami");
  if (whoami.includes("not logged in")) {
    console.error("\nNo estás logueado en Turso.");
    console.error("Ejecutá: wsl -d kali-linux bash -lc \"cd tools && ./turso auth login --headless\"");
    console.error("Y abrí la URL en el navegador para login con GitHub.");
    process.exit(1);
  }
  console.log("Usuario Turso:", whoami);

  try {
    turso(`db create ${DB_NAME} --location iad`);
    console.log("Base de datos creada.");
  } catch {
    console.log("Base de datos ya existe o creada.");
  }

  const dbUrl = turso(`db show ${DB_NAME} --url`);
  const token = turso(`db tokens create ${DB_NAME}`);

  console.log("\nURL:", dbUrl);
  console.log("Configurando Vercel...");

  vercelEnvAdd("TURSO_DATABASE_URL", dbUrl);
  vercelEnvAdd("TURSO_AUTH_TOKEN", token);

  const libsql = createClient({ url: dbUrl, authToken: token });
  const schema = readFileSync(join(__dirname, "../prisma/turso-schema.sql"), "utf8");
  for (const stmt of schema.split(";").map((s) => s.trim()).filter((s) => s && !s.startsWith("--"))) {
    await libsql.execute(stmt);
  }
  libsql.close();

  console.log("\nEsquema aplicado. Redeploy...");
  execSync("npx vercel --prod --yes", { stdio: "inherit", cwd: join(__dirname, "..") });
  console.log("\nListo: https://VitalIPS-ips.vercel.app/app");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
