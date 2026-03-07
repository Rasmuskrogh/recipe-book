"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import styles from "./MessagesList.module.css";

type ConversationItem = {
  id: string;
  name: string | null;
  displayName: string;
  unreadCount: number;
  participants: { id: string; name: string | null; username: string; image: string | null }[];
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    senderName: string;
  } | null;
};

type FriendEntry = {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  recipeCount: number;
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) {
    return d.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("sv-SE", { day: "numeric", month: "short" });
}

export function MessagesList({ currentUserId }: { currentUserId: string }) {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDm, setShowNewDm] = useState(false);
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [dmSearch, setDmSearch] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchConversations = useCallback(async () => {
    const res = await fetch("/api/messages");
    const data = await res.json();
    if (res.ok) setConversations(data.conversations ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!showNewDm) return;
    fetch("/api/friends")
      .then((r) => r.json())
      .then((d) => setFriends(d.friends ?? []))
      .catch(() => setFriends([]));
  }, [showNewDm]);

  const startDm = async (userId: string) => {
    setCreating(true);
    try {
      const res = await fetch("/api/messages/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok && data.conversationId) {
        setShowNewDm(false);
        setDmSearch("");
        router.push("/messages/" + data.conversationId);
      }
    } finally {
      setCreating(false);
    }
  };

  const filteredFriends = dmSearch.trim()
    ? friends.filter(
      (f) =>
      (f.name?.toLowerCase().includes(dmSearch.toLowerCase()) ||
        f.username.toLowerCase().includes(dmSearch.toLowerCase()))
    )
    : friends;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Meddelanden</h1>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btn}
            onClick={() => setShowNewDm(true)}
          >
            Ny DM
          </button>
        </div>
      </div>

      {showNewDm && (
        <div className={styles.modalOverlay} onClick={() => setShowNewDm(false)}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={styles.modalTitle}>Starta ny konversation</h2>
            <input
              type="search"
              placeholder="Sök bland dina vänner..."
              value={dmSearch}
              onChange={(e) => setDmSearch(e.target.value)}
              className={styles.searchInput}
            />
            <ul className={styles.friendList}>
              {filteredFriends.slice(0, 10).map((f) => (
                <li key={f.id} className={styles.friendRow}>
                  <Avatar src={f.image} alt={f.name ?? f.username} size="sm" />
                  <span className={styles.friendName}>
                    {f.name || f.username}
                  </span>
                  <span className={styles.friendUsername}>@{f.username}</span>
                  <button
                    type="button"
                    className={styles.selectBtn}
                    onClick={() => startDm(f.id)}
                    disabled={creating}
                  >
                    Välj
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => setShowNewDm(false)}
            >
              Stäng
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className={styles.empty}>Laddar…</p>
      ) : conversations.length === 0 ? (
        <p className={styles.empty}>Inga konversationer än. Starta en ny DM.</p>
      ) : (
        <ul className={styles.convList}>
          {conversations.map((c) => {
            const other = c.participants.find((p) => p.id !== currentUserId);
            const avatarUser = other ?? c.participants[0];
            const isUnread = (c.unreadCount ?? 0) > 0;
            return (
              <li key={c.id}>
                <Link
                  href={"/messages/" + c.id}
                  className={
                    isUnread
                      ? `${styles.convRow} ${styles.convRowUnread}`
                      : styles.convRow
                  }
                >
                  <Avatar
                    src={avatarUser?.image}
                    alt={c.displayName}
                    size="md"
                    className={styles.avatar}
                  />
                  <div className={styles.convBody}>
                    <span className={styles.convName}>
                      {c.displayName}
                      {isUnread && (
                        <span
                          className={styles.unreadDot}
                          aria-label={`${c.unreadCount} olästa`}
                        />
                      )}
                    </span>
                    {c.lastMessage && (
                      <span
                        className={
                          isUnread
                            ? `${styles.convPreview} ${styles.convPreviewUnread}`
                            : styles.convPreview
                        }
                      >
                        {c.lastMessage.senderName}:{" "}
                        {c.lastMessage.content.slice(0, 50)}
                        {c.lastMessage.content.length > 50 ? "…" : ""}
                      </span>
                    )}
                  </div>
                  {isUnread && (
                    <span className={styles.unreadBadge}>
                      {c.unreadCount > 99 ? "99+" : c.unreadCount}
                    </span>
                  )}
                  {c.lastMessage && (
                    <span className={styles.convTime}>
                      {formatTime(c.lastMessage.createdAt)}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
