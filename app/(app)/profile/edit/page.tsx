import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { EditProfileForm } from "./EditProfileForm";
import styles from "./page.module.css";

export default async function ProfileEditPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      bio: true,
      image: true,
      username: true,
    },
  });
  if (!user) redirect("/login");

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Redigera profil</h1>
      <EditProfileForm
        userId={user.id}
        username={user.username}
        defaultValues={{
          name: user.name ?? "",
          bio: user.bio ?? "",
          image: user.image ?? "",
        }}
      />
    </div>
  );
}
