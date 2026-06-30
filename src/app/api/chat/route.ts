import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateChatResponse } from "@/lib/ai";

export async function GET() {
  const messages = await prisma.chatMessage.findMany({
    orderBy: { createdAt: "asc" },
    take: 100,
  });
  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { message } = body;

  if (!message?.trim()) {
    return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
  }

  await prisma.chatMessage.create({
    data: { role: "user", content: message.trim() },
  });

  const response = await generateChatResponse(message.trim());

  const assistantMessage = await prisma.chatMessage.create({
    data: { role: "assistant", content: response },
  });

  return NextResponse.json({ message: assistantMessage });
}
