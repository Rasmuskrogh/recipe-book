import skeleton from "@/components/ui/SkeletonPulse.module.css";
import styles from "./GroupsList.module.css";

export default function Loading() {
  return (
    <div className={styles.page} aria-hidden>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <div
            className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
            style={{ height: "1.2rem", width: "5.5rem" }}
          />
        </h1>
        <div className={styles.actions}>
          <div className={styles.btn}>
            <div
              className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
              style={{ height: "0.9rem", width: "7.5rem" }}
            />
          </div>
        </div>
      </div>

      <ul className={styles.groupList}>
        {Array.from({ length: 7 }).map((_, i) => (
          <li key={i}>
            <div className={styles.groupRow} aria-hidden>
              <div
                className={`${styles.groupIcon} ${skeleton.skeleton}`}
                style={{ borderRadius: "0.5rem" }}
              />
              <div className={styles.groupBody}>
                <div
                  className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
                  style={{ height: "1rem", width: "55%" }}
                />
                <div
                  className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
                  style={{ height: "0.8rem", width: "92%" }}
                />
              </div>
              <span
                className={styles.unreadBadge}
                style={{ background: "var(--border)", color: "transparent" }}
                aria-hidden
              />
              <div
                className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
                style={{ height: "0.75rem", width: "4.2rem" }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

