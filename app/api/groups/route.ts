import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const groupsWithConv = await prisma.groupMember.findMany({
    where: { userId },
    include: {
      group: {
        include: {
          conversation: true,
        },
      },
    },
  });

  const result = await Promise.all(
    groupsWithConv.map(async (m) => {
      const conv = m.group.conversation;
      const lastMsg = conv
        ? await prisma.message.findFirst({
            where: { conversationId: conv.id },
            orderBy: { createdAt: "desc" },
            include: {
              sender: { select: { name: true, username: true } },
            },
          })
        : null;
      const lastReadAt = conv
        ? ((
            await prisma.conversationParticipant.findUnique({
              where: {
                conversationId_userId: { conversationId: conv.id, userId },
              },
              select: { lastReadAt: true },
            })
          )?.lastReadAt ?? null)
        : null;
      const unreadCount = conv
        ? await prisma.message.count({
            where: {
              conversationId: conv.id,
              senderId: { not: userId },
              ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {}),
            },
          })
        : 0;
      return {
        id: m.group.id,
        name: m.group.name,
        description: m.group.description,
        imageUrl: m.group.imageUrl,
        role: m.role,
        conversationId: conv?.id ?? null,
        lastMessage: lastMsg
          ? {
              content: lastMsg.content,
              createdAt: lastMsg.createdAt.toISOString(),
              senderName: lastMsg.sender.name || lastMsg.sender.username,
            }
          : null,
        unreadCount,
      };
    })
  );

  result.sort((a, b) => {
    const aTime = a.lastMessage?.createdAt ?? "";
    const bTime = b.lastMessage?.createdAt ?? "";
    return bTime.localeCompare(aTime);
  });

  return NextResponse.json({ groups: result });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: { name?: string; description?: string; memberIds?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { name, description, memberIds = [] } = body;
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }
  const memberIdList = Array.isArray(memberIds)
    ? [...new Set(memberIds.filter((id): id is string => typeof id === "string"))]
    : [];
  if (!memberIdList.includes(userId)) {
    memberIdList.push(userId);
  }

  const validUsers = await prisma.user.findMany({
    where: { id: { in: memberIdList } },
    select: { id: true },
  });
  const validIds = validUsers.map((u) => u.id);

  const result = await prisma.$transaction(async (tx) => {
    const group = await tx.group.create({
      data: {
        name: name.trim(),
        description: typeof description === "string" ? description.trim() || null : null,
      },
    });

    const conversation = await tx.conversation.create({
      data: {
        name: group.name,
        groupId: group.id,
      },
    });

    await tx.groupMember.createMany({
      data: validIds.map((id) => ({
        groupId: group.id,
        userId: id,
        role: id === userId ? "ADMIN" : "MEMBER",
      })),
    });

    await tx.conversationParticipant.createMany({
      data: validIds.map((id) => ({
        conversationId: conversation.id,
        userId: id,
      })),
    });

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      conversationId: conversation.id,
    };
  });

  return NextResponse.json({ group: result }, { status: 201 });
}
