"use client";

import styles from "./FriendButton.module.css";
import type { FriendshipStatus } from "@/types/social";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface FriendButtonProps {
  userId: string
  status: FriendshipStatus
  requestId?: string
  onAdd?: () => void
  onAccept?: () => void
  onReject?: () => void
  onRemove?: () => void
  isLoading?: boolean
}

export function FriendButton(props: FriendButtonProps) {
  const {
    userId,
    status,
    requestId,
    onAdd,
    onAccept,
    onReject,
    onRemove,
    isLoading: controlledLoading,
  } = props;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const busy = controlledLoading ?? loading;

  async function handleAdd() {
    setLoading(true);
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: userId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Kunde inte skicka förfrågan");
        return;
      }
      onAdd?.();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept() {
    if (!requestId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/friends", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action: "accept" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Kunde inte acceptera");
        return;
      }
      onAccept?.();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    if (!requestId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/friends", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action: "reject" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Kunde inte avvisa");
        return;
      }
      onReject?.();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove() {
    setLoading(true);
    try {
      const res = await fetch("/api/friends?userId=" + encodeURIComponent(userId), {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Kunde inte ta bort vän");
        return;
      }
      onRemove?.();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (status === "none") {
    return (
      <button
        type="button"
        className={styles.button}
        onClick={handleAdd}
        disabled={busy}
      >
        {busy ? "Skickar…" : "Lägg till vän"}
      </button>
    );
  }

  if (status === "pending_sent") {
    return (
      <span className={styles.buttonDisabled} aria-disabled>
        Förfrågan skickad
      </span>
    );
  }

  if (status === "pending_received") {
    return (
      <div className={styles.receivedActions}>
        <button
          type="button"
          className={styles.buttonPrimary}
          onClick={handleAccept}
          disabled={busy}
        >
          {busy ? "…" : "Acceptera"}
        </button>
        <button
          type="button"
          className={styles.buttonSecondary}
          onClick={handleReject}
          disabled={busy}
        >
          Avvisa
        </button>
      </div>
    );
  }

  if (status === "friends") {
    return (
      <button
        type="button"
        className={styles.buttonDanger}
        onClick={handleRemove}
        disabled={busy}
      >
        {busy ? "…" : "Ta bort vän"}
      </button>
    );
  }

  return null;
}
