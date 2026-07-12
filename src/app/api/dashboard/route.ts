import { NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/db";
import { dbErrorResponse } from "@/lib/api-error";
import { analyzeGlucose } from "@/lib/recommendations";
import { computeStats, getPeriodRange, type Period } from "@/lib/stats";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";
import {
  bmiCategory,
  computeBMI,
  getBpStatus,
  getCholesterolStatus,
  getHrStatus,
  parseConditions,
} from "@/lib/health";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") ?? "day") as Period;
    const { start, end } = getPeriodRange(period);

    const [
      readings,
      meals,
      latest,
      bloodPressures,
      latestBp,
      weights,
      latestWeight,
      heartRates,
      latestHr,
      latestChol,
      symptoms,
    ] = await Promise.all([
      withDbTimeout(
        prisma.glucoseReading.findMany({
          where: { userId: user.id, createdAt: { gte: start, lte: end } },
          orderBy: { createdAt: "asc" },
        })
      ),
      withDbTimeout(
        prisma.mealEntry.findMany({
          where: { userId: user.id, createdAt: { gte: start, lte: end } },
          orderBy: { createdAt: "desc" },
        })
      ),
      withDbTimeout(
        prisma.glucoseReading.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
        })
      ),
      withDbTimeout(
        prisma.bloodPressureReading.findMany({
          where: { userId: user.id, createdAt: { gte: start, lte: end } },
          orderBy: { createdAt: "desc" },
        })
      ),
      withDbTimeout(
        prisma.bloodPressureReading.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
        })
      ),
      withDbTimeout(
        prisma.weightEntry.findMany({
          where: { userId: user.id, createdAt: { gte: start, lte: end } },
          orderBy: { createdAt: "desc" },
        })
      ),
      withDbTimeout(
        prisma.weightEntry.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
        })
      ),
      withDbTimeout(
        prisma.heartRateReading.findMany({
          where: { userId: user.id, createdAt: { gte: start, lte: end } },
          orderBy: { createdAt: "desc" },
        })
      ),
      withDbTimeout(
        prisma.heartRateReading.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
        })
      ),
      withDbTimeout(
        prisma.cholesterolLab.findFirst({
          where: { userId: user.id },
          orderBy: { measuredAt: "desc" },
        })
      ),
      withDbTimeout(
        prisma.symptomLog.findMany({
          where: { userId: user.id, createdAt: { gte: start, lte: end } },
          orderBy: { createdAt: "desc" },
          take: 20,
        })
      ),
    ]);

    const stats = computeStats(readings, meals, user.targetMin, user.targetMax);
    const conditions = parseConditions(user.conditions);
    const bmi =
      latestWeight && user.heightCm
        ? computeBMI(latestWeight.weightKg, user.heightCm)
        : null;

    const recommendation = latest
      ? analyzeGlucose({
          glucose: latest.value,
          userName: user.name,
          diabetesType: user.diabetesType,
          targetMin: user.targetMin,
          targetMax: user.targetMax,
          recentMeals: meals.slice(0, 3).map((m) => ({ name: m.name, carbs: m.carbs })),
        })
      : null;

    return NextResponse.json({
      period,
      start: start.toISOString(),
      end: end.toISOString(),
      conditions,
      readings,
      meals,
      latest,
      stats,
      recommendation,
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
    return dbErrorResponse("api/dashboard", error);
  }
}
