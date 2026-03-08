import Image from "next/image";
import styles from "./Avatar.module.css";

export interface AvatarProps {
  src?: string | null;
  alt: string;
  /** Förnamn + efternamn-initialer, t.ex. "AK". Om inte angivet används första tecken i alt. */
  initials?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Visa grön prick när användaren är online */
  isOnline?: boolean;
}

const SIZE_PX = { sm: 32, md: 40, lg: 80 } as const;

export function Avatar({ src, alt, initials, size = "md", className, isOnline }: AvatarProps) {
  const sizeClass =
    size === "sm" ? styles.sm : size === "lg" ? styles.lg : styles.md;
  const fallbackText =
    (initials && initials.length >= 1)
      ? initials.slice(0, 2).toUpperCase()
      : alt.slice(0, 1).toUpperCase();
  const px = SIZE_PX[size];
  return (
    <div
      className={`${styles.avatar} ${sizeClass} ${className ?? ""}`.trim()}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={px}
          height={px}
          className={styles.img}
          unoptimized={src.startsWith("data:")}
        />
      ) : (
        <span className={styles.fallback} aria-hidden>
          {fallbackText}
        </span>
      )}
      {isOnline === true && (
        <span className={styles.onlineDot} aria-label="Online" />
      )}
    </div>
  );
}
