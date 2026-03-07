import styles from './ConversationList.module.css'

export interface ConversationItem {
  id: string
  participants: { username: string; name?: string | null; image?: string | null }[]
  lastMessage?: { content: string; createdAt: Date } | null
}

export interface ConversationListProps {
  conversations: ConversationItem[]
  activeId?: string | null
  onSelect: (conversationId: string) => void
  isLoading?: boolean
}

export function ConversationList(_: ConversationListProps) {
  return <div className={styles.conversationList}>ConversationList</div>
}
