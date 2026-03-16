import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { pusherServer } from "@/lib/pusher/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const bodyText = await req.text();
  const params = new URLSearchParams(bodyText);
  const socketId = params.get("socket_id");
  const channelName = params.get("channel_name");

  if (!socketId || !channelName) {
    return new NextResponse("Missing socket_id or channel_name", { status: 400 });
  }

  const presenceData = {
    user_id: user.id,
    user_info: {
      name: user.name ?? user.email ?? user.id,
      image: (user as any).image ?? null,
    },
  };

  const authResponse = pusherServer.authorizeChannel(socketId, channelName, presenceData);

  return NextResponse.json(authResponse);
}

