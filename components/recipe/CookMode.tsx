import styles from './CookMode.module.css'
import type { IngredientFormData, StepFormData } from '@/types/recipe'

export interface CookModeProps {
  title: string
  ingredients: IngredientFormData[]
  steps: StepFormData[]
  servings: number
}

export function CookMode({
  title,
  ingredients: _,
  steps: __,
  servings: ___,
}: CookModeProps) {
  return (
    <div className={styles.cookMode}>
      CookMode: {title}
    </div>
  )
}
