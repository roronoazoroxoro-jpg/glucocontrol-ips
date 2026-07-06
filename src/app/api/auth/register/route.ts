import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, withDbTimeout } from "@/lib/db";
import { dbErrorResponse } from "@/lib/api-error";
import {
  createSession,
  hashPassword,
  sanitizeUser,
  verifyPassword,
} from "@/lib/auth";
import { DEFAULT_REMINDERS } from "@/lib/reminders";

export const runtime = "nodejs";

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  name: z.string().min(2, "Ingresá tu nombre"),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "Debés aceptar los términos" }),
  }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      );
    }

    const { email, password, name } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await withDbTimeout(
      prisma.user.findUnique({ where: { email: normalizedEmail } })
    );
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await withDbTimeout(
      prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          name: name.trim(),
          mealTimes: JSON.stringify(DEFAULT_REMINDERS.mealTimes),
          medications: JSON.stringify([]),
          acceptedTermsAt: new Date(),
          profileComplete: false,
        },
      })
    );

    await createSession(user.id);
    return NextResponse.json({ user: sanitizeUser(user) });
  } catch (error) {
    return dbErrorResponse("api/auth/register", error);
  }
}
