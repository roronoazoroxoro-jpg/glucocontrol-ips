import { NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/db";
import { dbErrorResponse } from "@/lib/api-error";
import { ensureProductionDatabase } from "@/lib/init-db";
import { DEFAULT_REMINDERS } from "@/lib/reminders";
import {
  getSessionUser,
  sanitizeUser,
  unauthorizedResponse,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    await ensureProductionDatabase();
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();
    return NextResponse.json({ user: sanitizeUser(user) });
  } catch (error) {
    return dbErrorResponse("api/user GET", error);
  }
}

export async function POST(request: Request) {
  try {
    await ensureProductionDatabase();
    const sessionUser = await getSessionUser();
    if (!sessionUser) return unauthorizedResponse();

    const body = await request.json();
    const {
      name,
      diabetesType,
      targetMin,
      targetMax,
      doctorName,
      medications,
      mealTimes,
      glucoseIntervalHours,
      notificationsEnabled,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const user = await withDbTimeout(
      prisma.user.update({
        where: { id: sessionUser.id },
        data: {
          name: name.trim(),
          diabetesType: diabetesType ?? "tipo2",
          targetMin: targetMin ?? 70,
          targetMax: targetMax ?? 140,
          doctorName: doctorName?.trim() || null,
          medications: medications ? JSON.stringify(medications) : undefined,
          mealTimes: mealTimes ? JSON.stringify(mealTimes) : undefined,
          glucoseIntervalHours: glucoseIntervalHours ?? 4,
          notificationsEnabled: notificationsEnabled ?? true,
          profileComplete: true,
        },
      })
    );

    return NextResponse.json({ user: sanitizeUser(user) });
  } catch (error) {
    return dbErrorResponse("api/user POST", error);
  }
}

export async function PATCH(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return unauthorizedResponse();

    const body = await request.json();
    const data: Record<string, unknown> = {};

    if (body.name?.trim()) data.name = body.name.trim();
    if (body.diabetesType) data.diabetesType = body.diabetesType;
    if (body.targetMin != null) data.targetMin = body.targetMin;
    if (body.targetMax != null) data.targetMax = body.targetMax;
    if (body.doctorName !== undefined) data.doctorName = body.doctorName?.trim() || null;
    if (body.medications) data.medications = JSON.stringify(body.medications);
    if (body.mealTimes) data.mealTimes = JSON.stringify(body.mealTimes);
    if (body.glucoseIntervalHours != null) data.glucoseIntervalHours = body.glucoseIntervalHours;
    if (body.notificationsEnabled != null) data.notificationsEnabled = body.notificationsEnabled;

    const user = await withDbTimeout(
      prisma.user.update({ where: { id: sessionUser.id }, data })
    );

    return NextResponse.json({ user: sanitizeUser(user) });
  } catch (error) {
    return dbErrorResponse("api/user PATCH", error);
  }
}
