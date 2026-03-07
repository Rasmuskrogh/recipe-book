"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./MobileNav.module.css";

export interface MobileNavProps {
  user?: {
    name?: string | null;
    image?: string | null;
    username?: string;
  } | null;
}

const NAV_ITEMS = [
  { href: "/feed", label: "Flöde", icon: "🏠" },
  { href: "/recipes", label: "Recept", icon: "📖" },
  { href: "/friends", label: "Vänner", icon: "👥" },
  { href: "/messages", label: "Meddelanden", icon: "💬" },
  { href: "/groups", label: "Grupper", icon: "👨‍👩‍👧‍👦" },
] as const;

export function MobileNav({ user }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav className={styles.mobileNav} aria-label="Mobilnavigering">
      {NAV_ITEMS.map(({ href, label, icon }) => {
        const isActive =
          href === "/feed"
            ? pathname === "/feed"
            : pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={isActive ? styles.linkActive : styles.link}
            aria-current={isActive ? "page" : undefined}
          >
            <span className={styles.icon}>{icon}</span>
            <span className={styles.label}>{label}</span>
          </Link>
        );
      })}
      <Link
        href={user?.username ? `/profile/${user.username}` : "/profile"}
        className={
          pathname.startsWith("/profile") ? styles.linkActive : styles.link
        }
        aria-current={pathname.startsWith("/profile") ? "page" : undefined}
      >
        <span className={styles.icon}>👤</span>
        <span className={styles.label}>Profil</span>
      </Link>
    </nav>
  );
}
