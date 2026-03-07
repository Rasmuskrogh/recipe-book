import { auth } from "@/lib/auth/auth";
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
  return (
    <div className={styles.layout}>
      <header className={styles.navbarWrap}>
        <Navbar user={user} />
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.mobileNavWrap}>
        <MobileNav user={user} />
      </footer>
    </div>
  );
}
