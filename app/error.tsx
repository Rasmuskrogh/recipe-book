"use client";

import styles from "./error.module.css";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={styles.wrapper} role="alert">
      <div className={styles.card}>
        <h1 className={styles.title}>Något gick fel</h1>
        <p className={styles.message}>
          Vi kunde inte läsa in sidan just nu. Försök igen så löser det sig
          oftast.
        </p>
        <button type="button" className={styles.button} onClick={reset}>
          Försök igen
        </button>

        {error?.digest && <div className={styles.details}>Fel-ID: {error.digest}</div>}
      </div>
    </div>
  );
}

