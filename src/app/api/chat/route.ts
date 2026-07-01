import { NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/db";
import { dbErrorResponse } from "@/lib/api-error";
import { generateChatResponse } from "@/lib/ai";

export const runtime = "nodejs";

export async function GET() {
  try {
    const messages = await withDbTimeout(
      prisma.chatMessage.findMany({
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
    const body = await request.json();
    const { message } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
    }

    await withDbTimeout(
      prisma.chatMessage.create({
        data: { role: "user", content: message.trim() },
      })
    );

    const response = await generateChatResponse(message.trim());

    const assistantMessage = await withDbTimeout(
      prisma.chatMessage.create({
        data: { role: "assistant", content: response },
      })
    );

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    return dbErrorResponse("api/chat POST", error);
  }
}
