import skeleton from "@/components/ui/SkeletonPulse.module.css";
import styles from "./MessagesList.module.css";

export default function Loading() {
  return (
    <div className={styles.page} aria-hidden>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <div
            className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
            style={{ height: "1.2rem", width: "8rem" }}
          />
        </h1>
        <div className={styles.actions}>
          <div className={styles.btn}>
            <div
              className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
              style={{ height: "0.9rem", width: "3.8rem" }}
            />
          </div>
        </div>
      </div>

      <ul className={styles.convList}>
        {Array.from({ length: 7 }).map((_, i) => (
          <li key={i}>
            <div className={styles.convRow} aria-hidden>
              <div
                className={styles.avatar}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  background: "var(--border)",
                  opacity: 0.75,
                }}
              />
              <div className={styles.convBody}>
                <div
                  className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
                  style={{ height: "1rem", width: "55%" }}
                />
                <div
                  className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
                  style={{ height: "0.8rem", width: "90%" }}
                />
              </div>
              <span
                className={styles.unreadBadge}
                style={{ background: "var(--border)", color: "transparent" }}
                aria-hidden
              />
              <div
                className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
                style={{ height: "0.75rem", width: "4.5rem" }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

