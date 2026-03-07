import styles from './ChatWindow.module.css'
import type { ChatMessage } from '@/types/chat'

export interface ChatWindowProps {
  conversationId: string
  messages: ChatMessage[]
  onSend: (content: string) => void
  isLoading?: boolean
}

export function ChatWindow(_: ChatWindowProps) {
  return <div className={styles.chatWindow}>ChatWindow</div>
}
