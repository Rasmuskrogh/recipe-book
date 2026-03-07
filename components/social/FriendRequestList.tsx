import styles from './FriendRequestList.module.css'

export interface FriendRequestItem {
  id: string
  sender: { id: string; username: string; name?: string | null; image?: string | null }
  createdAt: Date
}

export interface FriendRequestListProps {
  requests: FriendRequestItem[]
  onAccept: (requestId: string) => void
  onReject: (requestId: string) => void
  isLoading?: boolean
}

export function FriendRequestList(_: FriendRequestListProps) {
  return <div className={styles.friendRequestList}>FriendRequestList</div>
}
