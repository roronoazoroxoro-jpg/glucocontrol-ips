#!/usr/bin/env node
/**
 * Crea cuenta de doctor o admin.
 * Uso: node scripts/create-doctor.mjs email@ips.gov.ar "Nombre" password [admin|doctor]
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvFile(name) {
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

loadEnvFile(".env");

const useTurso = process.argv.includes("--turso");
if (useTurso) loadEnvFile(".env.turso");

const args = process.argv.slice(2).filter((a) => a !== "--turso");
const [emailArg, nameArg, passwordArg, roleArg] = args;
const email = emailArg?.toLowerCase().trim();
const name = nameArg?.trim();
const password = passwordArg;
const role = roleArg === "admin" ? "admin" : "doctor";

if (!email || !name || !password || password.length < 8) {
  console.error(
    'Uso: node scripts/create-doctor.mjs email@ips.gov.ar "Dr. Nombre" password123 [doctor|admin]'
  );
  process.exit(1);
}

function createPrisma() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;
  if (useTurso && tursoUrl && tursoToken) {
    return new PrismaClient({
      adapter: new PrismaLibSql({ url: tursoUrl, authToken: tursoToken }),
    });
  }
  return new PrismaClient();
}

const prisma = createPrisma();

async function main() {
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { name, passwordHash, role, profileComplete: true },
    });
    console.log(`✓ Usuario actualizado como ${role}: ${email}`);
  } else {
    await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role,
        profileComplete: true,
        acceptedTermsAt: new Date(),
        mealTimes: JSON.stringify(["07:30", "12:30", "20:00"]),
        medications: JSON.stringify([]),
      },
    });
    console.log(`✓ Cuenta ${role} creada: ${email}`);
  }
  console.log("Ingreso en: /admin/login");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
