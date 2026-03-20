import Link from 'next/link'
import styles from './page.module.css'

export default function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.logo}>Platemate</h1>
          <p className={styles.tagline}>Dela recept. Matlagning tillsammans.</p>
          <div className={styles.buttons}>
            <Link href="/register" className={styles.btnPrimary}>Registrera dig</Link>
            <Link href="/login" className={styles.btnOutline}>Logga in</Link>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.feature}>
          <span className={styles.icon}>🍽️</span>
          <h2>Dela recept</h2>
          <p>Ladda upp och dela dina favoritrecept med familj och vänner.</p>
        </div>
        <div className={styles.feature}>
          <span className={styles.icon}>👥</span>
          <h2>Socialt nätverk</h2>
          <p>Följ vänner, skicka meddelanden och skapa grupper.</p>
        </div>
        <div className={styles.feature}>
          <span className={styles.icon}>📱</span>
          <h2>Alltid tillgänglig</h2>
          <p>Installera som app på din telefon och laga mat med skärmen tänd.</p>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>© 2026 Platemate</p>
      </footer>
    </div>
  )
}