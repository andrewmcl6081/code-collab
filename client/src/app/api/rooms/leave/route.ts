import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import prisma from "@/lib/prisma";

export async function POST() {
  // Check if the user is authenticated
  const session = await auth0.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Set the user's currentRoomId to null (user leaves room)
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { currentRoomId: null }
    });

    return NextResponse.json({ message: "Left room successfully", user: updatedUser });
  } catch (error) {
    console.error("Error leaving room:", error);

    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: "Failed to leave room", details: errorMessage },
      { status: 500 }
    );
  }
}