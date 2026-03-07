import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, username: true, image: true, bio: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Användaren hittades inte" }, { status: 404 });
  }

  const recipeCount = await prisma.recipe.count({
    where: { authorId: id, isPublic: true },
  });
  const friendCount = await prisma.friendship.count({
    where: { OR: [{ userAId: id }, { userBId: id }] },
  });
  const recipes = await prisma.recipe.findMany({
    where: { authorId: id, isPublic: true },
    select: { id: true, title: true, imageUrl: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    username: user.username,
    image: user.image,
    bio: user.bio,
    recipeCount,
    friendCount,
    recipes,
  });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (session.user.id !== id) {
    return NextResponse.json({ error: "Du kan bara redigera din egen profil" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig JSON" }, { status: 400 });
  }
  const o = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const name = o.name !== undefined ? String(o.name).trim() || null : undefined;
  const bio = o.bio !== undefined ? (o.bio === null || o.bio === "" ? null : String(o.bio)) : undefined;
  const image = o.image !== undefined ? (o.image === null || o.image === "" ? null : String(o.image)) : undefined;

  const update: {
    name?: string | null;
    bio?: string | null;
    image?: string | null;
  } = {};
  if (name !== undefined) update.name = name;
  if (bio !== undefined) update.bio = bio;
  if (image !== undefined) update.image = image;

  const user = await prisma.user.update({
    where: { id },
    data: update,
    select: { id: true, name: true, username: true, image: true, bio: true },
  });
  return NextResponse.json(user);
}
