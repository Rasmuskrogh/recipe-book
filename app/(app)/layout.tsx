import { auth } from "@/lib/auth/auth";
import { getPendingFriendRequestCount } from "@/lib/friends";
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
  const friendRequestCount =
    user?.id != null ? await getPendingFriendRequestCount(user.id) : 0;
  return (
    <div className={styles.layout}>
      <header className={styles.navbarWrap}>
        <Navbar user={user} friendRequestCount={friendRequestCount} />
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.mobileNavWrap}>
        <MobileNav user={user} friendRequestCount={friendRequestCount} />
      </footer>
    </div>
  );
}
