import { useState, useCallback } from "react";

export function useChat(conversationId: string | null) {
  const [messages, setMessages] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (_content: string) => {
      if (!conversationId) return;
      // Placeholder
    },
    [conversationId]
  );

  return { messages, isLoading, sendMessage };
}
