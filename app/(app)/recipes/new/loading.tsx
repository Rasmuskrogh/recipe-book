import styles from "./page.module.css";
import skeleton from "@/components/ui/SkeletonPulse.module.css";

export default function Loading() {
  return (
    <div className={styles.page} aria-hidden>
      <h1 className={styles.title}>
        <div
          className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
          style={{ height: "1.2rem", width: "10rem" }}
        />
      </h1>

      <form className={styles.form}>
        <div className={styles.field}>
          <div
            className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
            style={{ height: "0.75rem", width: "7rem" }}
          />
          <div
            className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
            style={{ height: "2.8rem", width: "100%" }}
          />
        </div>

        <div className={styles.field}>
          <div
            className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
            style={{ height: "0.75rem", width: "8rem" }}
          />
          <div
            className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
            style={{ height: "8.5rem", width: "100%" }}
          />
        </div>

        <div className={styles.field}>
          <div
            className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
            style={{ height: "0.75rem", width: "6.5rem" }}
          />
          <div
            className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
            style={{ height: "2.8rem", width: "12rem" }}
          />
        </div>

        <div className={styles.field}>
          <div
            className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
            style={{ height: "0.75rem", width: "6.5rem" }}
          />
          <div
            className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
            style={{ height: "2.8rem", width: "9rem" }}
          />
        </div>

        <div className={styles.row} aria-hidden>
          <div className={styles.field}>
            <div
              className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
              style={{ height: "0.75rem", width: "5rem" }}
            />
            <div
              className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
              style={{ height: "2.8rem", width: "100%" }}
            />
          </div>

          <div className={styles.field}>
            <div
              className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
              style={{ height: "0.75rem", width: "6rem" }}
            />
            <div
              className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
              style={{ height: "2.8rem", width: "100%" }}
            />
          </div>

          <div className={styles.field}>
            <div
              className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
              style={{ height: "0.75rem", width: "9rem" }}
            />
            <div
              className={styles.timeInputWrap}
              aria-hidden
              style={{ width: "100%" }}
            >
              <div
                className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
                style={{ height: "2.8rem", width: "100%" }}
              />
            </div>
          </div>

          <div className={styles.field}>
            <div
              className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
              style={{ height: "0.75rem", width: "9rem" }}
            />
            <div
              className={styles.timeInputWrap}
              aria-hidden
              style={{ width: "100%" }}
            >
              <div
                className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
                style={{ height: "2.8rem", width: "100%" }}
              />
            </div>
          </div>
        </div>

        <div className={styles.field}>
          <div
            className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
            style={{ height: "0.75rem", width: "3.5rem" }}
          />
          <div className={styles.imageUploadZone}>
            <div
              className={`${styles.preview} ${skeleton.skeleton}`}
              style={{
                width: "100%",
                height: "10rem",
                borderRadius: "0.25rem",
              }}
            />
            <div
              className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
              style={{ height: "2.6rem", width: "8rem" }}
            />
          </div>
          <div
            style={{ display: "none" }}
            aria-hidden
          />
        </div>

        <div className={styles.unitToggle}>
          <div
            className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
            style={{ height: "1rem", width: "5rem" }}
          />
          <div
            className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
            style={{ height: "1.8rem", width: "5.5rem" }}
          />
          <div
            className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
            style={{ height: "1.8rem", width: "6rem" }}
          />
        </div>

        <section className={styles.section}>
          <h2>Ingredienser</h2>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className={styles.ingRow} aria-hidden>
              <div
                className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
                style={{ height: "2.4rem", width: "14rem" }}
              />
              <div
                className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
                style={{ height: "2.4rem", width: "4.5rem" }}
              />
              <div
                className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
                style={{ height: "2.4rem", width: "5rem" }}
              />
              <div
                className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
                style={{ height: "2.4rem", width: "10rem" }}
              />
              <div
                className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
                style={{ height: "1.8rem", width: "1.8rem" }}
              />
            </div>
          ))}
          <div className={styles.appendBtn} aria-hidden>
            <div
              className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
              style={{ height: "1rem", width: "10rem", opacity: 0.65 }}
            />
          </div>
        </section>

        <section className={styles.section}>
          <h2>Steg</h2>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className={styles.stepRow} aria-hidden>
              <div
                className={styles.stepNum}
                style={{
                  height: "2.2rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
                  style={{ height: "0.85rem", width: "2rem" }}
                />
              </div>
              <div className={styles.stepEditorCell}>
                <div
                  className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
                  style={{ height: "4.5rem", width: "100%" }}
                />
              </div>
              <div className={styles.stepActions}>
                <div
                  className={styles.stepDuration}
                  style={{ height: "2.7rem", width: "4.6rem" }}
                >
                  <div
                    className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
                    style={{ height: "1.2rem", width: "3.2rem" }}
                  />
                </div>
                <div
                  className={styles.removeBtn}
                  style={{ height: "2.7rem", width: "5rem" }}
                >
                  <div
                    className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
                    style={{ height: "0.9rem", width: "4rem" }}
                  />
                </div>
              </div>
            </div>
          ))}
          <div className={styles.appendBtn} aria-hidden>
            <div
              className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
              style={{ height: "1rem", width: "8rem", opacity: 0.65 }}
            />
          </div>
        </section>

        <button type="button" className={styles.submit} disabled aria-hidden>
          <div
            className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
            style={{ height: "1rem", width: "7.5rem", opacity: 0.7 }}
          />
        </button>
      </form>
    </div>
  );
}

