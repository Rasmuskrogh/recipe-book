import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getFriendsData } from "@/lib/friends";
import { FriendsContent } from "./FriendsContent";

export default async function FriendsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const data = await getFriendsData(session.user.id);
  return (
    <FriendsContent
      initialFriends={data.friends}
      initialRequests={data.incomingRequests}
    />
  );
}
