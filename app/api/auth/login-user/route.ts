import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  // Password match check
  let passwordMatch = false;
  if (user.password.startsWith("$2")) {
    passwordMatch = await bcrypt.compare(password, user.password);
  } else {
    // Plaintext — compare aur auto migrate
    passwordMatch = user.password === password;
    if (passwordMatch) {
      const hashed = await bcrypt.hash(password, 12);
      await supabase
        .from("users")
        .update({ password: hashed })
        .eq("email", email);
    }
  }

  if (!passwordMatch) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  // Admin check — DB ka is_admin + env variable se double check
  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin =
    user.is_admin === true ||
    (adminEmail ? user.email === adminEmail : false);

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    isAdmin: isAdmin,
    isPaid: user.is_paid,
    isPremium: user.is_paid,
    subscriptionPlan: user.subscription_plan,
    subscriptionEnd: user.subscription_end,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("365d")
    .sign(secret);

  const userForClient = {
    id: user.id,
    email: user.email,
    name: user.name,
    isAdmin: isAdmin,
    isPaid: user.is_paid,
    subscriptionPlan: user.subscription_plan,
    subscriptionStart: user.subscription_start,
    subscriptionEnd: user.subscription_end,
    subscription: user.is_paid ? "active" : "free",
  };

  const response = NextResponse.json({ success: true, user: userForClient });
  response.cookies.set("neet_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  return response;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin =
    user.is_admin === true ||
    (adminEmail ? user.email === adminEmail : false);

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    isAdmin: isAdmin,
    isPaid: user.is_paid,
    isPremium: user.is_paid,
    subscriptionPlan: user.subscription_plan,
    subscriptionEnd: user.subscription_end,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("365d")
    .sign(secret);

  const userForClient = {
    id: user.id,
    email: user.email,
    name: user.name,
    isAdmin: isAdmin,
    isPaid: user.is_paid,
    subscriptionPlan: user.subscription_plan,
    subscriptionStart: user.subscription_start,
    subscriptionEnd: user.subscription_end,
    subscription: user.is_paid ? "active" : "free",
  };

  const response = NextResponse.json({ success: true, user: userForClient });
  response.cookies.set("neet_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  return response;
}