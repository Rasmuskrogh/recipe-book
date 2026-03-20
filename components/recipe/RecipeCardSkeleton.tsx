import recipeCardStyles from "./RecipeCard.module.css";
import skeletonStyles from "@/components/ui/SkeletonPulse.module.css";
import styles from "./RecipeCardSkeleton.module.css";

export function RecipeCardSkeleton() {
  return (
    <div className={recipeCardStyles.card} aria-hidden>
      <div className={recipeCardStyles.imageWrap}>
        <div
          className={`${skeletonStyles.skeleton} ${styles.imgPulse}`}
          aria-hidden
        />
        <div
          className={`${recipeCardStyles.bookmarkBtn} ${skeletonStyles.skeleton} ${styles.bookmarkPulse}`}
          aria-hidden
        />
      </div>

      <div className={recipeCardStyles.body}>
        <div className={recipeCardStyles.meta}>
          <div className={`${skeletonStyles.skeleton} ${styles.badgeBlock}`} />
          <div className={`${skeletonStyles.skeleton} ${styles.timeBlock}`} />
        </div>

        <div className={`${skeletonStyles.skeleton} ${styles.titleBlock}`} />
        <div className={`${skeletonStyles.skeleton} ${styles.descBlock}`} />

        <div className={recipeCardStyles.author}>
          <div
            className={`${skeletonStyles.skeleton}`}
            style={{
              width: 26,
              height: 26,
              borderRadius: 999,
              flexShrink: 0,
            }}
          />
          <div className={`${skeletonStyles.skeleton} ${styles.authorNameBlock}`} />
          <div className={`${skeletonStyles.skeleton} ${styles.servingsBlock}`} />
        </div>
      </div>
    </div>
  );
}

