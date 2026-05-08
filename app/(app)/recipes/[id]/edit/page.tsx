import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { EditRecipeForm } from "./EditRecipeForm";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: { orderBy: { order: "asc" } },
      steps: { orderBy: { order: "asc" } },
    },
  });

  if (!recipe || recipe.authorId !== session.user.id) {
    notFound();
  }

  return (
    <EditRecipeForm
      recipeId={recipe.id}
      initialValues={{
        title: recipe.title,
        description: recipe.description ?? "",
        category: recipe.category as
          | "frukost"
          | "lunch"
          | "middag"
          | "dessert"
          | "bakning"
          | "snacks"
          | "dryck"
          | "ovrigt"
          | null
          | undefined,
        difficulty: (recipe.difficulty as "easy" | "medium" | "hard" | undefined) ?? undefined,
        servings: recipe.servings,
        prepTime: recipe.prepTime ?? undefined,
        cookTime: recipe.cookTime ?? undefined,
        imageUrl: recipe.imageUrl ?? "",
        visibility: recipe.visibility as "public" | "friends" | "private",
        ingredients: recipe.ingredients.map((i) => ({
          name: i.name,
          amount: i.amount,
          unit: i.unit,
          notes: i.notes ?? "",
        })),
        steps: recipe.steps.length
          ? recipe.steps.map((s) => ({
              instruction: s.instruction,
              duration: s.duration ?? undefined,
            }))
          : [{ instruction: "" }],
      }}
    />
  );
}
