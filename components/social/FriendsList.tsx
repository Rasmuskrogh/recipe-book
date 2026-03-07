import styles from './FriendsList.module.css'

export interface FriendItem {
  id: string
  username: string
  name?: string | null
  image?: string | null
}

export interface FriendsListProps {
  friends: FriendItem[]
  onRemove?: (userId: string) => void
  isLoading?: boolean
}

export function FriendsList(_: FriendsListProps) {
  return <div className={styles.friendsList}>FriendsList</div>
}
