import styles from './UserCard.module.css'

export interface UserCardProps {
  id: string
  username: string
  name?: string | null
  image?: string | null
  bio?: string | null
  recipeCount?: number
  friendCount?: number
}

export function UserCard(p: UserCardProps) {
  return <div className={styles.userCard}>UserCard: {p.username}</div>
}
