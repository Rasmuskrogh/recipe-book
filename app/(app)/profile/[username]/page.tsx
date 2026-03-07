import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { getFriendshipStatus } from "@/lib/friends";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileRecipeGrid } from "@/components/profile/ProfileRecipeGrid";
import { FriendButton } from "@/components/social/FriendButton";
import type { UserProfile } from "@/types/user";
import Link from "next/link";
import styles from "./page.module.css";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, name: true, username: true, image: true, bio: true },
  });

  if (!user) notFound();

  const recipeCount = await prisma.recipe.count({
    where: { authorId: user.id, isPublic: true },
  });
  const friendCount = await prisma.friendship.count({
    where: { OR: [{ userAId: user.id }, { userBId: user.id }] },
  });
  const recipes = await prisma.recipe.findMany({
    where: { authorId: user.id, isPublic: true },
    select: { id: true, title: true, imageUrl: true },
    orderBy: { createdAt: "desc" },
  });

  const profile: UserProfile = {
    id: user.id,
    name: user.name,
    username: user.username,
    image: user.image,
    bio: user.bio,
    recipeCount,
    friendCount,
  };

  const isOwnProfile = !!session?.user?.id && session.user.id === user.id;
  const friendship =
    session?.user?.id && !isOwnProfile
      ? await getFriendshipStatus(session.user.id, user.id)
      : null;

  return (
    <div className={styles.page}>
      <ProfileHeader user={profile} isOwnProfile={isOwnProfile} />
      <div className={styles.actions}>
        {isOwnProfile ? (
          <Link href="/profile/edit" className={styles.editButton}>
            Redigera profil
          </Link>
        ) : friendship ? (
          <FriendButton
            userId={user.id}
            status={friendship.status}
            requestId={friendship.requestId}
          />
        ) : null}
      </div>
      <section className={styles.recipesSection}>
        <h2 className={styles.sectionTitle}>Recept</h2>
        <ProfileRecipeGrid recipes={recipes} username={user.username} />
      </section>
    </div>
  );
}
