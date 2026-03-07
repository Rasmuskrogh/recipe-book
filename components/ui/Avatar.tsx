import styles from "./Avatar.module.css";

export interface AvatarProps {
  src?: string | null;
  alt: string;
  /** Förnamn + efternamn-initialer, t.ex. "AK". Om inte angivet används första tecken i alt. */
  initials?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ src, alt, initials, size = "md", className }: AvatarProps) {
  const sizeClass =
    size === "sm" ? styles.sm : size === "lg" ? styles.lg : styles.md;
  const fallbackText =
    (initials && initials.length >= 1)
      ? initials.slice(0, 2).toUpperCase()
      : alt.slice(0, 1).toUpperCase();
  return (
    <div
      className={`${styles.avatar} ${sizeClass} ${className ?? ""}`.trim()}
    >
      {src ? (
        <img src={src} alt={alt} className={styles.img} />
      ) : (
        <span className={styles.fallback} aria-hidden>
          {fallbackText}
        </span>
      )}
    </div>
  );
}
