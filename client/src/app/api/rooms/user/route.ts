import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth0.getSession();
  const auth0User = session!.user;

  const user = await prisma.user.findUnique({
    where: { auth0Id: auth0User.sub },
    include: { rooms: { include: { room: true } } },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const rooms = user.rooms.map((roomEntry) => roomEntry.room)

  return NextResponse.json(rooms)
}