import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "100", 10) || 100));
  const skip = (page - 1) * limit;

  const recipes = await prisma.recipe.findMany({
    where: { savedBy: { some: { userId: session.user.id } } },
    skip,
    take: limit + 1,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      category: true,
      servings: true,
      prepTime: true,
      cookTime: true,
      difficulty: true,
      author: {
        select: { username: true, name: true, image: true },
      },
    },
  });

  const hasMore = recipes.length > limit;
  const items = hasMore ? recipes.slice(0, limit) : recipes;

  return NextResponse.json({ recipes: items, hasMore });
}
