import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "./db";

export const SESSION_COOKIE = "gc_session";
const SESSION_DAYS = 30;

function getSecret() {
  const raw = process.env.AUTH_SECRET;
  if (!raw && process.env.NODE_ENV === "production") {
    console.warn("[auth] AUTH_SECRET no configurado — usar variable en Vercel");
  }
  return new TextEncoder().encode(raw || "glucocontrol-dev-secret-cambiar-en-produccion");
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSessionUserId(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Sesión requerida" }, { status: 401 });
}

export function forbiddenResponse() {
  return NextResponse.json({ error: "No autorizado" }, { status: 403 });
}

export function sanitizeUser(user: {
  id: string;
  email: string;
  name: string;
  diabetesType: string;
  targetMin: number;
  targetMax: number;
  doctorName: string | null;
  medications: string | null;
  mealTimes: string | null;
  glucoseIntervalHours: number;
  notificationsEnabled: boolean;
  profileComplete: boolean;
  role?: string;
  conditions?: string | null;
  heightCm?: number | null;
  bpTargetSys?: number | null;
  bpTargetDia?: number | null;
  createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role ?? "patient",
    diabetesType: user.diabetesType,
    conditions: user.conditions ?? "[]",
    heightCm: user.heightCm ?? null,
    targetMin: user.targetMin,
    targetMax: user.targetMax,
    bpTargetSys: user.bpTargetSys ?? 130,
    bpTargetDia: user.bpTargetDia ?? 80,
    doctorName: user.doctorName,
    medications: user.medications,
    mealTimes: user.mealTimes,
    glucoseIntervalHours: user.glucoseIntervalHours,
    notificationsEnabled: user.notificationsEnabled,
    profileComplete: user.profileComplete,
    createdAt: user.createdAt,
  };
}
