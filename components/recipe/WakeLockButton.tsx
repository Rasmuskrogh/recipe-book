"use client";

import styles from "./WakeLockButton.module.css";

export interface WakeLockButtonProps {
  isActive: boolean;
  onToggle: () => void;
  isSupported?: boolean;
}

export function WakeLockButton({
  isActive,
  onToggle,
  isSupported = true,
}: WakeLockButtonProps) {
  if (!isSupported) return null;

  return (
    <button
      type="button"
      className={`${styles.wakeLockButton} ${isActive ? styles.active : ""}`}
      onClick={onToggle}
      title={isActive ? "Slå av skärmlås" : "Håll skärmen aktiv"}
    >
      {isActive ? "🔓 Skärmlås på" : "🔒 Håll skärmen aktiv"}
    </button>
  );
}
