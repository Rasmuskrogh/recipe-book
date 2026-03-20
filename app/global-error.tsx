"use client";

import styles from "./error.module.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
}) {
  return (
    <div className={styles.wrapper} role="alert">
      <div className={styles.card}>
        <h1 className={styles.title}>Något gick fel</h1>
        <p className={styles.message}>
          Oväntat fel inträffade. Försök igen – och om problemet kvarstår, ladda
          om sidan.
        </p>
        <button
          type="button"
          className={styles.button}
          onClick={() => (reset ? reset() : window.location.reload())}
        >
          Försök igen
        </button>
        {error?.digest && <div className={styles.details}>Fel-ID: {error.digest}</div>}
      </div>
    </div>
  );
}

