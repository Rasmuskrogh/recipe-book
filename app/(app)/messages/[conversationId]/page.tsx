import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { ChatView } from "./ChatView";
import styles from "./page.module.css";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    notFound();
  }
  const userId = session.user.id;

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId, userId },
    },
  });
  if (!participant) {
    notFound();
  }

  const [conversation, messages] = await Promise.all([
    prisma.conversation.findUnique({
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
    }),
    prisma.message.findMany({
      where: { conversationId },
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
  ]);

  if (!conversation) notFound();

  const others = conversation.participants
    .filter((p) => p.userId !== userId)
    .map((p) => p.user);
  const displayName =
    conversation.name ||
    others.map((u) => u.name || u.username).join(", ") ||
    "Konversation";

  const initialMessages = messages.map((m) => ({
    id: m.id,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
    senderId: m.senderId,
    sender: m.sender,
  }));

  return (
    <div className={styles.page}>
      <ChatView
        conversationId={conversationId}
        currentUserId={userId}
        displayName={displayName}
        initialMessages={initialMessages}
      />
    </div>
  );
}
