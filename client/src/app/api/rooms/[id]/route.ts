import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import prisma from "@/lib/prisma";

// GET: a single room by ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const room = await prisma.room.findUnique({
    where: { id: params.id },
    include: { members: { include: { user: true } } },
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: room.id,
    name: room.name,
    createdBy: room.createdBy,
    members: room.members.map((member) => member.user),
  });
}

// PATCH: Rename the room (can only be done by creator)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth0.getSession();
  const auth0User = session!.user;

  const { name } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Room name is required" }, { status: 400 });
  }

  const room = await prisma.room.findUnique({
    where: { id: params.id },
  });

  if (!room || room.createdBy !== auth0User.sub) {
    return NextResponse.json({ error: "Not authorized to rename this room" }, { status: 403 });
  }

  const updatedRoom = await prisma.room.update({
    where: { id: params.id },
    data: { name },
  });

  return NextResponse.json({ message: "Room renamed successfully", updatedRoom });
}

// DELETE: Remove a room (can only be done by creator)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await auth0.getSession();
  const auth0User = session!.user;

  const room = await prisma.room.findUnique({
    where: { id: params.id },
  });

  if (!room || room.createdBy !== auth0User.sub) {
    return NextResponse.json({ error: "Not authorized to delete this room" }, { status: 403 });
  }

  // First delete RoomUser associatations
  await prisma.roomUser.deleteMany({
    where: { roomId: params.id }
  });

  await prisma.room.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ message: "Room deleted successfully" });
}