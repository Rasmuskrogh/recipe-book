import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { GroupsList } from "./GroupsList";

export default async function GroupsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return <GroupsList />;
}
