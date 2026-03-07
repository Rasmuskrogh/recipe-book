import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { GroupChatPage } from "./GroupChatPage";
import styles from "./page.module.css";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: groupId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    notFound();
  }
  const userId = session.user.id;

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  if (!membership) {
    notFound();
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      conversation: { select: { id: true } },
    },
  });
  if (!group?.conversation) {
    notFound();
  }

  const [messages, members] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId: group.conversation.id },
      orderBy: { createdAt: "asc" },
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
    }),
    prisma.groupMember.findMany({
      where: { groupId },
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
    }),
  ]);

  const initialMessages = messages.map((m) => ({
    id: m.id,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
    senderId: m.senderId,
    sender: m.sender,
  }));

  const initialMembers = members.map((m) => ({
    id: m.user.id,
    name: m.user.name,
    username: m.user.username,
    image: m.user.image,
    role: m.role,
  }));

  return (
    <div className={styles.page}>
      <GroupChatPage
        groupId={groupId}
        groupName={group.name}
        groupDescription={group.description}
        conversationId={group.conversation.id}
        currentUserId={userId}
        initialMessages={initialMessages}
        initialMembers={initialMembers}
      />
    </div>
  );
}
