import styles from './MessageBubble.module.css'

export interface MessageBubbleProps {
  content: string
  isOwn: boolean
  senderName?: string | null
  senderImage?: string | null
  createdAt: Date
}

export function MessageBubble(props: MessageBubbleProps) {
  return <div className={styles.messageBubble}>MessageBubble</div>
}
