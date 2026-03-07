import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { pusherServer } from "@/lib/pusher/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const participants = await prisma.conversationParticipant.findMany({
    where: { userId },
    select: { conversationId: true, lastReadAt: true },
  });
  const conversationIds = participants.map((p) => p.conversationId);
  if (conversationIds.length === 0) {
    return NextResponse.json({ conversations: [] });
  }

  const participantByConv = new Map(participants.map((p) => [p.conversationId, p.lastReadAt]));

  const conversations = await prisma.conversation.findMany({
    where: { id: { in: conversationIds }, groupId: null },
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
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      },
    },
  });

  const unreadCounts = await Promise.all(
    conversations.map((c) => {
      const lastReadAt = participantByConv.get(c.id) ?? null;
      return prisma.message.count({
        where: {
          conversationId: c.id,
          senderId: { not: userId },
          ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {}),
        },
      });
    })
  );

  const withLastMessage = conversations.map((c, i) => {
    const lastMsg = c.messages[0];
    const otherParticipants = c.participants.filter((p) => p.userId !== userId).map((p) => p.user);
    const displayName = c.name || otherParticipants.map((u) => u.name || u.username).join(", ") || "Konversation";
    return {
      id: c.id,
      name: c.name,
      displayName,
      unreadCount: unreadCounts[i] ?? 0,
      participants: c.participants.map((p) => ({
        id: p.user.id,
        name: p.user.name,
        username: p.user.username,
        image: p.user.image,
      })),
      lastMessage: lastMsg
        ? {
            id: lastMsg.id,
            content: lastMsg.content,
            createdAt: lastMsg.createdAt,
            senderId: lastMsg.senderId,
            senderName: lastMsg.sender.name || lastMsg.sender.username,
          }
        : null,
    };
  });

  withLastMessage.sort((a, b) => {
    const aTime = a.lastMessage?.createdAt ?? new Date(0);
    const bTime = b.lastMessage?.createdAt ?? new Date(0);
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  return NextResponse.json({
    conversations: withLastMessage.map((c) => ({
      ...c,
      lastMessage: c.lastMessage
        ? {
            ...c.lastMessage,
            createdAt: c.lastMessage.createdAt.toISOString(),
          }
        : null,
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: { conversationId?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { conversationId, content } = body;
  if (!conversationId || typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "conversationId and content required" }, { status: 400 });
  }

  const isParticipant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId, userId },
    },
  });
  if (!isParticipant) {
    return NextResponse.json({ error: "Not in conversation" }, { status: 403 });
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: userId,
      content: content.trim(),
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
    },
  });

  const payload = {
    id: message.id,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
    senderId: message.senderId,
    sender: message.sender,
  };

  await pusherServer.trigger(`conversation-${conversationId}`, "new-message", { message: payload });

  return NextResponse.json({ message: payload }, { status: 201 });
}
