"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Avatar } from "@/components/ui/Avatar";
import { getInitials } from "@/lib/utils/format";
import styles from "./Navbar.module.css";

export interface NavbarProps {
  user?: {
    name?: string | null;
    image?: string | null;
    username?: string;
    isOnline?: boolean;
  } | null;
  friendRequestCount?: number;
  unreadMessageCount?: number;
  unreadGroupCount?: number;
}

const NAV_LINKS = [
  { href: "/feed", label: "Flöde" },
  { href: "/recipes", label: "Recept" },
  { href: "/friends", label: "Vänner" },
  { href: "/messages", label: "Meddelanden" },
  { href: "/groups", label: "Grupper" },
] as const;

export function Navbar({
  user,
  friendRequestCount = 0,
  unreadMessageCount = 0,
  unreadGroupCount = 0,
}: NavbarProps) {
  const pathname = usePathname();

  return (
    <nav className={styles.navbar}>
      <Link href="/feed" className={styles.logo}>
        Recept & Nätverk
      </Link>
      <ul className={styles.navLinks}>
        {NAV_LINKS.map(({ href, label }) => {
          const isActive =
            href === "/feed"
              ? pathname === "/feed"
              : pathname === href || pathname.startsWith(href + "/");
          const showFriendBadge = href === "/friends" && friendRequestCount > 0;
          const showMessageBadge =
            href === "/messages" && unreadMessageCount > 0;
          const showGroupBadge = href === "/groups" && unreadGroupCount > 0;
          const badgeCount =
            href === "/friends"
              ? friendRequestCount
              : href === "/messages"
                ? unreadMessageCount
                : href === "/groups"
                  ? unreadGroupCount
                  : 0;
          const badgeLabel =
            href === "/friends"
              ? `${friendRequestCount} väntande vänförfrågningar`
              : href === "/messages"
                ? `${unreadMessageCount} olästa meddelanden`
                : `${unreadGroupCount} olästa meddelanden i grupper`;
          return (
            <li key={href}>
              <Link
                href={href}
                className={isActive ? styles.navLinkActive : styles.navLink}
              >
                <span className={styles.navLinkInner}>
                  {label}
                  {(showFriendBadge || showMessageBadge || showGroupBadge) && (
                    <span
                      className={styles.friendBadge}
                      aria-label={badgeLabel}
                    >
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className={styles.right}>
        {user ? (
          <>
            <Link
              href={user.username ? `/profile/${user.username}` : "/profile"}
              className={styles.profileLink}
            >
              <span className={styles.avatarWrap}>
                <Avatar
                  src={user.image}
                  alt={user.name || user.username || "Användare"}
                  initials={getInitials(user.name || user.username)}
                  size="sm"
                  isOnline={user.isOnline}
                />
              </span>
            </Link>
            <button
              type="button"
              className={styles.logoutBtn}
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Logga ut
            </button>
          </>
        ) : (
          <Link href="/login" className={styles.loginLink}>
            Logga in
          </Link>
        )}
      </div>
    </nav>
  );
}
