"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/Avatar";
import { getPusherClient } from "@/lib/pusher/client";
import { toast } from "react-hot-toast";
import skeleton from "@/components/ui/SkeletonPulse.module.css";
import styles from "./GroupsList.module.css";

type GroupItem = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  role: string;
  conversationId: string | null;
  lastMessage: {
    content: string;
    createdAt: string;
    senderName: string;
  } | null;
  unreadCount: number;
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

export function GroupsList() {
  const router = useRouter();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ?? null;
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await fetch("/api/groups");
      if (!res.ok) throw new Error("Kunde inte hämta grupper");
      const data = await res.json();
      setGroups(data.groups ?? []);
    } catch {
      toast.error("Något gick fel, försök igen");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    if (!currentUserId) return;
    const pusher = getPusherClient();
    if (!pusher) return;
    const channel = pusher.subscribe(`user-${currentUserId}`);
    channel.bind("new-conversation", () => {
      fetchGroups();
    });
    return () => {
      channel.unbind("new-conversation");
      pusher.unsubscribe(`user-${currentUserId}`);
    };
  }, [currentUserId, fetchGroups]);

  useEffect(() => {
    if (!showNewGroup) return;
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
  }, [showNewGroup]);

  const createGroup = async () => {
    if (!groupName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: groupName.trim(),
          description: groupDescription.trim() || undefined,
          memberIds: Array.from(selectedMemberIds),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Kunde inte skapa grupp");
      if (data.group?.conversationId) {
        setShowNewGroup(false);
        setGroupName("");
        setGroupDescription("");
        setSelectedMemberIds(new Set());
        router.push("/groups/" + data.group.id);
        fetchGroups();
        toast.success("Grupp skapad");
      } else {
        toast.error("Något gick fel, försök igen");
      }
    } catch {
      toast.error("Något gick fel, försök igen");
    } finally {
      setCreating(false);
    }
  };

  const toggleMember = (id: string) => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Grupper</h1>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btn}
            onClick={() => setShowNewGroup(true)}
          >
            Skapa ny grupp
          </button>
        </div>
      </div>

      {showNewGroup && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowNewGroup(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Skapa ny grupp</h2>
            <label className={styles.label}>
              Gruppnamn
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className={styles.input}
                placeholder="T.ex. Familjen"
              />
            </label>
            <label className={styles.label}>
              Beskrivning (valfritt)
              <input
                type="text"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                className={styles.input}
                placeholder="Valfri beskrivning"
              />
            </label>
            <p className={styles.label}>Lägg till medlemmar (vänner)</p>
            <ul className={styles.friendList}>
              {friends.map((f) => (
                <li key={f.id} className={styles.friendRow}>
                  <Avatar src={f.image} alt={f.name ?? f.username} size="sm" />
                  <span className={styles.friendName}>
                    {f.name || f.username}
                  </span>
                  <button
                    type="button"
                    className={
                      selectedMemberIds.has(f.id)
                        ? styles.selectBtnActive
                        : styles.selectBtn
                    }
                    onClick={() => toggleMember(f.id)}
                  >
                    {selectedMemberIds.has(f.id) ? "Vald" : "Välj"}
                  </button>
                </li>
              ))}
            </ul>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setShowNewGroup(false)}
              >
                Avbryt
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={createGroup}
                disabled={creating || !groupName.trim()}
              >
                {creating ? "Skapar…" : "Skapa grupp"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <ul className={styles.groupList} aria-hidden>
          {Array.from({ length: 7 }).map((_, i) => (
            <li key={i}>
              <div className={styles.groupRow}>
                <div
                  className={`${skeleton.skeleton} ${styles.groupIcon}`}
                  style={{ borderRadius: "0.5rem" }}
                />
                <div className={styles.groupBody}>
                  <div
                    className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
                    style={{ height: "1rem", width: "55%" }}
                  />
                  <div
                    className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
                    style={{ height: "0.8rem", width: "92%" }}
                  />
                </div>
                <span
                  className={styles.unreadBadge}
                  style={{ background: "var(--border)", color: "transparent" }}
                  aria-hidden
                />
                <div
                  className={`${skeleton.skeleton} ${skeleton.skeletonInheritRadius}`}
                  style={{ height: "0.75rem", width: "4.2rem" }}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : groups.length === 0 ? (
        <p className={styles.empty}>
          Du är inte med i någon grupp än
        </p>
      ) : (
        <ul className={styles.groupList}>
          {groups.map((g) => {
            const isUnread = (g.unreadCount ?? 0) > 0;
            const href = "/groups/" + g.id;
            return (
              <li key={g.id}>
                <Link
                  href={href}
                  className={
                    isUnread
                      ? `${styles.groupRow} ${styles.groupRowUnread}`
                      : styles.groupRow
                  }
                >
                  <div className={styles.groupIcon}>👥</div>
                  <div className={styles.groupBody}>
                    <span className={styles.groupName}>
                      {g.name}
                      {isUnread && (
                        <span
                          className={styles.unreadDot}
                          aria-label={`${g.unreadCount} olästa`}
                        />
                      )}
                    </span>
                    {g.lastMessage && (
                      <span
                        className={
                          isUnread
                            ? `${styles.groupPreview} ${styles.groupPreviewUnread}`
                            : styles.groupPreview
                        }
                      >
                        {g.lastMessage.senderName}:{" "}
                        {g.lastMessage.content.slice(0, 50)}
                        {g.lastMessage.content.length > 50 ? "…" : ""}
                      </span>
                    )}
                  </div>
                  {isUnread && (
                    <span className={styles.unreadBadge}>
                      {g.unreadCount > 99 ? "99+" : g.unreadCount}
                    </span>
                  )}
                  {g.lastMessage && (
                    <span className={styles.groupTime}>
                      {formatTime(g.lastMessage.createdAt)}
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
