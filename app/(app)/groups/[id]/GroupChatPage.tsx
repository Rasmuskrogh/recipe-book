"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useChat, type ChatMessage } from "@/hooks/useChat";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";
import { Avatar } from "@/components/ui/Avatar";
import { toast } from "react-hot-toast";
import styles from "./GroupChatPage.module.css";

type Member = {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  role: string;
};

type FriendEntry = {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  recipeCount: number;
};

interface GroupChatPageProps {
  groupId: string;
  groupName: string;
  groupDescription: string | null;
  conversationId: string;
  currentUserId: string;
  initialMessages: ChatMessage[];
  initialMembers: Member[];
}

export function GroupChatPage({
  groupId,
  groupName,
  groupDescription,
  conversationId,
  currentUserId,
  initialMessages,
  initialMembers,
}: GroupChatPageProps) {
  const router = useRouter();
  const { messages, setMessages, isLoading, sendMessage } = useChat(conversationId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [showMembers, setShowMembers] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [addSearch, setAddSearch] = useState("");
  const [selectedToAdd, setSelectedToAdd] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setMessages(initialMessages);
  }, [conversationId, initialMessages, setMessages]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `/api/conversations/${conversationId}/read`,
          { method: "POST" },
        );
        if (!res.ok) throw new Error("Kunde inte markera som läst");
        router.refresh();
      } catch {
        toast.error("Något gick fel, försök igen");
      }
    })();
  }, [conversationId, router]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}/members`);
      if (!res.ok) throw new Error("Kunde inte hämta medlemmar");
      const d = await res.json();
      setMembers(d.members ?? []);
    } catch {
      toast.error("Något gick fel, försök igen");
    }
  }, [groupId]);

  useEffect(() => {
    if (showAddModal) {
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
      fetchMembers();
    }
  }, [showAddModal, fetchMembers]);

  const memberIds = new Set(members.map((m) => m.id));
  const friendsNotInGroup = friends.filter((f) => !memberIds.has(f.id));
  const filteredToAdd = addSearch.trim()
    ? friendsNotInGroup.filter(
      (f) =>
      (f.name?.toLowerCase().includes(addSearch.toLowerCase()) ||
        f.username.toLowerCase().includes(addSearch.toLowerCase()))
    )
    : friendsNotInGroup;

  const toggleSelectAdd = (id: string) => {
    setSelectedToAdd((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addMembers = async () => {
    if (selectedToAdd.size === 0) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberIds: Array.from(selectedToAdd) }),
      });
      if (!res.ok) throw new Error("Kunde inte lägga till medlemmar");
      setShowAddModal(false);
      setSelectedToAdd(new Set());
      setAddSearch("");
      fetchMembers();
      router.refresh();
    } catch {
      toast.error("Något gick fel, försök igen");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <h1 className={styles.title}>{groupName}</h1>
          {groupDescription && (
            <p className={styles.description}>{groupDescription}</p>
          )}
        </div>
        <div className={styles.membersWrap}>
          <button
            type="button"
            className={styles.membersBtn}
            onClick={() => setShowMembers((v) => !v)}
            aria-expanded={showMembers}
          >
            Medlemmar ({members.length})
          </button>
          {showMembers && (
            <div className={styles.membersDropdown}>
              <ul className={styles.memberList}>
                {members.map((m) => (
                  <li key={m.id} className={styles.memberRow}>
                    <Avatar
                      src={m.image}
                      alt={m.name ?? m.username}
                      size="sm"
                    />
                    <span className={styles.memberName}>
                      {m.name || m.username}
                    </span>
                    {m.role === "ADMIN" && (
                      <span className={styles.roleBadge}>Admin</span>
                    )}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={styles.addMembersBtn}
                onClick={() => {
                  setShowMembers(false);
                  setShowAddModal(true);
                }}
              >
                Lägg till medlemmar
              </button>
            </div>
          )}
        </div>
      </header>

      {showAddModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowAddModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Lägg till medlemmar</h2>
            <p className={styles.modalHint}>
              Välj vänner som inte redan är i gruppen.
            </p>
            <input
              type="search"
              placeholder="Sök bland vänner..."
              value={addSearch}
              onChange={(e) => setAddSearch(e.target.value)}
              className={styles.searchInput}
            />
            <ul className={styles.friendList}>
              {filteredToAdd.slice(0, 15).map((f) => (
                <li key={f.id} className={styles.friendRow}>
                  <Avatar src={f.image} alt={f.name ?? f.username} size="sm" />
                  <span className={styles.friendName}>
                    {f.name || f.username}
                  </span>
                  <span className={styles.friendUsername}>@{f.username}</span>
                  <button
                    type="button"
                    className={
                      selectedToAdd.has(f.id)
                        ? styles.selectBtnActive
                        : styles.selectBtn
                    }
                    onClick={() => toggleSelectAdd(f.id)}
                  >
                    {selectedToAdd.has(f.id) ? "Vald" : "Lägg till"}
                  </button>
                </li>
              ))}
            </ul>
            {filteredToAdd.length === 0 && (
              <p className={styles.emptyModal}>
                Inga vänner att lägga till, eller alla är redan med i gruppen.
              </p>
            )}
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setShowAddModal(false)}
              >
                Stäng
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={addMembers}
                disabled={adding || selectedToAdd.size === 0}
              >
                {adding ? "Lägger till…" : "Lägg till"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.messages} ref={scrollRef}>
        {messages.length === 0 && (
          <p className={styles.empty}>Inga meddelanden än</p>
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
