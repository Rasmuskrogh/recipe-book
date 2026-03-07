import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { conversationId } = await params;

  await prisma.conversationParticipant.updateMany({
    where: {
      conversationId,
      userId,
    },
    data: { lastReadAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
