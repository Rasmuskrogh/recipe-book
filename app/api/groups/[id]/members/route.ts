import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { id: groupId } = await params;

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  if (!membership) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  const members = await prisma.groupMember.findMany({
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
  });

  return NextResponse.json({
    members: members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      username: m.user.username,
      image: m.user.image,
      role: m.role,
    })),
  });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { id: groupId } = await params;

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  if (!membership) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  let body: { memberIds?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const memberIds = Array.isArray(body.memberIds)
    ? [...new Set(body.memberIds.filter((id): id is string => typeof id === "string"))]
    : [];
  if (memberIds.length === 0) {
    return NextResponse.json({ error: "memberIds required (array)" }, { status: 400 });
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { conversation: { select: { id: true } } },
  });
  if (!group?.conversation) {
    return NextResponse.json({ error: "Group or conversation not found" }, { status: 404 });
  }

  const existingMemberIds = await prisma.groupMember
    .findMany({
      where: { groupId },
      select: { userId: true },
    })
    .then((rows) => new Set(rows.map((r) => r.userId)));

  const toAdd = memberIds.filter((id) => !existingMemberIds.has(id));
  if (toAdd.length === 0) {
    return NextResponse.json({ added: 0, message: "All already members" });
  }

  const validUsers = await prisma.user.findMany({
    where: { id: { in: toAdd } },
    select: { id: true },
  });
  const validIds = validUsers.map((u) => u.id);

  await prisma.$transaction([
    prisma.groupMember.createMany({
      data: validIds.map((id) => ({
        groupId,
        userId: id,
        role: "MEMBER",
      })),
    }),
    prisma.conversationParticipant.createMany({
      data: validIds.map((id) => ({
        conversationId: group.conversation!.id,
        userId: id,
      })),
      skipDuplicates: true,
    }),
  ]);

  return NextResponse.json({ added: validIds.length });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { id: groupId } = await params;

  const url = new URL(request.url);
  const targetUserId = url.searchParams.get("userId") ?? undefined;
  let body: { userId?: string } = {};
  if (!targetUserId) {
    try {
      body = await request.json();
    } catch {
      /* no body */
    }
  }
  const removeUserId = targetUserId ?? body.userId;
  if (!removeUserId || typeof removeUserId !== "string") {
    return NextResponse.json({ error: "userId required (query or body)" }, { status: 400 });
  }

  const [myMembership, targetMembership] = await Promise.all([
    prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    }),
    prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: removeUserId } },
    }),
  ]);

  if (!myMembership) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }
  if (!targetMembership) {
    return NextResponse.json({ error: "User is not a member" }, { status: 404 });
  }

  const canRemove = myMembership.role === "ADMIN" || removeUserId === userId;
  if (!canRemove) {
    return NextResponse.json({ error: "Only admin or the user themselves can remove" }, { status: 403 });
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { conversation: { select: { id: true } } },
  });
  if (!group?.conversation) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.groupMember.delete({
      where: { groupId_userId: { groupId, userId: removeUserId } },
    }),
    prisma.conversationParticipant.deleteMany({
      where: {
        conversationId: group.conversation.id,
        userId: removeUserId,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
