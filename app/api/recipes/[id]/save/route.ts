import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: recipeId } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { id: true },
  });
  if (!recipe) {
    return NextResponse.json({ error: "Recept hittades inte" }, { status: 404 });
  }

  await prisma.savedRecipe.upsert({
    where: {
      userId_recipeId: { userId: session.user.id, recipeId },
    },
    create: { userId: session.user.id, recipeId },
    update: {},
  });

  return NextResponse.json({ saved: true }, { status: 201 });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: recipeId } = await params;

  await prisma.savedRecipe.deleteMany({
    where: { userId: session.user.id, recipeId },
  });

  return NextResponse.json({ saved: false });
}
