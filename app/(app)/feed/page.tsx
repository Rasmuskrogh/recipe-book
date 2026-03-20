"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import { toast } from "react-hot-toast";
import { RecipeCardSkeleton } from "@/components/recipe/RecipeCardSkeleton";
import styles from "./page.module.css";

interface RecipeAuthor {
  username: string;
  name?: string | null;
  image?: string | null;
  isOnline?: boolean;
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
  savedByCurrentUser?: boolean;
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

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/recipes?page=1&limit=12");
        if (!res.ok) throw new Error("Kunde inte hämta recept");
        const data = (await res.json()) as {
          recipes: RecipeItem[];
          hasMore: boolean;
        };
        if (cancelled) return;
        setRecipes(data.recipes ?? []);
        setHasMore(data.hasMore ?? false);
        setPage(1);
      } catch {
        if (!cancelled) {
          setError("Något gick fel, försök igen");
          toast.error("Något gick fel, försök igen");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function loadMore() {
    const nextPage = page + 1;
    setLoadingMore(true);
    (async () => {
      try {
        const res = await fetch(
          `/api/recipes?page=${nextPage}&limit=12`,
        );
        if (!res.ok) throw new Error("Kunde inte hämta fler recept");
        const data = (await res.json()) as {
          recipes: RecipeItem[];
          hasMore: boolean;
        };
        setRecipes((prev) => [...prev, ...(data.recipes ?? [])]);
        setHasMore(data.hasMore ?? false);
        setPage(nextPage);
      } catch {
        setError("Något gick fel, försök igen");
        toast.error("Något gick fel, försök igen");
      } finally {
        setLoadingMore(false);
      }
    })();
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
      {loading && (
        <div className={styles.grid} aria-hidden>
          {Array.from({ length: 9 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && !error && (
        <>
          {recipes.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyText}>
                Inga recept än, skapa ditt första!
              </p>
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
                    savedByCurrentUser={recipe.savedByCurrentUser}
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
