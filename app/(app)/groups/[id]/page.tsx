import styles from './page.module.css'

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div className={styles.page}>
      <h1>Grupp {id}</h1>
    </div>
  )
}
