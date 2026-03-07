import { auth } from "@/lib/auth/auth";
import { getPendingFriendRequestCount } from "@/lib/friends";
import {
  getUnreadMessageCount,
  getUnreadGroupMessageCount,
} from "@/lib/messages";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import styles from "./layout.module.css";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user ?? null;
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
      <header className={styles.navbarWrap}>
        <Navbar
          user={user}
          friendRequestCount={friendRequestCount}
          unreadMessageCount={unreadMessageCount}
          unreadGroupCount={unreadGroupCount}
        />
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.mobileNavWrap}>
        <MobileNav
          user={user}
          friendRequestCount={friendRequestCount}
          unreadMessageCount={unreadMessageCount}
          unreadGroupCount={unreadGroupCount}
        />
      </footer>
    </div>
  );
}
