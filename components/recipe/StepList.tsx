import styles from "./StepList.module.css";
import type { StepFormData } from "@/types/recipe";

export interface StepListProps {
  steps: StepFormData[];
  currentStep?: number;
  onStepChange?: (index: number) => void;
}

export function StepList({
  steps,
}: StepListProps) {
  return (
    <section className={styles.stepList}>
      <h2 className={styles.title}>Gör så här</h2>
      <ol className={styles.list}>
        {steps.map((step, i) => (
          <li key={i} className={styles.item}>
            <span className={styles.num}>{i + 1}.</span>
            <span className={styles.instruction}>{step.instruction}</span>
            {step.duration != null && step.duration > 0 && (
              <span className={styles.duration}>— {step.duration} min</span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
