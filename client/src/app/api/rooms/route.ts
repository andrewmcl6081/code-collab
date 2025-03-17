import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  // Check if the user is authenticated
  const session = await auth0.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check if request contains new room name
  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "Room name is required" }, { status: 400 });

  try {
    // Create a room and return roomId and name
    const room = await prisma.room.create({
      data: { name },
    });

    return NextResponse.json({ roomId: room.id, name: room.name });
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