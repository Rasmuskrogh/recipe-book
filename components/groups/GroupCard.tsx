import styles from './GroupCard.module.css'

export interface GroupCardProps {
  id: string
  name: string
  description?: string | null
  imageUrl?: string | null
  memberCount?: number
}

export function GroupCard(p: GroupCardProps) {
  return <div className={styles.groupCard}>GroupCard: {p.name}</div>
}
