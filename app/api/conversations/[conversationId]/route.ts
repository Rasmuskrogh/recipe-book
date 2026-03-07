import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { conversationId } = await params;

  const isParticipant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId, userId },
    },
  });
  if (!isParticipant) {
    return NextResponse.json({ error: "Not in conversation" }, { status: 403 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const others = conversation.participants.filter((p) => p.userId !== userId).map((p) => p.user);
  const displayName = conversation.name || others.map((u) => u.name || u.username).join(", ") || "Konversation";

  return NextResponse.json({
    id: conversation.id,
    name: conversation.name,
    displayName,
    participants: conversation.participants.map((p) => ({
      id: p.user.id,
      name: p.user.name,
      username: p.user.username,
      image: p.user.image,
    })),
  });
}
