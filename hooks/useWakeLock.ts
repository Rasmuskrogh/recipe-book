import { useState, useEffect, useCallback } from "react";

export function useWakeLock() {
  const [isActive, setIsActive] = useState(false);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setIsSupported("wakeLock" in navigator);
    });
  }, []);

  const request = useCallback(async () => {
    if (!isSupported) return;
    try {
      const lock = await navigator.wakeLock.request("screen");
      setWakeLock(lock);
      setIsActive(true);
      lock.addEventListener("release", () => setIsActive(false));
    } catch (err) {
      console.error("Wake Lock failed:", err);
    }
  }, [isSupported]);

  const release = useCallback(async () => {
    if (wakeLock) {
      await wakeLock.release();
      setWakeLock(null);
      setIsActive(false);
    }
  }, [wakeLock]);

  return { isActive, isSupported, request, release };
}
