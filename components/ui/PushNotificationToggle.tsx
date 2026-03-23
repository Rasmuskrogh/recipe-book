"use client";

import { useState } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import styles from "./PushNotificationToggle.module.css";

export function PushNotificationToggle() {
  const { isSupported, isSubscribed, subscribe, unsubscribe } =
    usePushNotifications();
  const [isBusy, setIsBusy] = useState(false);

  if (!isSupported) return null;

  const handleClick = async () => {
    setIsBusy(true);
    try {
      if (isSubscribed) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <button
      type="button"
      className={styles.button}
      onClick={handleClick}
      disabled={isBusy}
    >
      {isSubscribed ? "Stäng av notifikationer" : "Aktivera notifikationer"}
    </button>
  );
}
