import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, withDbTimeout } from "@/lib/db";
import { dbErrorResponse } from "@/lib/api-error";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

export const runtime = "nodejs";

const schema = z.object({
  type: z.string().min(2).max(60),
  severity: z.number().int().min(1).max(5).default(2),
  notes: z.string().max(500).optional().nullable(),
});

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();
    const symptoms = await withDbTimeout(
      prisma.symptomLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 30,
      })
    );
    return NextResponse.json({ symptoms });
  } catch (error) {
    return dbErrorResponse("api/vitals/symptoms GET", error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Síntoma inválido" }, { status: 400 });
    }

    const emergency =
      parsed.data.type === "dolor_pecho" ||
      (parsed.data.type === "falta_aire" && parsed.data.severity >= 4) ||
      parsed.data.severity >= 5;

    const symptom = await withDbTimeout(
      prisma.symptomLog.create({
        data: {
          userId: user.id,
          type: parsed.data.type,
          severity: parsed.data.severity,
          notes: parsed.data.notes ?? null,
        },
      })
    );

    return NextResponse.json({
      symptom,
      emergency,
      message: emergency
        ? "Síntoma de alerta: consultá de inmediato a tu médico o urgencias IPS."
        : "Síntoma registrado. Tu médico podrá verlo en el panel.",
    });
  } catch (error) {
    return dbErrorResponse("api/vitals/symptoms POST", error);
  }
}
