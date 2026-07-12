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
import {
  bmiCategory,
  computeBMI,
  getBpStatus,
  getCholesterolStatus,
  getHrStatus,
  parseConditions,
} from "@/lib/health";

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

    const [
      readings,
      meals,
      latest,
      recentChat,
      bloodPressures,
      latestBp,
      weights,
      latestWeight,
      heartRates,
      latestHr,
      latestChol,
      symptoms,
    ] = await Promise.all([
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
      prisma.bloodPressureReading.findMany({
        where: { userId: patient.id, createdAt: { gte: start, lte: end } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.bloodPressureReading.findFirst({
        where: { userId: patient.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.weightEntry.findMany({
        where: { userId: patient.id, createdAt: { gte: start, lte: end } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.weightEntry.findFirst({
        where: { userId: patient.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.heartRateReading.findMany({
        where: { userId: patient.id, createdAt: { gte: start, lte: end } },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.heartRateReading.findFirst({
        where: { userId: patient.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.cholesterolLab.findFirst({
        where: { userId: patient.id },
        orderBy: { measuredAt: "desc" },
      }),
      prisma.symptomLog.findMany({
        where: { userId: patient.id, createdAt: { gte: start, lte: end } },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    const stats = computeStats(readings, meals, patient.targetMin, patient.targetMax);
    const glucoseMeta = latest
      ? glucoseStatusLabel(latest.value, patient.targetMin, patient.targetMax)
      : null;
    const bmi =
      latestWeight && patient.heightCm
        ? computeBMI(latestWeight.weightKg, patient.heightCm)
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
      conditions: parseConditions(patient.conditions),
      latest,
      glucoseMeta,
      stats,
      recommendation,
      readings,
      meals,
      recentChat: recentChat.reverse(),
      bloodPressures,
      latestBp,
      bpStatus: latestBp ? getBpStatus(latestBp.systolic, latestBp.diastolic) : null,
      weights,
      latestWeight,
      bmi,
      bmiCategory: bmi != null ? bmiCategory(bmi) : null,
      heartRates,
      latestHr,
      hrStatus: latestHr ? getHrStatus(latestHr.bpm, latestHr.context) : null,
      latestChol,
      cholStatus: latestChol ? getCholesterolStatus(latestChol) : null,
      symptoms,
    });
  } catch (error) {
    return dbErrorResponse("api/admin/patients/[id]", error);
  }
}
