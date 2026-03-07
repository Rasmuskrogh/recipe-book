export interface RecipeFormData {
  title: string;
  description?: string;
  servings: number;
  prepTime?: number;
  cookTime?: number;
  difficulty?: "easy" | "medium" | "hard";
  ingredients: IngredientFormData[];
  steps: StepFormData[];
  tags: string[];
}

export interface IngredientFormData {
  name: string;
  amount: number;
  unit: string;
  notes?: string;
}

export interface StepFormData {
  instruction: string;
  duration?: number;
}
