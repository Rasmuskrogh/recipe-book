"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useChat, type ChatMessage } from "@/hooks/useChat";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";
import styles from "./ChatView.module.css";

interface ChatViewProps {
  conversationId: string;
  currentUserId: string;
  displayName: string;
  initialMessages: ChatMessage[];
}

export function ChatView({
  conversationId,
  currentUserId,
  displayName,
  initialMessages,
}: ChatViewProps) {
  const router = useRouter();
  const { messages, setMessages, isLoading, sendMessage } = useChat(conversationId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    fetch(`/api/conversations/${conversationId}/read`, { method: "POST" })
      .then(() => router.refresh())
      .catch(() => { });
  }, [conversationId, router]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>{displayName}</h1>
      </header>
      <div className={styles.messages} ref={scrollRef}>
        {messages.length === 0 && (
          <p className={styles.empty}>Inga meddelanden än. Skriv något!</p>
        )}
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            content={m.content}
            isOwn={m.senderId === currentUserId}
            senderName={m.sender.name ?? m.sender.username}
            senderImage={m.sender.image}
            createdAt={m.createdAt}
          />
        ))}
      </div>
      <MessageInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
