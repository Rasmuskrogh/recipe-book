"use client";

import Link from "next/link";
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
  };
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
}: RecipeCardProps) {
  const totalCook = [prepTime ?? 0, cookTime ?? 0].reduce((a, b) => a + b, 0);
  const authorName = author?.name || author?.username || "Okänd";
  const badgeClass =
    difficulty === "easy"
      ? styles.badgeEasy
      : difficulty === "hard"
        ? styles.badgeHard
        : styles.badgeMedium;

  return (
    <Link href={`/recipes/${id}`} className={styles.card}>
      <div className={styles.imageWrap}>
        {imageUrl ? (
          <img src={imageUrl} alt="" className={styles.image} />
        ) : (
          <div className={styles.placeholder} aria-hidden />
        )}
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
          <p className={styles.desc}>{description}</p>
        )}
        <div className={styles.author}>
          <Avatar
            src={author?.image}
            alt={authorName}
            initials={getInitials(author?.name || author?.username)}
            size="sm"
            className={styles.authorAvatar}
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
