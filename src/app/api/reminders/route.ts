import { NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/db";
import { dbErrorResponse } from "@/lib/api-error";
import { getReminderSettings } from "@/lib/reminders";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const lastGlucose = await withDbTimeout(
      prisma.glucoseReading.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      })
    );

    const settings = getReminderSettings(user);

    return NextResponse.json({
      settings,
      doctorName: user.doctorName,
      lastGlucoseAt: lastGlucose?.createdAt ?? null,
    });
  } catch (error) {
    return dbErrorResponse("api/reminders", error);
  }
}
