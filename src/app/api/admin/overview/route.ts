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
import { getBpStatus, parseConditions } from "@/lib/health";
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
        const [
          latestReading,
          readings,
          meals,
          mealsToday,
          readingsToday,
          latestBp,
          latestSymptom,
        ] = await Promise.all([
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
          prisma.bloodPressureReading.findFirst({
            where: { userId: patient.id },
            orderBy: { createdAt: "desc" },
          }),
          prisma.symptomLog.findFirst({
            where: {
              userId: patient.id,
              OR: [
                { severity: { gte: 4 } },
                { type: { in: ["dolor_pecho", "falta_aire"] } },
              ],
              createdAt: { gte: todayStart },
            },
            orderBy: { createdAt: "desc" },
          }),
        ]);

        const stats = computeStats(readings, meals, patient.targetMin, patient.targetMax);
        const glucoseMeta = latestReading
          ? glucoseStatusLabel(latestReading.value, patient.targetMin, patient.targetMax)
          : null;
        const bpMeta = latestBp ? getBpStatus(latestBp.systolic, latestBp.diastolic) : null;
        const anyAlert = !!(glucoseMeta?.alert || bpMeta?.alert || latestSymptom);

        return {
          ...sanitizePatientSummary(patient),
          conditionsList: parseConditions(patient.conditions),
          latestGlucose: latestReading?.value ?? null,
          latestGlucoseAt: latestReading?.createdAt ?? null,
          glucoseStatus: glucoseMeta?.label ?? "Sin datos",
          glucoseAlert: glucoseMeta?.alert ?? false,
          latestBp: latestBp
            ? `${latestBp.systolic}/${latestBp.diastolic}`
            : null,
          bpStatus: bpMeta?.label ?? "Sin datos",
          bpAlert: bpMeta?.alert ?? false,
          symptomAlert: !!latestSymptom,
          anyAlert,
          mealsToday,
          readingsToday,
          stats,
        };
      })
    );

    const alerts = patientRows.filter((p) => p.anyAlert).length;
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
