import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  if (!email || !password || !name) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  // Check if user exists
  const { data: existing } = await supabase
    .from("users")
    .select("email")
    .eq("email", email)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  // Password hash karo
  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = {
    id: Date.now().toString(),
    email,
    name,
    password: hashedPassword, // hashed!
    is_admin: false,
    is_paid: false,
    subscription_plan: "free",
  };

  const { error } = await supabase.from("users").insert(newUser);

  if (error) {
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true, user: { id: newUser.id, email, name } });
}