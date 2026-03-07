import styles from './RecipeForm.module.css'
import type { RecipeFormData } from '@/types/recipe'

export interface RecipeFormProps {
  defaultValues?: Partial<RecipeFormData>
  onSubmit: (data: RecipeFormData) => void | Promise<void>
  isSubmitting?: boolean
}

export function RecipeForm(_: RecipeFormProps) {
  return <div className={styles.recipeForm}>RecipeForm</div>
}
