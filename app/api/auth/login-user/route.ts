import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { signToken, getTokenCookieOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password required" },
      { status: 400 }
    );
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  // Password match check
  let passwordMatch = false;
  if (user.password.startsWith("$2")) {
    passwordMatch = await bcrypt.compare(password, user.password);
  } else {
    // Plaintext — compare aur auto migrate to bcrypt
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
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
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
  };

  const response = NextResponse.json({ success: true, user: userForClient });
  const opts = getTokenCookieOptions();
  response.cookies.set(opts.name, token, opts);

  return response;
}

// ❌ GET route hata diya — password-less token generation security hole tha