import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getReminderSettings } from "@/lib/reminders";

export async function GET() {
  const user = await prisma.user.findFirst();
  if (!user) return NextResponse.json({ reminders: null });

  const lastGlucose = await prisma.glucoseReading.findFirst({
    orderBy: { createdAt: "desc" },
  });

  const settings = getReminderSettings(user);

  return NextResponse.json({
    settings,
    doctorName: user.doctorName,
    lastGlucoseAt: lastGlucose?.createdAt ?? null,
  });
}
