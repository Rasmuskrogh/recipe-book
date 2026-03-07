import styles from './MessageInput.module.css'

export interface MessageInputProps {
  onSend: (content: string) => void
  disabled?: boolean
  placeholder?: string
}

export function MessageInput(props: MessageInputProps) {
  return <div className={styles.messageInput}>MessageInput</div>
}
