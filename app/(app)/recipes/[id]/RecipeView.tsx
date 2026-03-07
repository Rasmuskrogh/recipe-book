"use client";

import { useState } from "react";
import { IngredientList } from "@/components/recipe/IngredientList";
import { StepList } from "@/components/recipe/StepList";
import { UnitConverter } from "@/components/recipe/UnitConverter";
import type { IngredientFormData, StepFormData } from "@/types/recipe";
import type { UnitSystem } from "@/lib/units/types";

export interface RecipeViewProps {
  ingredients: IngredientFormData[];
  steps: StepFormData[];
  servings: number;
}

export function RecipeView({
  ingredients,
  steps,
  servings,
}: RecipeViewProps) {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");

  return (
    <>
      <div className="recipeViewConverter">
        <UnitConverter system={unitSystem} onChange={setUnitSystem} />
      </div>
      <IngredientList
        ingredients={ingredients}
        servings={servings}
        system={unitSystem}
      />
      <StepList steps={steps} />
    </>
  );
}
