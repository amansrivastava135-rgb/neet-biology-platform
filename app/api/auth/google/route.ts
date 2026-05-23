import { NextRequest, NextResponse } from "next/server";

// GET /api/auth/google
// Redirects user to Google OAuth consent screen
export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Google auth not configured" }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  // Read redirect param — where to send user after login (default: /dashboard)
  const { searchParams } = new URL(req.url);
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    // Pass redirectTo via state param — survives the OAuth round trip
    state: Buffer.from(JSON.stringify({ redirectTo })).toString("base64"),
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}