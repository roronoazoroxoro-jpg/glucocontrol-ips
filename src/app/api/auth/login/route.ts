import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, withDbTimeout } from "@/lib/db";
import { dbErrorResponse } from "@/lib/api-error";
import { createSession, sanitizeUser, verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Email o contraseña inválidos" }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const user = await withDbTimeout(
      prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    );

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
    }

    await createSession(user.id);
    return NextResponse.json({ user: sanitizeUser(user) });
  } catch (error) {
    return dbErrorResponse("api/auth/login", error);
  }
}
