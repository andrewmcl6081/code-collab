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
    where: { auth0Id: auth0User.sub },
    include: { rooms: true }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check if user is already a member, if not, add them
  const isMember = await prisma.roomUser.findUnique({
    where: { userId_roomId: { userId: user.id, roomId: room.id } },
  });

  if (!isMember) {
    await prisma.roomUser.create({
      data: { userId: user.id, roomId: room.id }
    });
  }

  return NextResponse.json({ message: "Joined room successfully", roomId: room.id });
}