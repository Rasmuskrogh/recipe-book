import { prisma } from "@/lib/db/prisma";

export async function getUnreadMessageCount(userId: string): Promise<number> {
  const participants = await prisma.conversationParticipant.findMany({
    where: { userId },
    select: { conversationId: true, lastReadAt: true },
  });
  const convIds = participants.map((p) => p.conversationId);
  const dmConversations = await prisma.conversation.findMany({
    where: { id: { in: convIds }, groupId: null },
    select: { id: true },
  });
  const dmIds = new Set(dmConversations.map((c) => c.id));
  const dmParticipants = participants.filter((p) => dmIds.has(p.conversationId));

  const counts = await Promise.all(
    dmParticipants.map((p) =>
      prisma.message.count({
        where: {
          conversationId: p.conversationId,
          senderId: { not: userId },
          ...(p.lastReadAt ? { createdAt: { gt: p.lastReadAt } } : {}),
        },
      })
    )
  );

  return counts.reduce((a, b) => a + b, 0);
}

export async function getUnreadGroupMessageCount(userId: string): Promise<number> {
  const participants = await prisma.conversationParticipant.findMany({
    where: { userId },
    select: { conversationId: true, lastReadAt: true },
  });
  const convIds = participants.map((p) => p.conversationId);
  const groupConversations = await prisma.conversation.findMany({
    where: { id: { in: convIds }, groupId: { not: null } },
    select: { id: true },
  });
  const groupConvIds = new Set(groupConversations.map((c) => c.id));
  const groupParticipants = participants.filter((p) => groupConvIds.has(p.conversationId));

  const counts = await Promise.all(
    groupParticipants.map((p) =>
      prisma.message.count({
        where: {
          conversationId: p.conversationId,
          senderId: { not: userId },
          ...(p.lastReadAt ? { createdAt: { gt: p.lastReadAt } } : {}),
        },
      })
    )
  );

  return counts.reduce((a, b) => a + b, 0);
}
