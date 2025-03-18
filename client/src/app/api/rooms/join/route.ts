// /api/rooms/join
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth0.getSession();
  const auth0User = session!.user
  const { inviteCode } = await req.json();

  if (!inviteCode) {
    return NextResponse.json({ error: "Invite code is required"}, { status: 400 });
  }

  // Find room by invite code
  const room = await prisma.room.findUnique({
    where: { inviteCode },
  });

  if (!room) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
  }

  // Find user in database
  const user = await prisma.user.findUnique({
    where: { auth0Id: auth0User.sub }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Ensure user is not in another room
  await prisma.user.update({
    where: { id: user.id },
    data: { currentRoomId: room.id },
  });

  return NextResponse.json({ message: "Joined room successfully", roomId: room.id });
}