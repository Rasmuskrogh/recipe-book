"use client";

import { useMemo } from "react";
import { convertIngredient } from "@/lib/units/converter";
import type { IngredientFormData } from "@/types/recipe";
import type { UnitSystem } from "@/lib/units/types";
import styles from "./IngredientList.module.css";

export interface IngredientListProps {
  ingredients: IngredientFormData[];
  servings: number;
  onServingsChange?: (servings: number) => void;
  system?: UnitSystem;
}

export function IngredientList({
  ingredients,
  servings: _,
  system = "metric",
}: IngredientListProps) {
  const converted = useMemo(() => {
    return ingredients.map((ing) =>
      convertIngredient(
        { name: ing.name, amount: ing.amount, unit: ing.unit },
        system
      )
    );
  }, [ingredients, system]);

  return (
    <section className={styles.ingredientList}>
      <h2 className={styles.title}>Ingredienser</h2>
      <ul className={styles.list}>
        {converted.map((ing, i) => (
          <li key={i} className={styles.item}>
            <span className={styles.amount}>
              {ing.amount} {ing.unit}
            </span>
            <span className={styles.name}>{ing.name}</span>
            {ingredients[i]?.notes && (
              <span className={styles.notes}>({ingredients[i].notes})</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
