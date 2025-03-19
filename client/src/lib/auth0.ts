import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";

export const auth0 = new Auth0Client({
  signInReturnToPath: "/",
  authorizationParameters: {
    scope: "openid profile email",
    audience: "https://my-nextjs-api", 
  },
  async onCallback(error, context, session) {
    if (error) {
      return NextResponse.redirect(new URL(`/error?error=${error.message}`, process.env.APP_BASE_URL));
    }

    try {
      // Send session data to api to process user creation
      const res = await fetch(`${process.env.APP_BASE_URL}/api/auth/callback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(session),
      });

      if (!res.ok) {
        console.error("Error calling /api/auth/callback");
      }
    } catch (error) {
      console.error("Error calling /api/auth/callback:", error);
    }

    return NextResponse.redirect(new URL(context.returnTo || "/", process.env.APP_BASE_URL));
  }
});