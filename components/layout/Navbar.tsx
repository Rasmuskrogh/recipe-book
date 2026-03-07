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
  } | null;
  friendRequestCount?: number;
}

const NAV_LINKS = [
  { href: "/feed", label: "Flöde" },
  { href: "/recipes", label: "Recept" },
  { href: "/friends", label: "Vänner" },
  { href: "/messages", label: "Meddelanden" },
  { href: "/groups", label: "Grupper" },
] as const;

export function Navbar({ user, friendRequestCount = 0 }: NavbarProps) {
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
          const showBadge = href === "/friends" && friendRequestCount > 0;
          return (
            <li key={href}>
              <Link
                href={href}
                className={isActive ? styles.navLinkActive : styles.navLink}
              >
                <span className={styles.navLinkInner}>
                  {label}
                  {showBadge && (
                    <span className={styles.friendBadge} aria-label={`${friendRequestCount} väntande vänförfrågningar`}>
                      {friendRequestCount > 99 ? "99+" : friendRequestCount}
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
