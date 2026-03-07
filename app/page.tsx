import Link from 'next/link'
import styles from './page.module.css'

export default function HomePage() {
  return (
    <div className={styles.page}>
      <h1>Recept & Nätverk</h1>
      <nav>
        <Link href="/login">Logga in</Link>
        <Link href="/register">Registrera</Link>
        <Link href="/feed">Flöde</Link>
        <Link href="/recipes">Recept</Link>
      </nav>
    </div>
  )
}
