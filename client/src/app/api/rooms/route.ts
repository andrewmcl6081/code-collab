// /api/rooms
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  const session = await auth0.getSession();
  const auth0User = session!.user;

  // Check if request contains new room name
  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "Room name is required" }, { status: 400 });

  try {
    const inviteCode = crypto.randomBytes(6).toString("hex");

    // Create the room
    const room = await prisma.room.create({
      data: { 
        name,
        inviteCode,
        createdBy: session!.user.sub
      },
    });

    // Add the creator as a member in RoomUser
    await prisma.roomUser.create({
      data: {
        userId: auth0User.sub,
        roomId: room.id
      },
    });

    const inviteLink = `${process.env.APP_BASE_URL}/join?code=${inviteCode}`;

    return NextResponse.json({
      roomId: room.id,
      name: room.name, 
      inviteCode, 
      inviteLink,
    });
  } catch (error) {
    console.error("Error creating room:", error);

    // Type safety error handling
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: "Failed to create room", details: errorMessage },
      { status: 500 }
    );
  }
}