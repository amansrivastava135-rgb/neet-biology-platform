import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  if (!email || !password || !name) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  // Check if user already exists
  const { data: existing } = await supabase
    .from("users")
    .select("email")
    .eq("email", email)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const newUser = {
    id: Date.now().toString(),
    email,
    name,
    password, // plaintext abhi — baad mein bcrypt lagana
    is_admin: false,
    is_paid: false,
    subscription_plan: "free",
  };

  const { error } = await supabase.from("users").insert(newUser);

  if (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true, user: newUser });
}