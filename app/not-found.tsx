import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.wrapper} role="alert">
      <div className={styles.card}>
        <div className={styles.kicker}>404</div>
        <h1 className={styles.title}>Sidan hittades inte</h1>
        <p className={styles.message}>
          Det verkar som att länken inte längre finns. Gå gärna tillbaka till
          flödet.
        </p>
        <Link href="/feed" className={styles.linkBtn}>
          Tillbaka till flödet
        </Link>
      </div>
    </div>
  );
}

