import styles from './GroupChat.module.css'

export interface GroupChatMessage {
  id: string
  content: string
  senderId: string
  senderName?: string | null
  createdAt: Date
}

export interface GroupChatProps {
  groupId: string
  messages: GroupChatMessage[]
  onSend: (content: string) => void
  isLoading?: boolean
}

export function GroupChat(_: GroupChatProps) {
  return <div className={styles.groupChat}>GroupChat</div>
}
