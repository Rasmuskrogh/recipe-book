import skeleton from "@/components/ui/SkeletonPulse.module.css";
import styles from "./page.module.css";
import formStyles from "./EditProfileForm.module.css";

export default function Loading() {
  return (
    <div className={styles.page} aria-hidden>
      <h1 className={styles.title}>
        <div
          className={skeleton.skeleton}
          style={{ height: "1.1rem", width: "10rem", borderRadius: "0.5rem" }}
        />
      </h1>

      <form className={formStyles.form}>
        <div className={formStyles.avatarSection}>
          <div
            className={skeleton.skeleton}
            style={{ width: "5rem", height: "5rem", borderRadius: "999px" }}
          />
          <div
            className={skeleton.skeleton}
            style={{ height: "1.2rem", width: "10rem", borderRadius: "0.4rem" }}
          />
        </div>

        <div className={formStyles.field}>
          <div className={formStyles.label}>
            <div
              className={skeleton.skeleton}
              style={{ height: "0.8rem", width: "3.5rem", borderRadius: "0.3rem" }}
            />
          </div>
          <div
            className={formStyles.input}
            style={{ height: "2.5rem" }}
          >
            <div
              className={skeleton.skeleton}
              style={{ height: "1rem", width: "70%", borderRadius: "0.3rem" }}
            />
          </div>
        </div>

        <div className={formStyles.field}>
          <div className={formStyles.label}>
            <div
              className={skeleton.skeleton}
              style={{ height: "0.8rem", width: "2.8rem", borderRadius: "0.3rem" }}
            />
          </div>
          <div
            className={formStyles.input}
            style={{ height: "8rem" }}
          >
            <div
              className={skeleton.skeleton}
              style={{ height: "1rem", width: "85%", borderRadius: "0.3rem" }}
            />
          </div>
        </div>

        <button type="button" className={formStyles.submit} disabled>
          <div
            className={skeleton.skeleton}
            style={{ height: "1rem", width: "5.5rem", borderRadius: "0.3rem" }}
          />
        </button>
      </form>
    </div>
  );
}

