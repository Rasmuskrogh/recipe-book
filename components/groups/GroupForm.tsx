import styles from './GroupForm.module.css'

export interface GroupFormData {
  name: string
  description?: string
}

export interface GroupFormProps {
  defaultValues?: Partial<GroupFormData>
  onSubmit: (data: GroupFormData) => void | Promise<void>
  isSubmitting?: boolean
}

export function GroupForm(_: GroupFormProps) {
  return <div className={styles.groupForm}>GroupForm</div>
}
