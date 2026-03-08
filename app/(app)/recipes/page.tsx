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
  isOnline?: boolean;
}

interface RecipeItem {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  difficulty?: string | null;
  prepTime?: number | null;
  cookTime?: number | null;
  servings?: number;
  author?: RecipeAuthor;
  savedByCurrentUser?: boolean;
}

const CATEGORY_OPTIONS = [
  { value: "", label: "Alla" },
  { value: "frukost", label: "Frukost" },
  { value: "lunch", label: "Lunch" },
  { value: "middag", label: "Middag" },
  { value: "dessert", label: "Dessert" },
  { value: "bakning", label: "Bakning" },
  { value: "snacks", label: "Snacks" },
  { value: "dryck", label: "Dryck" },
  { value: "ovrigt", label: "Övrigt" },
];

const DIFFICULTY_OPTIONS = [
  { value: "", label: "Alla" },
  { value: "easy", label: "Lätt" },
  { value: "medium", label: "Medel" },
  { value: "hard", label: "Avancerat" },
];

const TIME_OPTIONS = [
  { value: "", label: "Alla" },
  { value: "30", label: "Under 30 min" },
  { value: "60", label: "Under 1 timme" },
  { value: "60+", label: "Över 1 timme" },
];

export default function RecipesPage() {
  const { data: session, status } = useSession();
  const [mine, setMine] = useState(false);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasActiveFilters = search.trim() !== "" || category !== "" || difficulty !== "" || timeFilter !== "";

  useEffect(() => {
    queueMicrotask(() => {
      setLoading(true);
      setError(null);
    });
    let cancelled = false;
    const params = new URLSearchParams();
    if (mine) params.set("mine", "true");
    if (search.trim()) params.set("search", search.trim());
    if (category) params.set("category", category);
    if (difficulty) params.set("difficulty", difficulty);
    if (timeFilter === "30") params.set("maxTime", "30");
    if (timeFilter === "60") params.set("maxTime", "60");
    if (timeFilter === "60+") params.set("minTime", "60");
    const url = `/api/recipes?${params.toString()}`;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Kunde inte hämta recept");
        return res.json();
      })
      .then((data: { recipes: RecipeItem[] }) => {
        if (!cancelled) setRecipes(data.recipes ?? []);
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
  }, [mine, saved, search, category, difficulty, timeFilter]);

  function clearFilters() {
    setSearch("");
    setCategory("");
    setDifficulty("");
    setTimeFilter("");
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Recept</h1>
        <Link href="/recipes/new" className={styles.newButton}>
          Skapa nytt recept
        </Link>
      </header>

      <div className={styles.filters}>
        <input
          type="search"
          placeholder="Sök recept på titel..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.search}
          aria-label="Sök recept"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={styles.select}
          aria-label="Kategori"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className={styles.select}
          aria-label="Svårighetsgrad"
        >
          {DIFFICULTY_OPTIONS.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className={styles.select}
          aria-label="Tid"
        >
          {TIME_OPTIONS.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {status !== "loading" && session?.user && (
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={mine}
              onChange={(e) => setMine(e.target.checked)}
              className={styles.toggle}
              aria-label="Visa endast mina recept"
            />
            <span className={styles.toggleText}>Mina recept</span>
          </label>
        )}
        {hasActiveFilters && (
          <button type="button" onClick={clearFilters} className={styles.clearBtn}>
            Rensa filter
          </button>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {loading && <p className={styles.loading}>Laddar recept...</p>}

      {!loading && !error && (
        <>
          {recipes.length === 0 ? (
            <p className={styles.empty}>
              {mine ? "Du har inga recept än." : "Inga recept att visa."}
              {!mine && (
                <>
                  {" "}
                  <Link href="/recipes/new" className={styles.emptyLink}>
                    Skapa ditt första recept
                  </Link>
                </>
              )}
            </p>
          ) : (
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
          )}
        </>
      )}
    </div>
  );
}
