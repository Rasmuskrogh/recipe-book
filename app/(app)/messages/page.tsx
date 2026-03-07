import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { MessagesList } from "./MessagesList";

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return <MessagesList currentUserId={session.user.id} />;
}
