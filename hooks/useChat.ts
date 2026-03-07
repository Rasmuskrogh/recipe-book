"use client";

import { useState, useCallback, useEffect } from "react";
import { getPusherClient } from "@/lib/pusher/client";

export type ChatMessage = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
  };
};

export function useChat(conversationId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) return;
    const pusher = getPusherClient();
    if (!pusher) return;
    const channel = pusher.subscribe(`conversation-${conversationId}`);
    const handler = (data: { message: ChatMessage }) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.message.id)) return prev;
        return [...prev, data.message];
      });
    };
    channel.bind("new-message", handler);
    return () => {
      channel.unbind("new-message", handler);
      pusher.unsubscribe(`conversation-${conversationId}`);
    };
  }, [conversationId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId) return;
      setIsLoading(true);
      try {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, content }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Kunde inte skicka");
        }
        const data = await res.json();
        if (data.message) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.message.id)) return prev;
            return [...prev, data.message];
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId]
  );

  return { messages, setMessages, isLoading, sendMessage };
}
