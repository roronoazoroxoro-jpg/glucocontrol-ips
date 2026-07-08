import { NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/db";
import { dbErrorResponse } from "@/lib/api-error";
import {
  computeStats,
  getPeriodRange,
  getStaffUser,
  glucoseStatusLabel,
  sanitizePatientSummary,
  staffUnauthorizedResponse,
  type Period,
} from "@/lib/admin";
import { startOfDay } from "date-fns";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const staff = await getStaffUser();
    if (!staff) return staffUnauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") ?? "day") as Period;
    const { start, end } = getPeriodRange(period);
    const todayStart = startOfDay(new Date());

    const patients = await withDbTimeout(
      prisma.user.findMany({
        where: { role: "patient" },
        orderBy: { updatedAt: "desc" },
      })
    );

    const patientRows = await Promise.all(
      patients.map(async (patient) => {
        const [latestReading, readings, meals, mealsToday, readingsToday] = await Promise.all([
          prisma.glucoseReading.findFirst({
            where: { userId: patient.id },
            orderBy: { createdAt: "desc" },
          }),
          prisma.glucoseReading.findMany({
            where: { userId: patient.id, createdAt: { gte: start, lte: end } },
          }),
          prisma.mealEntry.findMany({
            where: { userId: patient.id, createdAt: { gte: start, lte: end } },
          }),
          prisma.mealEntry.count({
            where: { userId: patient.id, createdAt: { gte: todayStart } },
          }),
          prisma.glucoseReading.count({
            where: { userId: patient.id, createdAt: { gte: todayStart } },
          }),
        ]);

        const stats = computeStats(readings, meals, patient.targetMin, patient.targetMax);
        const glucoseMeta = latestReading
          ? glucoseStatusLabel(latestReading.value, patient.targetMin, patient.targetMax)
          : null;

        return {
          ...sanitizePatientSummary(patient),
          latestGlucose: latestReading?.value ?? null,
          latestGlucoseAt: latestReading?.createdAt ?? null,
          glucoseStatus: glucoseMeta?.label ?? "Sin datos",
          glucoseAlert: glucoseMeta?.alert ?? false,
          mealsToday,
          readingsToday,
          stats,
        };
      })
    );

    const alerts = patientRows.filter((p) => p.glucoseAlert).length;
    const activeToday = patientRows.filter((p) => p.mealsToday > 0 || p.readingsToday > 0).length;

    return NextResponse.json({
      period,
      updatedAt: new Date().toISOString(),
      summary: {
        totalPatients: patients.length,
        activeToday,
        alerts,
        profileIncomplete: patients.filter((p) => !p.profileComplete).length,
      },
      patients: patientRows,
    });
  } catch (error) {
    return dbErrorResponse("api/admin/overview", error);
  }
}
