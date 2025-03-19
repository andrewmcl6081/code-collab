import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth0.getSession();
  const auth0User = session!.user;

  const user = await prisma.user.findUnique({
    where: { auth0Id: auth0User.sub },
    include: { currentRoom: true },
  });

  return NextResponse.json(user?.currentRoom ? [user.currentRoom] : []);
}