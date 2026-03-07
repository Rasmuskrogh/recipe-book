"use client";

import { useState } from "react";
import { WakeLockButton } from "@/components/recipe/WakeLockButton";
import { useWakeLock } from "@/hooks/useWakeLock";
import { IngredientList } from "@/components/recipe/IngredientList";
import { StepList } from "@/components/recipe/StepList";
import { UnitConverter } from "@/components/recipe/UnitConverter";
import type { IngredientFormData, StepFormData } from "@/types/recipe";
import type { UnitSystem } from "@/lib/units/types";
import styles from "./CookModeView.module.css";

export interface CookModeViewProps {
  title: string;
  ingredients: IngredientFormData[];
  steps: StepFormData[];
  servings: number;
}

export function CookModeView({
  title,
  ingredients,
  steps,
  servings,
}: CookModeViewProps) {
  const { isActive, isSupported, request, release } = useWakeLock();
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");

  function handleWakeLockToggle() {
    if (isActive) release();
    else request();
  }

  return (
    <div className={styles.cookMode}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.wakeLockWrap}>
        <WakeLockButton
          isActive={isActive}
          onToggle={handleWakeLockToggle}
          isSupported={isSupported}
        />
      </div>
      <UnitConverter system={unitSystem} onChange={setUnitSystem} />
      <IngredientList
        ingredients={ingredients}
        servings={servings}
        system={unitSystem}
      />
      <StepList steps={steps} />
    </div>
  );
}
