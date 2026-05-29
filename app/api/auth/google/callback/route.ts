import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { signToken, getTokenCookieOptions } from "@/lib/auth";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  error?: string;
}

interface GoogleUserInfo {
  sub: string;       // Google user ID
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}

// GET /api/auth/google/callback
export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { searchParams } = new URL(req.url);

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  // User denied access
  if (errorParam) {
    return NextResponse.redirect(`${appUrl}/login?error=google_denied`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/login?error=google_failed`);
  }

  // Parse state to get redirectTo
  let redirectTo = "/dashboard";
  if (state) {
    try {
      const parsed = JSON.parse(Buffer.from(state, "base64").toString());
      if (parsed.redirectTo) redirectTo = parsed.redirectTo;
    } catch {}
  }

  try {
    // ── Step 1: Exchange code for tokens ──────────────────────────────
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = `${appUrl}/api/auth/google/callback`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData: GoogleTokenResponse = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      console.error("Google token exchange error:", tokenData.error);
      return NextResponse.redirect(`${appUrl}/login?error=google_failed`);
    }

    // ── Step 2: Get user info from Google ─────────────────────────────
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser: GoogleUserInfo = await userInfoRes.json();

    if (!googleUser.email || !googleUser.email_verified) {
      return NextResponse.redirect(`${appUrl}/login?error=google_unverified`);
    }

    const googleId = googleUser.sub;
    const email = googleUser.email.toLowerCase().trim();
    const name = googleUser.name?.trim() || email.split("@")[0];

    // ── Step 3: Upsert user — 3 cases ────────────────────────────────

    // Case A: Existing user with this google_id — returning Google user
    const { data: byGoogleId } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("google_id", googleId)
      .single();

    if (byGoogleId) {
      // Returning Google user — just sign in
      return await buildLoginResponse(byGoogleId, appUrl, redirectTo);
    }

    // Case B: Existing user with same email (email/password or OTP account)
    const { data: byEmail } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (byEmail) {
      // Link google_id to existing account — preserve all subscription data
      await supabaseAdmin
        .from("users")
        .update({ google_id: googleId })
        .eq("id", byEmail.id);

      const updatedUser = { ...byEmail, google_id: googleId };
      return await buildLoginResponse(updatedUser, appUrl, redirectTo);
    }

    // Case C: Brand new user — create account
    const newUser = {
      id: crypto.randomUUID(),
      email,
      name,
      password: null,           // Google users have no password
      google_id: googleId,
      is_admin: false,
      is_paid: false,
      subscription_plan: "free",
    };

    const { error: insertError } = await supabaseAdmin
      .from("users")
      .insert(newUser);

    if (insertError) {
      console.error("Google signup insert error:", insertError);
      return NextResponse.redirect(`${appUrl}/login?error=google_failed`);
    }

    return await buildLoginResponse(newUser, appUrl, redirectTo);

  } catch (err) {
    console.error("Google callback error:", err);
    return NextResponse.redirect(`${appUrl}/login?error=google_failed`);
  }
}

// ── Helper: build JWT response and set cookie ─────────────────────────────
async function buildLoginResponse(
  user: any,
  appUrl: string,
  redirectTo: string
): Promise<NextResponse> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin =
    user.is_admin === true ||
    (adminEmail ? user.email === adminEmail : false);

  const token = await signToken({
    id: user.id,
    email: user.email,
    name: user.name,
    isAdmin,
    isPaid: user.is_paid ?? false,
    subscriptionPlan: user.subscription_plan ?? "free",
    subscriptionEnd: user.subscription_end ?? undefined,
  });

  const userForClient = {
    id: user.id,
    email: user.email,
    name: user.name,
    isAdmin,
    isPaid: user.is_paid ?? false,
    subscriptionPlan: user.subscription_plan ?? "free",
    subscriptionStart: user.subscription_start ?? null,
    subscriptionEnd: user.subscription_end ?? null,
    subscription: user.is_paid ? "active" : "free",
    track: user.track ?? null,
  };

  // Redirect to a handoff page that sets localStorage then redirects
  const finalRedirect = isAdmin ? "/admin" : redirectTo;
  const handoffUrl = `${appUrl}/api/auth/google/handoff?user=${encodeURIComponent(
    JSON.stringify(userForClient)
  )}&redirect=${encodeURIComponent(finalRedirect)}`;

  const response = NextResponse.redirect(handoffUrl);
  const opts = getTokenCookieOptions();
  response.cookies.set(opts.name, token, opts);

  return response;
}
