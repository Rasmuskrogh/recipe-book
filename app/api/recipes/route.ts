import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { getFriendIds } from "@/lib/friends";
import { z } from "zod";

const ingredientSchema = z.object({
  name: z.string().min(1, "Namn krävs"),
  amount: z.number().positive("Mängd måste vara positiv"),
  unit: z.string().min(1, "Enhet krävs"),
  notes: z.string().optional(),
});

const stepSchema = z.object({
  instruction: z.string().min(1, "Instruktion krävs"),
  duration: z.number().int().min(0).optional(),
});

const categoryEnum = z.enum(["frukost", "lunch", "middag", "dessert", "bakning", "snacks", "dryck", "ovrigt"]);

const visibilityEnum = z.enum(["public", "friends", "private"]);

const createRecipeSchema = z.object({
  title: z.string().min(1, "Titel krävs"),
  description: z.string().optional(),
  category: categoryEnum.optional().nullable(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  servings: z.number().int().min(1, "Minst 1 portion"),
  prepTime: z.number().int().min(0).optional(),
  cookTime: z.number().int().min(0).optional(),
  imageUrl: z.string().url().optional().nullable(),
  visibility: visibilityEnum.optional().default("public"),
  ingredients: z.array(ingredientSchema).min(1, "Minst en ingrediens"),
  steps: z.array(stepSchema).min(1, "Minst ett steg"),
  tags: z.array(z.string()).optional().default([]),
});

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 100;

const CATEGORY_VALUES = ["frukost", "lunch", "middag", "dessert", "bakning", "snacks", "dryck", "ovrigt"] as const;
const DIFFICULTY_VALUES = ["easy", "medium", "hard"] as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mine = searchParams.get("mine") === "true";
  const saved = searchParams.get("saved") === "true";
  const search = searchParams.get("search")?.trim() ?? "";
  const category = searchParams.get("category")?.trim();
  const difficulty = searchParams.get("difficulty")?.trim();
  const maxTime = searchParams.get("maxTime");
  const minTime = searchParams.get("minTime");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limitParam = searchParams.get("limit");
  const limit = limitParam
    ? Math.min(MAX_LIMIT, Math.max(1, parseInt(limitParam, 10) || DEFAULT_LIMIT))
    : DEFAULT_LIMIT;
  const session = await auth();
  const userId = session?.user?.id ?? null;

  let baseWhere: object;
  if (saved && userId) {
    baseWhere = { savedBy: { some: { userId } } };
  } else if (mine && userId) {
    baseWhere = { authorId: userId };
  } else if (userId) {
    const friendIds = await getFriendIds(userId);
    const visibleAuthorIds = [userId, ...friendIds];
    baseWhere = {
      OR: [
        { visibility: "public" },
        { visibility: "friends", authorId: { in: visibleAuthorIds } },
        { visibility: "private", authorId: userId },
      ],
    };
  } else {
    baseWhere = { visibility: "public" };
  }

  const conditions: object[] = [baseWhere];
  if (search.length > 0) {
    conditions.push({ title: { contains: search, mode: "insensitive" } });
  }
  if (category && CATEGORY_VALUES.includes(category as (typeof CATEGORY_VALUES)[number])) {
    conditions.push({ category });
  }
  if (difficulty && DIFFICULTY_VALUES.includes(difficulty as (typeof DIFFICULTY_VALUES)[number])) {
    conditions.push({ difficulty });
  }
  const maxTimeNum = maxTime ? parseInt(maxTime, 10) : undefined;
  if (maxTimeNum != null && !Number.isNaN(maxTimeNum)) {
    conditions.push({ totalTime: { lte: maxTimeNum } });
  }
  const minTimeNum = minTime ? parseInt(minTime, 10) : undefined;
  if (minTimeNum != null && !Number.isNaN(minTimeNum)) {
    conditions.push({ totalTime: { gte: minTimeNum } });
  }

  const where = conditions.length === 1 ? conditions[0] : { AND: conditions };

  const skip = (page - 1) * limit;

  let recipes;
  try {
    recipes = await prisma.recipe.findMany({
      where,
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
          select: { username: true, name: true, image: true, isOnline: true },
        },
        ...(userId
          ? {
              savedBy: {
                where: { userId },
                select: { userId: true },
                take: 1,
              },
            }
          : {}),
      },
    });
  } catch (err) {
    console.error("GET /api/recipes error:", err);
    const message = err instanceof Error ? err.message : "";
    if (message.includes("totalTime") || message.includes("column") || message.includes("does not exist")) {
      return NextResponse.json(
        { error: "Tidsfiltrering kräver en databasuppdatering. Kör: npx prisma migrate deploy" },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Kunde inte hämta recept" }, { status: 500 });
  }

  const hasMore = recipes.length > limit;
  const items = hasMore ? recipes.slice(0, limit) : recipes;

  const normalized = items.map((r) => {
    const { savedBy, ...rest } = r as typeof r & { savedBy?: { userId: string }[] };
    return {
      ...rest,
      savedByCurrentUser: Array.isArray(savedBy) && savedBy.length > 0,
    };
  });

  return NextResponse.json({ recipes: normalized, hasMore });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig JSON" }, { status: 400 });
  }

  const parsed = createRecipeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { ingredients, steps, tags, ...data } = parsed.data;

  const totalTime = (data.prepTime ?? 0) + (data.cookTime ?? 0) || undefined;

  const recipe = await prisma.recipe.create({
    data: {
      ...data,
      imageUrl: data.imageUrl ?? undefined,
      category: data.category ?? undefined,
      visibility: data.visibility ?? "public",
      totalTime,
      authorId: session.user.id,
      ingredients: {
        create: ingredients.map((ing, i) => ({
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          notes: ing.notes ?? undefined,
          order: i,
        })),
      },
      steps: {
        create: steps.map((step, i) => ({
          order: i,
          instruction: step.instruction,
          duration: step.duration ?? undefined,
        })),
      },
      tags: tags.length ? { create: tags.map((name) => ({ name })) } : undefined,
    },
    include: {
      author: { select: { username: true, name: true } },
    },
  });

  return NextResponse.json(recipe, { status: 201 });
}
