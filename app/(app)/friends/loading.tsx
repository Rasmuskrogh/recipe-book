import skeleton from "@/components/ui/SkeletonPulse.module.css";
import styles from "./FriendsContent.module.css";

export default function Loading() {
  return (
    <div className={styles.page} aria-hidden>
      <h1 className={styles.title}>
        <div
          className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
          style={{ height: "1.1rem", width: "4.6rem" }}
        />
      </h1>

      <div className={styles.searchWrap}>
        <label className={styles.searchLabel}>
          <div
            className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
            style={{ height: "0.75rem", width: "6.4rem" }}
          />
        </label>
        <div
          className={`${styles.searchInput} ${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
          style={{ height: "40px" }}
        />
      </div>

      <div className={styles.tabs}>
        <div className={styles.tabActive} role="presentation" aria-hidden>
          <div
            className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
            style={{ height: "0.85rem", width: "7.4rem" }}
          />
        </div>
        <div className={styles.tab} role="presentation" aria-hidden>
          <div
            className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
            style={{ height: "0.85rem", width: "5.2rem" }}
          />
        </div>
      </div>

      <section className={styles.section}>
        <ul className={styles.list}>
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i}>
              <div className={styles.friendRow}>
                <div
                  className={skeleton.skeleton}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "999px",
                    flexShrink: 0,
                  }}
                />
                <div className={styles.friendInfo}>
                  <div
                    className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
                    style={{ height: "0.9rem", width: "55%" }}
                  />
                  <div
                    className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
                    style={{ height: "0.75rem", width: "65%" }}
                  />
                </div>
                <div className={styles.recipeCount}>
                  <div
                    className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
                    style={{ height: "0.75rem", width: "4.7rem" }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

