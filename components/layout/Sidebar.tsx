import styles from './Sidebar.module.css'

export interface SidebarProps {
  user?: { username: string } | null
}

export function Sidebar(p: SidebarProps) {
  return <aside className={styles.sidebar}>Sidebar</aside>
}
