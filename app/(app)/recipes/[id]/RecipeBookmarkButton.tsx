"use client";

import { useState } from "react";
import styles from "./RecipeBookmarkButton.module.css";
import { toast } from "react-hot-toast";

export function RecipeBookmarkButton({
  recipeId,
  initialSaved,
}: {
  recipeId: string;
  initialSaved: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    try {
      if (saved) {
        const res = await fetch(`/api/recipes/${recipeId}/save`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Kunde inte ta bort bokmärke");
        setSaved(false);
        toast.success("Borttaget");
      } else {
        const res = await fetch(`/api/recipes/${recipeId}/save`, {
          method: "POST",
        });
        if (!res.ok) throw new Error("Kunde inte spara bokmärke");
        setSaved(true);
        toast.success("Sparades!");
      }
    } catch {
      toast.error("Något gick fel, försök igen");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={saved ? styles.bookmarkBtnSaved : styles.bookmarkBtn}
      aria-label={saved ? "Ta bort bokmärke" : "Spara recept"}
    >
      <svg
        className={styles.bookmarkIcon}
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
