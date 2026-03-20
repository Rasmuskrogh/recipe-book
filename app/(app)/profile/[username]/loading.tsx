import skeleton from "@/components/ui/SkeletonPulse.module.css";
import headerStyles from "@/components/profile/ProfileHeader.module.css";
import gridStyles from "@/components/profile/ProfileRecipeGrid.module.css";
import styles from "./page.module.css";

export default function Loading() {
  return (
    <div className={styles.page} aria-hidden>
      <div className={headerStyles.profileHeader}>
        <div className={headerStyles.avatar}>
          <div
            className={skeleton.skeleton}
            style={{
              width: "5rem",
              height: "5rem",
              borderRadius: "999px",
            }}
          />
        </div>

        <div className={headerStyles.info}>
          <div className={headerStyles.name}>
            <div
              className={skeleton.skeleton}
              style={{
                height: "1.7rem",
                width: "12rem",
                borderRadius: "0.5rem",
              }}
            />
          </div>
          <div className={headerStyles.username}>
            <div
              className={skeleton.skeleton}
              style={{
                height: "0.9rem",
                width: "8rem",
                borderRadius: "0.4rem",
              }}
            />
          </div>

          <div className={headerStyles.stats}>
            <div className={headerStyles.stat}>
              <div
                className={skeleton.skeleton}
                style={{
                  height: "0.9rem",
                  width: "5.5rem",
                  borderRadius: "0.35rem",
                }}
              />
            </div>
            <div className={headerStyles.stat}>
              <div
                className={skeleton.skeleton}
                style={{
                  height: "0.9rem",
                  width: "5.5rem",
                  borderRadius: "0.35rem",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <div
          className={styles.editButton}
          style={{ background: "transparent", color: "transparent" }}
        >
          <div
            className={skeleton.skeleton}
            style={{
              height: "0.9rem",
              width: "8.5rem",
              borderRadius: "0.2rem",
            }}
          />
        </div>
        <div
          className={styles.savedRecipesButton}
          style={{ background: "transparent", color: "transparent" }}
        >
          <div
            className={skeleton.skeleton}
            style={{
              height: "0.9rem",
              width: "10.5rem",
              borderRadius: "0.2rem",
            }}
          />
        </div>
      </div>

      <section className={styles.recipesSection}>
        <h2 className={styles.sectionTitle}>
          <div
            className={skeleton.skeleton}
            style={{
              height: "1.25rem",
              width: "6rem",
              borderRadius: "0.5rem",
            }}
          />
        </h2>

        <div className={gridStyles.profileRecipeGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={gridStyles.card}>
              <div className={gridStyles.imageWrap}>
                <div
                  className={`${gridStyles.placeholder} ${skeleton.skeleton}`}
                  style={{ borderRadius: 0 }}
                />
              </div>
              <div className={gridStyles.title}>
                <div
                  className={skeleton.skeleton}
                  style={{
                    height: "0.9rem",
                    width: "85%",
                    borderRadius: "0.4rem",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

