import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { getFriendsData } from "@/lib/friends";
import { sendPushNotification } from "@/lib/push/sendPushNotification";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await getFriendsData(session.user.id);
  return NextResponse.json({
    friends: data.friends,
    incomingRequests: data.incomingRequests,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: { receiverId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const receiverId = body.receiverId;
  if (!receiverId || typeof receiverId !== "string") {
    return NextResponse.json({ error: "receiverId required" }, { status: 400 });
  }
  if (receiverId === userId) {
    return NextResponse.json({ error: "Cannot send request to yourself" }, { status: 400 });
  }

  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
  });
  if (!receiver) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const [existingFriendship, existingRequest] = await Promise.all([
    prisma.friendship.findFirst({
      where: {
        OR: [
          { userAId: userId, userBId: receiverId },
          { userAId: receiverId, userBId: userId },
        ],
      },
    }),
    prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: { senderId: userId, receiverId },
      },
    }),
  ]);

  if (existingFriendship) {
    return NextResponse.json({ error: "Already friends" }, { status: 400 });
  }
  if (existingRequest) {
    return NextResponse.json({ error: "Request already sent" }, { status: 400 });
  }

  await prisma.friendRequest.create({
    data: { senderId: userId, receiverId, status: "PENDING" },
  });

  const sender = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, username: true },
  });
  const senderName = sender?.name || sender?.username || "Någon";

  await sendPushNotification(
    receiverId,
    "Ny vänförfrågan",
    `Du har en ny vänförfrågan från ${senderName}`
  );

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: { requestId?: string; action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { requestId, action } = body;
  if (!requestId || typeof requestId !== "string") {
    return NextResponse.json({ error: "requestId required" }, { status: 400 });
  }
  if (action !== "accept" && action !== "reject") {
    return NextResponse.json({ error: "action must be 'accept' or 'reject'" }, { status: 400 });
  }

  const friendRequest = await prisma.friendRequest.findUnique({
    where: { id: requestId },
  });
  if (!friendRequest || friendRequest.receiverId !== userId) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }
  if (friendRequest.status !== "PENDING") {
    return NextResponse.json({ error: "Request already handled" }, { status: 400 });
  }

  if (action === "reject") {
    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" },
    });
    return NextResponse.json({ ok: true });
  }

  const userAId = friendRequest.senderId < friendRequest.receiverId ? friendRequest.senderId : friendRequest.receiverId;
  const userBId = friendRequest.senderId < friendRequest.receiverId ? friendRequest.receiverId : friendRequest.senderId;

  await prisma.$transaction([
    prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" },
    }),
    prisma.friendship.create({
      data: { userAId, userBId },
    }),
  ]);

  const accepterName = session.user.name || session.user.username || "Någon";
  await sendPushNotification(
    friendRequest.senderId,
    "Vänförfrågan accepterad",
    `${accepterName} accepterade din vänförfrågan`
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const url = new URL(request.url);
  const friendId = url.searchParams.get("userId") ?? undefined;
  let body: { friendId?: string } = {};
  if (!friendId) {
    try {
      body = await request.json();
    } catch {
      // no body ok
    }
  }
  const targetId = friendId ?? body.friendId;
  if (!targetId || typeof targetId !== "string") {
    return NextResponse.json({ error: "userId or friendId required" }, { status: 400 });
  }
  if (targetId === userId) {
    return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
  }

  const userAId = userId < targetId ? userId : targetId;
  const userBId = userId < targetId ? targetId : userId;

  const friendship = await prisma.friendship.findUnique({
    where: { userAId_userBId: { userAId, userBId } },
  });
  if (!friendship) {
    return NextResponse.json({ error: "Not friends" }, { status: 404 });
  }

  await prisma.friendship.delete({
    where: { userAId_userBId: { userAId, userBId } },
  });
  return NextResponse.json({ ok: true });
}
