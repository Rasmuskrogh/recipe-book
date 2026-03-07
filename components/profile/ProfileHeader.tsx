import styles from "./ProfileHeader.module.css";
import type { UserProfile } from "@/types/user";
import { Avatar } from "@/components/ui/Avatar";

export interface ProfileHeaderProps {
  user: UserProfile;
  isOwnProfile?: boolean;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <header className={styles.profileHeader}>
      <Avatar
        src={user.image}
        alt={user.name || user.username}
        size="lg"
        className={styles.avatar}
      />
      <div className={styles.info}>
        <h1 className={styles.name}>{user.name || user.username}</h1>
        <p className={styles.username}>@{user.username}</p>
        {user.bio && <p className={styles.bio}>{user.bio}</p>}
        <div className={styles.stats}>
          <span className={styles.stat}>
            <strong>{user.recipeCount}</strong> recept
          </span>
          <span className={styles.stat}>
            <strong>{user.friendCount}</strong> vänner
          </span>
        </div>
      </div>
    </header>
  );
}
