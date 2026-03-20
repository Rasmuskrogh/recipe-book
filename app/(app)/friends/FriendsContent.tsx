"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import type { FriendEntry, IncomingRequestEntry } from "@/lib/friends";
import { getPusherClient } from "@/lib/pusher/client";
import { toast } from "react-hot-toast";
import styles from "./FriendsContent.module.css";

type SearchUser = {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  recipeCount: number;
};

type Tab = "friends" | "requests";

interface FriendsContentProps {
  initialFriends: FriendEntry[];
  initialRequests: IncomingRequestEntry[];
}

export function FriendsContent({
  initialFriends,
  initialRequests,
}: FriendsContentProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("friends");
  const [friends, setFriends] = useState(initialFriends);
  const [requests, setRequests] = useState(initialRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const friendIdsKey = friends
    .map((f) => f.id)
    .slice()
    .sort()
    .join("|");

  useEffect(() => {
    if (tab !== "friends") return;
    if (!friendIdsKey) return;

    const pusher = getPusherClient();
    if (!pusher) return;

    let cancelled = false;

    const friendIds = friendIdsKey.split("|").filter(Boolean);
    const channelNames: string[] = [];

    const setOnlineFor = (friendId: string, isOnline: boolean) => {
      if (cancelled) return;
      setFriends((prev) =>
        prev.map((f) => (f.id === friendId ? { ...f, isOnline } : f))
      );
    };

    for (const friendId of friendIds) {
      const channelName = `presence-user-${friendId}`;
      channelNames.push(channelName);
      const channel: any = pusher.subscribe(channelName);

      const syncFromChannel = () => {
        const members = channel?.members;
        const online = !!members && Object.keys(members).includes(friendId);
        setOnlineFor(friendId, online);
      };

      channel.bind("pusher:subscription_succeeded", syncFromChannel);
      channel.bind("pusher:member_added", (member: any) => {
        if (member?.id === friendId) setOnlineFor(friendId, true);
      });
      channel.bind("pusher:member_removed", (member: any) => {
        if (member?.id === friendId) syncFromChannel();
      });
    }

    return () => {
      cancelled = true;
      for (const channelName of channelNames) {
        try {
          pusher.unsubscribe(channelName);
        } catch {
          // ignore
        }
      }
    };
  }, [tab, friendIdsKey]);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        "/api/users?search=" + encodeURIComponent(q.trim())
      );
      if (!res.ok) throw new Error("Kunde inte söka användare");
      const data = await res.json();
      setSearchResults(data.users ?? []);
      // intentionally silent: empty results are a valid outcome
    } catch {
      setSearchResults([]);
      toast.error("Något gick fel, försök igen");
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (value.trim().length >= 1) {
      searchTimeoutRef.current = setTimeout(() => runSearch(value), 300);
    } else {
      setSearchResults([]);
    }
  };

  const sendRequest = async (receiverId: string) => {
    setSendingId(receiverId);
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId }),
      });
      if (!res.ok) throw new Error("Kunde inte skicka förfrågan");
      setSearchResults((prev) => prev.filter((u) => u.id !== receiverId));
      toast.success("Förfrågan skickad");
      router.refresh();
    } catch {
      toast.error("Något gick fel, försök igen");
    } finally {
      setSendingId(null);
    }
  };

  const handleAccept = async (requestId: string) => {
    const req = requests.find((r) => r.id === requestId);
    try {
      const res = await fetch("/api/friends", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action: "accept" }),
      });
      if (!res.ok) throw new Error("Kunde inte acceptera");
      if (req) {
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
        setFriends((prev) => [...prev, req.sender]);
        toast.success("Vänskap accepterad");
        router.refresh();
      }
    } catch {
      toast.error("Något gick fel, försök igen");
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const res = await fetch("/api/friends", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action: "reject" }),
      });
      if (!res.ok) throw new Error("Kunde inte avvisa");
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      toast.success("Förfrågan avvisad");
      router.refresh();
    } catch {
      toast.error("Något gick fel, försök igen");
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Vänner</h1>

      <div className={styles.searchWrap}>
        <label htmlFor="user-search" className={styles.searchLabel}>
          Sök användare
        </label>
        <input
          id="user-search"
          type="search"
          placeholder="Sök på namn eller användarnamn..."
          value={searchQuery}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
        {searching && <span className={styles.searching}>Söker…</span>}
        {searchResults.length > 0 && (
          <ul className={styles.searchResults}>
            {searchResults.map((u) => (
              <li key={u.id} className={styles.searchRow}>
                <Link
                  href={"/profile/" + encodeURIComponent(u.username)}
                  className={styles.searchRowLink}
                >
                  <Avatar
                    src={u.image}
                    alt={u.name ?? u.username}
                    size="sm"
                    className={styles.searchAvatar}
                  />
                  <span className={styles.searchName}>
                    {u.name || u.username}
                  </span>
                  <span className={styles.searchUsername}>@{u.username}</span>
                  <span className={styles.searchRecipes}>
                    {u.recipeCount} recept
                  </span>
                </Link>
                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={(e) => {
                    e.preventDefault();
                    sendRequest(u.id);
                  }}
                  disabled={sendingId === u.id}
                >
                  {sendingId === u.id ? "Skickar…" : "Lägg till vän"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.tabs}>
        <button
          type="button"
          className={tab === "friends" ? styles.tabActive : styles.tab}
          onClick={() => setTab("friends")}
        >
          Mina vänner
        </button>
        <button
          type="button"
          className={tab === "requests" ? styles.tabActive : styles.tab}
          onClick={() => setTab("requests")}
        >
          Förfrågningar
          {requests.length > 0 && (
            <span className={styles.badge}>{requests.length}</span>
          )}
        </button>
      </div>

      {tab === "friends" && (
        <section className={styles.section}>
          {friends.length === 0 ? (
            <p className={styles.empty}>
              Du har inga vänner än, sök efter folk att lägga till
            </p>
          ) : (
            <ul className={styles.list}>
              {friends.map((f) => (
                <li key={f.id}>
                  <Link
                    href={"/profile/" + encodeURIComponent(f.username)}
                    className={styles.friendRow}
                  >
                    <Avatar
                      src={f.image}
                      alt={f.name ?? f.username}
                      size="md"
                      className={styles.avatar}
                      isOnline={f.isOnline}
                    />
                    <div className={styles.friendInfo}>
                      <span className={styles.friendName}>
                        {f.name || f.username}
                      </span>
                      <span className={styles.friendUsername}>
                        @{f.username}
                      </span>
                    </div>
                    <span className={styles.recipeCount}>
                      {f.recipeCount} recept
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === "requests" && (
        <section className={styles.section}>
          {requests.length === 0 ? (
            <p className={styles.empty}>Inga väntande förfrågningar.</p>
          ) : (
            <ul className={styles.list}>
              {requests.map((r) => (
                <li key={r.id} className={styles.requestRow}>
                  <Link
                    href={"/profile/" + encodeURIComponent(r.sender.username)}
                    className={styles.requestLink}
                  >
                    <Avatar
                      src={r.sender.image}
                      alt={r.sender.name ?? r.sender.username}
                      size="md"
                      className={styles.avatar}
                      isOnline={r.sender.isOnline}
                    />
                    <div className={styles.friendInfo}>
                      <span className={styles.friendName}>
                        {r.sender.name || r.sender.username}
                      </span>
                      <span className={styles.friendUsername}>
                        @{r.sender.username}
                      </span>
                      <span className={styles.recipeCount}>
                        {r.sender.recipeCount} recept
                      </span>
                    </div>
                  </Link>
                  <div className={styles.requestActions}>
                    <button
                      type="button"
                      className={styles.acceptBtn}
                      onClick={() => handleAccept(r.id)}
                    >
                      Acceptera
                    </button>
                    <button
                      type="button"
                      className={styles.rejectBtn}
                      onClick={() => handleReject(r.id)}
                    >
                      Avvisa
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
