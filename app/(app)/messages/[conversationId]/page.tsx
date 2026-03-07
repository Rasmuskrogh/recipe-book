import styles from './page.module.css'

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const { conversationId } = await params
  return (
    <div className={styles.page}>
      <h1>Konversation {conversationId}</h1>
    </div>
  )
}
