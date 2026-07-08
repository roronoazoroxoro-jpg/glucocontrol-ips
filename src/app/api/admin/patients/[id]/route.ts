import { NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/db";
import { dbErrorResponse } from "@/lib/api-error";
import { analyzeGlucose } from "@/lib/recommendations";
import {
  computeStats,
  getPeriodRange,
  getStaffUser,
  glucoseStatusLabel,
  sanitizePatientSummary,
  staffUnauthorizedResponse,
  type Period,
} from "@/lib/admin";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const staff = await getStaffUser();
    if (!staff) return staffUnauthorizedResponse();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") ?? "week") as Period;
    const { start, end } = getPeriodRange(period);

    const patient = await withDbTimeout(
      prisma.user.findFirst({ where: { id, role: "patient" } })
    );
    if (!patient) {
      return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
    }

    const [readings, meals, latest, recentChat] = await Promise.all([
      prisma.glucoseReading.findMany({
        where: { userId: patient.id, createdAt: { gte: start, lte: end } },
        orderBy: { createdAt: "asc" },
      }),
      prisma.mealEntry.findMany({
        where: { userId: patient.id, createdAt: { gte: start, lte: end } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.glucoseReading.findFirst({
        where: { userId: patient.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.chatMessage.findMany({
        where: { userId: patient.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const stats = computeStats(readings, meals, patient.targetMin, patient.targetMax);
    const glucoseMeta = latest
      ? glucoseStatusLabel(latest.value, patient.targetMin, patient.targetMax)
      : null;

    const recommendation = latest
      ? analyzeGlucose({
          glucose: latest.value,
          userName: patient.name,
          diabetesType: patient.diabetesType,
          targetMin: patient.targetMin,
          targetMax: patient.targetMax,
          recentMeals: meals.slice(0, 3).map((m) => ({ name: m.name, carbs: m.carbs })),
        })
      : null;

    return NextResponse.json({
      period,
      updatedAt: new Date().toISOString(),
      patient: sanitizePatientSummary(patient),
      latest,
      glucoseMeta,
      stats,
      recommendation,
      readings,
      meals,
      recentChat: recentChat.reverse(),
    });
  } catch (error) {
    return dbErrorResponse("api/admin/patients/[id]", error);
  }
}
