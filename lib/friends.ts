import { prisma } from "@/lib/db/prisma";
import type { FriendshipStatus } from "@/types/social";

export type FriendEntry = {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  recipeCount: number;
};

export type IncomingRequestEntry = {
  id: string;
  senderId: string;
  createdAt: Date;
  sender: FriendEntry;
};

export async function getFriendsData(userId: string) {
  const [friendships, incomingRequests] = await Promise.all([
    prisma.friendship.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
      include: {
        userA: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            _count: { select: { recipes: true } },
          },
        },
        userB: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            _count: { select: { recipes: true } },
          },
        },
      },
    }),
    prisma.friendRequest.findMany({
      where: { receiverId: userId, status: "PENDING" },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            _count: { select: { recipes: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const friends: FriendEntry[] = friendships.map((f) => {
    const friend = f.userAId === userId ? f.userB : f.userA;
    return {
      id: friend.id,
      name: friend.name,
      username: friend.username,
      image: friend.image,
      recipeCount: friend._count.recipes,
    };
  });

  const requests: IncomingRequestEntry[] = incomingRequests.map((r) => ({
    id: r.id,
    senderId: r.senderId,
    createdAt: r.createdAt,
    sender: {
      id: r.sender.id,
      name: r.sender.name,
      username: r.sender.username,
      image: r.sender.image,
      recipeCount: r.sender._count.recipes,
    },
  }));

  return { friends, incomingRequests: requests };
}

export async function getFriendshipStatus(
  currentUserId: string,
  targetUserId: string
): Promise<{ status: FriendshipStatus; requestId?: string }> {
  if (currentUserId === targetUserId) {
    return { status: "none" };
  }

  const [friendship, sentRequest, receivedRequest] = await Promise.all([
    prisma.friendship.findFirst({
      where: {
        OR: [
          { userAId: currentUserId, userBId: targetUserId },
          { userAId: targetUserId, userBId: currentUserId },
        ],
      },
    }),
    prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId: currentUserId,
          receiverId: targetUserId,
        },
        status: "PENDING",
      },
    }),
    prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId: targetUserId,
          receiverId: currentUserId,
        },
        status: "PENDING",
      },
    }),
  ]);

  if (friendship) return { status: "friends" };
  if (sentRequest) return { status: "pending_sent" };
  if (receivedRequest) return { status: "pending_received", requestId: receivedRequest.id };
  return { status: "none" };
}

export async function getPendingFriendRequestCount(userId: string): Promise<number> {
  return prisma.friendRequest.count({
    where: { receiverId: userId, status: "PENDING" },
  });
}

export async function getFriendIds(userId: string): Promise<string[]> {
  const friendships = await prisma.friendship.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    select: { userAId: true, userBId: true },
  });
  return friendships.map((f) => (f.userAId === userId ? f.userBId : f.userAId));
}
