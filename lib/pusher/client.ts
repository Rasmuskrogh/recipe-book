import Pusher from "pusher-js";

declare global {
  interface Window {
    pusher: Pusher | undefined;
  }
}

export function getPusherClient() {
  if (typeof window === "undefined") return null;
  if (!window.pusher) {
    window.pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: "/api/pusher/auth",
    });
  }
  return window.pusher;
}

