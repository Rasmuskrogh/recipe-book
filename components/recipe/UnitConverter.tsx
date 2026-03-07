"use client";

import styles from "./UnitConverter.module.css";

export interface UnitConverterProps {
  system: "metric" | "imperial";
  onChange: (system: "metric" | "imperial") => void;
}

export function UnitConverter({ system, onChange }: UnitConverterProps) {
  return (
    <div className={styles.unitConverter}>
      <span className={styles.label}>Enheter:</span>
      <button
        type="button"
        className={system === "metric" ? styles.active : ""}
        onClick={() => onChange("metric")}
      >
        Metric
      </button>
      <button
        type="button"
        className={system === "imperial" ? styles.active : ""}
        onClick={() => onChange("imperial")}
      >
        Imperial
      </button>
    </div>
  );
}
