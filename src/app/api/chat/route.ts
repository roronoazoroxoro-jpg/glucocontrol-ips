import { NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/db";
import { dbErrorResponse } from "@/lib/api-error";
import { generateChatResponse } from "@/lib/ai";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const messages = await withDbTimeout(
      prisma.chatMessage.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
        take: 100,
      })
    );
    return NextResponse.json({ messages });
  } catch (error) {
    return dbErrorResponse("api/chat GET", error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { message } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
    }

    await withDbTimeout(
      prisma.chatMessage.create({
        data: { userId: user.id, role: "user", content: message.trim() },
      })
    );

    const response = await generateChatResponse(message.trim(), user.id);

    const assistantMessage = await withDbTimeout(
      prisma.chatMessage.create({
        data: { userId: user.id, role: "assistant", content: response },
      })
    );

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    return dbErrorResponse("api/chat POST", error);
  }
}
