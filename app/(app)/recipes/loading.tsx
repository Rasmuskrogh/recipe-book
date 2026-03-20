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
            style={{ height: "1.5rem", width: "6rem" }}
          />
        </h1>
        <div className={styles.newButton}>
          <div
            className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
            style={{ height: "1.1rem", width: "9rem" }}
          />
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.search}>
          <div
            className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
            style={{ height: "1rem", width: "60%" }}
          />
        </div>
        <div className={styles.select}>
          <div
            className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
            style={{ height: "1rem", width: "70%" }}
          />
        </div>
        <div className={styles.select}>
          <div
            className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
            style={{ height: "1rem", width: "55%" }}
          />
        </div>
        <div className={styles.select}>
          <div
            className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
            style={{ height: "1rem", width: "50%" }}
          />
        </div>
      </div>

      <div className={styles.filterRadios}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={styles.toggleLabel}>
            <div
              className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
              style={{ height: "1rem", width: "1rem" }}
            />
            <div
              className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
              style={{ height: "0.9rem", width: i === 0 ? "3.5rem" : "5rem" }}
            />
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        {Array.from({ length: 9 }).map((_, i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

