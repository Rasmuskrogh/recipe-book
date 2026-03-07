import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Avatar } from "@/components/ui/Avatar";
import { RecipeView } from "./RecipeView";
import { CookModeToggle } from "./CookModeToggle";
import styles from "./page.module.css";

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, username: true, name: true, image: true } },
      ingredients: { orderBy: { order: "asc" } },
      steps: { orderBy: { order: "asc" } },
    },
  });

  if (!recipe) notFound();

  const ingredients = recipe.ingredients.map((i) => ({
    name: i.name,
    amount: i.amount,
    unit: i.unit,
    notes: i.notes ?? undefined,
  }));

  const steps = recipe.steps.map((s) => ({
    instruction: s.instruction,
    duration: s.duration ?? undefined,
  }));

  return (
    <div className={styles.page}>
      <article className={styles.article}>
        {recipe.imageUrl && (
          <img
            src={recipe.imageUrl}
            alt=""
            className={styles.hero}
          />
        )}
        <h1 className={styles.title}>{recipe.title}</h1>
        {recipe.description && (
          <p className={styles.description}>{recipe.description}</p>
        )}
        <div className={styles.meta}>
          {recipe.prepTime != null && (
            <span>Förberedelse: {recipe.prepTime} min</span>
          )}
          {recipe.cookTime != null && (
            <span>Tillagning: {recipe.cookTime} min</span>
          )}
          <span>{recipe.servings} portioner</span>
          {recipe.difficulty && (
            <span>
              Svårighet:{" "}
              {recipe.difficulty === "easy"
                ? "Lätt"
                : recipe.difficulty === "medium"
                  ? "Medel"
                  : "Svår"}
            </span>
          )}
        </div>

        <div className={styles.author}>
          <Link href={`/profile/${recipe.author.username}`} className={styles.authorLink}>
            <Avatar
              src={recipe.author.image}
              alt={recipe.author.name || recipe.author.username}
              size="sm"
            />
            <span>{recipe.author.name || recipe.author.username}</span>
          </Link>
        </div>

        <CookModeToggle />

        <RecipeView
          ingredients={ingredients}
          steps={steps}
          servings={recipe.servings}
        />
      </article>
    </div>
  );
}
