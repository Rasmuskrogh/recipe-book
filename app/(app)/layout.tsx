import { auth } from "@/lib/auth/auth";
import { getPendingFriendRequestCount } from "@/lib/friends";
import {
  getUnreadMessageCount,
  getUnreadGroupMessageCount,
} from "@/lib/messages";
import { prisma } from "@/lib/db/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { OnlineStatusProvider } from "@/components/OnlineStatusProvider";
import styles from "./layout.module.css";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userFromSession = session?.user ?? null;
  const user =
    userFromSession?.id != null
      ? await prisma.user
        .findUnique({
          where: { id: userFromSession.id },
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            isOnline: true,
          },
        })
        .then((u) => (u ? { ...u, id: u.id } : null))
      : null;
  const displayUser = user
    ? {
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
      isOnline: user.isOnline,
    }
    : null;
  const [friendRequestCount, unreadMessageCount, unreadGroupCount] =
    user?.id != null
      ? await Promise.all([
        getPendingFriendRequestCount(user.id),
        getUnreadMessageCount(user.id),
        getUnreadGroupMessageCount(user.id),
      ])
      : [0, 0, 0];
  return (
    <div className={styles.layout}>
      <OnlineStatusProvider />
      <header className={styles.navbarWrap}>
        <Navbar
          user={displayUser}
          friendRequestCount={friendRequestCount}
          unreadMessageCount={unreadMessageCount}
          unreadGroupCount={unreadGroupCount}
        />
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.mobileNavWrap}>
        <MobileNav
          user={displayUser}
          friendRequestCount={friendRequestCount}
          unreadMessageCount={unreadMessageCount}
          unreadGroupCount={unreadGroupCount}
        />
      </footer>
    </div>
  );
}
