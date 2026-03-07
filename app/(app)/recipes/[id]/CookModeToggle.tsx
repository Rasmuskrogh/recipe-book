"use client";

import { WakeLockButton } from "@/components/recipe/WakeLockButton";
import { useWakeLock } from "@/hooks/useWakeLock";
import styles from "./CookModeToggle.module.css";

export function CookModeToggle() {
  const wakeLock = useWakeLock();

  return (
    <div className={styles.wrap}>
      <WakeLockButton
        isActive={wakeLock.isActive}
        onToggle={() => {
          if (wakeLock.isActive) wakeLock.release();
          else wakeLock.request();
        }}
        isSupported={wakeLock.isSupported}
      />
      {wakeLock.isActive && (
        <p className={styles.status}>Cook mode på – skärmen hålls aktiv</p>
      )}
    </div>
  );
}
