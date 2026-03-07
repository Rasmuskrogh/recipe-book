import styles from "./MessageBubble.module.css";
import { Avatar } from "@/components/ui/Avatar";

export interface MessageBubbleProps {
  content: string;
  isOwn: boolean;
  senderName?: string | null;
  senderImage?: string | null;
  createdAt: string;
}

export function MessageBubble({
  content,
  isOwn,
  senderName,
  senderImage,
  createdAt,
}: MessageBubbleProps) {
  const time = new Date(createdAt).toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <div
      className={isOwn ? styles.wrapperOwn : styles.wrapperOther}
      data-own={isOwn}
    >
      {!isOwn && (
        <Avatar
          src={senderImage}
          alt={senderName ?? "Användare"}
          size="sm"
          className={styles.avatar}
        />
      )}
      <div className={styles.bubbleWrap}>
        {!isOwn && senderName && (
          <span className={styles.senderName}>{senderName}</span>
        )}
        <div className={isOwn ? styles.bubbleOwn : styles.bubbleOther}>
          <p className={styles.content}>{content}</p>
          <span className={styles.time}>{time}</span>
        </div>
      </div>
    </div>
  );
}
