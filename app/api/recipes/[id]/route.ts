import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

const ingredientSchema = z.object({
  name: z.string().min(1, "Namn krävs"),
  amount: z.number().positive("Mängd måste vara positiv"),
  unit: z.string().min(1, "Enhet krävs"),
  notes: z.string().optional(),
});

const stepSchema = z.object({
  instruction: z.string().min(1, "Instruktion krävs"),
  duration: z.preprocess(
    (value) =>
      value === "" ||
      value == null ||
      (typeof value === "number" && Number.isNaN(value))
        ? undefined
        : value,
    z.number().int().min(0).optional()
  ),
});

const categoryEnum = z.enum([
  "frukost",
  "lunch",
  "middag",
  "dessert",
  "bakning",
  "snacks",
  "dryck",
  "ovrigt",
]);
const visibilityEnum = z.enum(["public", "friends", "private"]);

const updateRecipeSchema = z.object({
  title: z.string().min(1, "Titel krävs"),
  description: z.string().optional(),
  category: z.preprocess(
    (value) => (value === "" ? null : value),
    categoryEnum.optional().nullable()
  ),
  difficulty: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.enum(["easy", "medium", "hard"]).optional()
  ),
  servings: z.number().int().min(1, "Minst 1 portion"),
  prepTime: z.preprocess(
    (value) =>
      value === "" ||
      value == null ||
      (typeof value === "number" && Number.isNaN(value))
        ? undefined
        : value,
    z.number().int().min(0).optional()
  ),
  cookTime: z.preprocess(
    (value) =>
      value === "" ||
      value == null ||
      (typeof value === "number" && Number.isNaN(value))
        ? undefined
        : value,
    z.number().int().min(0).optional()
  ),
  imageUrl: z.string().url().optional().nullable(),
  visibility: visibilityEnum.optional().default("public"),
  ingredients: z.array(ingredientSchema).min(1, "Minst en ingrediens"),
  steps: z.array(stepSchema).min(1, "Minst ett steg"),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: { orderBy: { order: "asc" } },
      steps: { orderBy: { order: "asc" } },
      tags: { orderBy: { name: "asc" } },
    },
  });

  if (!recipe) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  if (recipe.visibility === "private" && session?.user?.id !== recipe.authorId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(recipe);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.recipe.findUnique({
    where: { id },
    select: { id: true, authorId: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }
  if (existing.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig JSON" }, { status: 400 });
  }

  const parsed = updateRecipeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { ingredients, steps, ...data } = parsed.data;
  const totalTime = (data.prepTime ?? 0) + (data.cookTime ?? 0) || undefined;

  const recipe = await prisma.$transaction(async (tx) => {
    await tx.ingredient.deleteMany({ where: { recipeId: id } });
    await tx.recipeStep.deleteMany({ where: { recipeId: id } });

    return tx.recipe.update({
      where: { id },
      data: {
        ...data,
        imageUrl: data.imageUrl ?? undefined,
        category: data.category ?? undefined,
        visibility: data.visibility ?? "public",
        totalTime,
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
      },
      include: {
        author: { select: { username: true, name: true } },
      },
    });
  });

  return NextResponse.json(recipe);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.recipe.findUnique({
    where: { id },
    select: { id: true, authorId: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }
  if (existing.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.recipe.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
