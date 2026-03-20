"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { getPusherClient } from "@/lib/pusher/client";
import { toast } from "react-hot-toast";

export function OnlineStatusProvider() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const didToastRef = useRef(false);

  async function patchStatus(isOnline: boolean, toastOnError: boolean) {
    try {
      const res = await fetch("/api/users/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline }),
      });
      if (!res.ok) throw new Error("Kunde inte uppdatera status");
    } catch {
      if (toastOnError && !didToastRef.current) {
        didToastRef.current = true;
        toast.error("Något gick fel, försök igen");
      }
    }
  }

  useEffect(() => {
    if (status !== "authenticated" || !userId) return;

    void patchStatus(true, true);

    const pusher = getPusherClient();
    if (pusher) {
      try {
        const channel = pusher.subscribe(`presence-user-${userId}`);
        channel.bind("pusher:subscription_succeeded", () => { });
      } catch {
        // Presence may require server-side auth; offline is set on unload
      }
    }

    function setOffline() {
      void patchStatus(false, false);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") setOffline();
    }
    function handleBeforeUnload() {
      setOffline();
    }
    function handlePageHide() {
      setOffline();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
      setOffline();
      if (pusher) {
        try {
          pusher.unsubscribe(`presence-user-${userId}`);
        } catch {
          // ignore
        }
      }
    };
  }, [status, userId]);

  return null;
}
