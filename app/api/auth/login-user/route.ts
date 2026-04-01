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

  // Bcrypt compare
  let passwordMatch = false;

  // Pehle check karo — hash hai ya plaintext
  if (user.password.startsWith("$2")) {
    // Bcrypt hash hai
    passwordMatch = await bcrypt.compare(password, user.password);
  } else {
    // Purana plaintext password — compare karo aur migrate karo
    passwordMatch = user.password === password;
    if (passwordMatch) {
      // Auto migrate to bcrypt
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

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    isAdmin: user.is_admin,
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
    isAdmin: user.is_admin,
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

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    isAdmin: user.is_admin,
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
    isAdmin: user.is_admin,
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