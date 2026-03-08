import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { isOnline?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const isOnline = body.isOnline ?? true;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      isOnline,
      lastSeen: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
