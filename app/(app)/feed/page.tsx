"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import styles from "./page.module.css";

interface RecipeAuthor {
  username: string;
  name?: string | null;
  image?: string | null;
}

interface RecipeItem {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  difficulty?: string | null;
  prepTime?: number | null;
  cookTime?: number | null;
  servings?: number;
  author?: RecipeAuthor;
}

export default function FeedPage() {
  const { data: session, status } = useSession();
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/recipes?page=1&limit=12")
      .then((res) => {
        if (!res.ok) throw new Error("Kunde inte hämta recept");
        return res.json();
      })
      .then((data: { recipes: RecipeItem[]; hasMore: boolean }) => {
        if (cancelled) return;
        setRecipes(data.recipes ?? []);
        setHasMore(data.hasMore ?? false);
        setPage(1);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function loadMore() {
    const nextPage = page + 1;
    setLoadingMore(true);
    fetch(`/api/recipes?page=${nextPage}&limit=12`)
      .then((res) => {
        if (!res.ok) throw new Error("Kunde inte hämta fler recept");
        return res.json();
      })
      .then((data: { recipes: RecipeItem[]; hasMore: boolean }) => {
        setRecipes((prev) => [...prev, ...(data.recipes ?? [])]);
        setHasMore(data.hasMore ?? false);
        setPage(nextPage);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingMore(false));
  }

  const fullName = session?.user?.name || session?.user?.username || "där";
  const firstName = fullName.trim().split(/\s+/)[0] || fullName;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {status === "loading" ? (
            "Flöde"
          ) : (
            <>
              Välkommen, <span className={styles.titleAccent}>{firstName}</span> 👋
            </>
          )}
        </h1>
        <Link href="/recipes/new" className={styles.newRecipeBtn}>
          + Nytt recept
        </Link>
      </header>

      {error && <p className={styles.error}>{error}</p>}
      {loading && <p className={styles.loading}>Laddar recept...</p>}

      {!loading && !error && (
        <>
          {recipes.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyText}>Inga recept i flödet än.</p>
              <p className={styles.emptySub}>
                Bli först med att dela –{" "}
                <Link href="/recipes/new" className={styles.emptyLink}>
                  skapa ditt första recept
                </Link>
                .
              </p>
            </div>
          ) : (
            <>
              <div className={styles.grid}>
                {recipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    id={recipe.id}
                    title={recipe.title}
                    description={recipe.description}
                    imageUrl={recipe.imageUrl}
                    difficulty={recipe.difficulty}
                    prepTime={recipe.prepTime}
                    cookTime={recipe.cookTime}
                    servings={recipe.servings}
                    author={recipe.author}
                  />
                ))}
              </div>
              {hasMore && (
                <div className={styles.loadMoreWrap}>
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className={styles.loadMoreBtn}
                  >
                    {loadingMore ? "Laddar..." : "Ladda fler recept"}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
