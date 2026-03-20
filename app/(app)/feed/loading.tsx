import skeleton from "@/components/ui/SkeletonPulse.module.css";
import styles from "./page.module.css";
import { RecipeCardSkeleton } from "@/components/recipe/RecipeCardSkeleton";

export default function Loading() {
  return (
    <div className={styles.page} aria-hidden>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <div
            className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
            style={{ height: "2rem", width: "14rem" }}
          />
        </h1>
        <div className={styles.newRecipeBtn}>
          <div
            className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
            style={{ height: "1.1rem", width: "7rem" }}
          />
        </div>
      </div>

      <div className={styles.grid}>
        {Array.from({ length: 9 }).map((_, i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

