"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .catch(() => {
        // If it fails, PWA install still works, but offline cache won't.
      });
  }, []);

  return null;
}

