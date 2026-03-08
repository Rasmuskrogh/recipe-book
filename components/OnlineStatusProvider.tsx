"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { getPusherClient } from "@/lib/pusher/client";

export function OnlineStatusProvider() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    if (status !== "authenticated" || !userId) return;

    fetch("/api/users/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOnline: true }),
    }).catch(() => { });

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
      fetch("/api/users/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline: false }),
      }).catch(() => { });
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
