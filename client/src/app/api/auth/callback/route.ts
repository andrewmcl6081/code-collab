// /api/auth/callback
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const session = await auth0.getSession();
    console.log("SESSION:", session);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const auth0User = session.user;

    // Check if the user exists in the database
    let dbUser = await prisma.user.findUnique({
      where: { auth0Id: auth0User.sub },
    });

    // If the user doesn't exist, create them in the database
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          auth0Id: auth0User.sub,
          email: auth0User.email ?? null,
          name: auth0User.name ?? "Anonymous",
        },
      });
    }

    return NextResponse.json({ message: "User processed successfully" });
  } catch (error) {
    console.error("Auth0 Callback Error:", error);
    return NextResponse.json({ error: "Authentication processing failed" }, { status: 500 });
  }
}