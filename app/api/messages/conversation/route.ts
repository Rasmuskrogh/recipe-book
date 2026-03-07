import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: { userId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const otherUserId = body.userId;
  if (!otherUserId || typeof otherUserId !== "string") {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  if (otherUserId === userId) {
    return NextResponse.json({ error: "Cannot start conversation with yourself" }, { status: 400 });
  }

  const otherUser = await prisma.user.findUnique({
    where: { id: otherUserId },
    select: { id: true },
  });
  if (!otherUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const myDms = await prisma.conversation.findMany({
    where: {
      groupId: null,
      participants: { some: { userId } },
    },
    include: {
      participants: { select: { userId: true } },
    },
  });

  const existing = myDms.find((c) => {
    const ids = c.participants.map((p) => p.userId);
    return ids.length === 2 && ids.includes(userId) && ids.includes(otherUserId);
  });

  if (existing) {
    return NextResponse.json({ conversationId: existing.id });
  }

  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId }, { userId: otherUserId }],
      },
    },
  });

  return NextResponse.json({ conversationId: conversation.id }, { status: 201 });
}
