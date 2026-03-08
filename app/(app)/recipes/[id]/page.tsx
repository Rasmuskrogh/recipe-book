import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { getFriendIds } from "@/lib/friends";
import { Avatar } from "@/components/ui/Avatar";
import { RecipeView } from "./RecipeView";
import { CookModeToggle } from "./CookModeToggle";
import { RecipeBookmarkButton } from "./RecipeBookmarkButton";
import styles from "./page.module.css";

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, username: true, name: true, image: true, isOnline: true } },
      ingredients: { orderBy: { order: "asc" } },
      steps: { orderBy: { order: "asc" } },
    },
  });

  if (!recipe) notFound();

  if (recipe.visibility === "private" && session?.user?.id !== recipe.authorId) notFound();
  if (recipe.visibility === "friends") {
    if (!session?.user?.id) notFound();
    const friendIds = await getFriendIds(recipe.authorId);
    const canView = recipe.authorId === session.user.id || friendIds.includes(session.user.id);
    if (!canView) notFound();
  }

  const isSaved =
    session?.user?.id != null
      ? await prisma.savedRecipe
        .findUnique({
          where: { userId_recipeId: { userId: session.user.id, recipeId: id } },
        })
        .then((r) => !!r)
      : false;

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
          <div className={styles.heroWrap}>
            <Image
              src={recipe.imageUrl}
              alt=""
              fill
              className={styles.hero}
              sizes="(max-width: 640px) 100vw, 40rem"
              priority
            />
          </div>
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

        <div className={styles.authorRow}>
          <div className={styles.author}>
            <Link href={`/profile/${recipe.author.username}`} className={styles.authorLink}>
              <Avatar
                src={recipe.author.image}
                alt={recipe.author.name || recipe.author.username}
                size="sm"
                isOnline={recipe.author.isOnline}
              />
              <span>{recipe.author.name || recipe.author.username}</span>
            </Link>
          </div>
          {session?.user && (
            <RecipeBookmarkButton recipeId={id} initialSaved={isSaved} />
          )}
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
