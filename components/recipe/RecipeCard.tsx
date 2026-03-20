"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Avatar } from "@/components/ui/Avatar";
import { getInitials } from "@/lib/utils/format";
import styles from "./RecipeCard.module.css";

export interface RecipeCardProps {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  difficulty?: string | null;
  prepTime?: number | null;
  cookTime?: number | null;
  servings?: number;
  author?: {
    username: string;
    name?: string | null;
    image?: string | null;
    isOnline?: boolean;
  };
  savedByCurrentUser?: boolean;
}

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Lätt",
  medium: "Medel",
  hard: "Avancerat",
};

function formatMinutes(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} tim ${m} min` : `${h} tim`;
}

export function RecipeCard({
  id,
  title,
  description,
  imageUrl,
  difficulty,
  prepTime,
  cookTime,
  servings,
  author,
  savedByCurrentUser = false,
}: RecipeCardProps) {
  const [saved, setSaved] = useState(savedByCurrentUser);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const totalCook = [prepTime ?? 0, cookTime ?? 0].reduce((a, b) => a + b, 0);
  const authorName = author?.name || author?.username || "Okänd";
  const badgeClass =
    difficulty === "easy"
      ? styles.badgeEasy
      : difficulty === "hard"
        ? styles.badgeHard
        : styles.badgeMedium;

  async function toggleBookmark(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (bookmarkLoading) return;
    setBookmarkLoading(true);
    try {
      if (saved) {
        const res = await fetch(`/api/recipes/${id}/save`, { method: "DELETE" });
        if (res.ok) setSaved(false);
      } else {
        const res = await fetch(`/api/recipes/${id}/save`, { method: "POST" });
        if (res.ok) setSaved(true);
      }
    } finally {
      setBookmarkLoading(false);
    }
  }

  return (
    <Link href={`/recipes/${id}`} className={styles.card}>
      <div className={styles.imageWrap}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            className={styles.image}
            sizes="(max-width: 640px) 100vw, 400px"
          />
        ) : (
          <div className={styles.placeholder} aria-hidden />
        )}
        <button
          type="button"
          onClick={toggleBookmark}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          disabled={bookmarkLoading}
          className={saved ? styles.bookmarkBtnSaved : styles.bookmarkBtn}
          aria-label={saved ? "Ta bort bokmärke" : "Spara recept"}
        >
          <span className={styles.bookmarkChar} aria-hidden>
            {saved ? "★" : "☆"}
          </span>
        </button>
      </div>
      <div className={styles.body}>
        <div className={styles.meta}>
          {difficulty && (
            <span className={`${styles.badge} ${badgeClass}`}>
              {DIFFICULTY_LABELS[difficulty] ?? difficulty}
            </span>
          )}
          {totalCook > 0 && (
            <span className={styles.time}>⏱ {formatMinutes(totalCook)}</span>
          )}
        </div>
        <h3 className={styles.title}>{title}</h3>
        {description && (
          <div className={styles.desc} dangerouslySetInnerHTML={{ __html: description }} />
        )}
        <div className={styles.author}>
          <Avatar
            src={author?.image}
            alt={authorName}
            initials={getInitials(author?.name || author?.username)}
            size="sm"
            className={styles.authorAvatar}
            isOnline={author?.isOnline}
          />
          <span className={styles.authorName}>{authorName}</span>
          {servings != null && servings > 0 && (
            <span className={styles.servings}>{servings} port.</span>
          )}
        </div>
      </div>
    </Link>
  );
}
