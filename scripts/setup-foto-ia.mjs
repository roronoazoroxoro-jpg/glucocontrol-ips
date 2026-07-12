#!/usr/bin/env node
/**
 * Configura GEMINI_API_KEY en Vercel producción.
 * Uso: node scripts/setup-foto-ia.mjs AIza...
 *   o: npm run setup:foto -- AIza...
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import readline from "readline";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

let key = process.argv[2]?.trim();

async function promptKey() {
  console.log("\n🔑 VitalIPS — Configurar análisis de foto con IA\n");
  console.log("Obtené tu clave GRATIS en: https://aistudio.google.com/app/apikey\n");

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  key = await new Promise((resolve) => {
    rl.question("Pegá tu clave AIza...: ", (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function updateEnvFile() {
  const envPath = join(root, ".env");
  let content = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  if (/^GEMINI_API_KEY=/m.test(content)) {
    content = content.replace(/^GEMINI_API_KEY=.*$/m, `GEMINI_API_KEY=${key}`);
  } else {
    content += `\nGEMINI_API_KEY=${key}\n`;
  }
  writeFileSync(envPath, content, "utf8");
  console.log("✓ .env local actualizado");
}

function configureVercel() {
  try {
    execSync(`npx vercel env rm GEMINI_API_KEY production --yes`, { cwd: root, stdio: "ignore" });
  } catch {
    // puede no existir
  }
  execSync(`npx vercel env add GEMINI_API_KEY production --value "${key}" --yes --sensitive`, {
    cwd: root,
    stdio: "inherit",
  });
  console.log("✓ GEMINI_API_KEY configurada en Vercel producción");
}

async function main() {
  if (!key) await promptKey();
  if (!key || !key.startsWith("AIza")) {
    console.error("\n❌ Clave inválida. Debe empezar con AIza");
    process.exit(1);
  }

  updateEnvFile();
  configureVercel();

  console.log("\n✅ Listo. Desplegando...");
  execSync("npx vercel --prod --yes", { cwd: root, stdio: "inherit" });
  console.log("\n🎉 Análisis de foto con Gemini activado en producción.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
