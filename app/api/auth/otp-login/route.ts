import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { signToken, getTokenCookieOptions } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Called only after OTP has been verified — no password needed
export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (error || !user) {
    return NextResponse.json(
      { error: "No account found with this email. Please sign up first." },
      { status: 404 }
    );
  }

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

  const response = NextResponse.json({ success: true, user: userForClient });
  const opts = getTokenCookieOptions();
  response.cookies.set(opts.name, token, opts);
  return response;
}