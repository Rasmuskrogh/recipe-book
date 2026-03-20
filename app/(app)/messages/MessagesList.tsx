"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { getPusherClient } from "@/lib/pusher/client";
import { toast } from "react-hot-toast";
import skeleton from "@/components/ui/SkeletonPulse.module.css";
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
    try {
      const res = await fetch("/api/messages");
      if (!res.ok) throw new Error("Kunde inte hämta konversationer");
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } catch {
      toast.error("Något gick fel, försök igen");
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!currentUserId) return;
    const pusher = getPusherClient();
    if (!pusher) return;
    const channel = pusher.subscribe(`user-${currentUserId}`);
    channel.bind("new-conversation", () => {
      fetchConversations();
    });
    return () => {
      channel.unbind("new-conversation");
      pusher.unsubscribe(`user-${currentUserId}`);
    };
  }, [currentUserId, fetchConversations]);

  useEffect(() => {
    if (!showNewDm) return;
    (async () => {
      try {
        const res = await fetch("/api/friends");
        if (!res.ok) throw new Error("Kunde inte hämta vänner");
        const d = await res.json();
        setFriends(d.friends ?? []);
      } catch {
        toast.error("Något gick fel, försök igen");
        setFriends([]);
      }
    })();
  }, [showNewDm]);

  const startDm = async (userId: string) => {
    setCreating(true);
    try {
      const res = await fetch("/api/messages/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Kunde inte starta DM");
      if (data.conversationId) {
        setShowNewDm(false);
        setDmSearch("");
        router.push("/messages/" + data.conversationId);
      } else {
        toast.error("Något gick fel, försök igen");
      }
    } catch {
      toast.error("Något gick fel, försök igen");
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
        <ul className={styles.convList} aria-hidden>
          {Array.from({ length: 7 }).map((_, i) => (
            <li key={i}>
              <div className={styles.convRow}>
                <div
                  className={styles.avatar}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 999,
                    background: "var(--border)",
                    opacity: 0.75,
                  }}
                />
                <div className={styles.convBody}>
                  <div
                    className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
                    style={{ height: "1rem", width: "55%" }}
                  />
                  <div
                    className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
                    style={{ height: "0.8rem", width: "90%" }}
                  />
                </div>
                <span
                  className={styles.unreadBadge}
                  style={{ background: "var(--border)", color: "transparent" }}
                  aria-hidden
                />
                <div
                  className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
                  style={{ height: "0.75rem", width: "4.5rem", flexShrink: 0 }}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : conversations.length === 0 ? (
        <p className={styles.empty}>Inga konversationer än</p>
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
