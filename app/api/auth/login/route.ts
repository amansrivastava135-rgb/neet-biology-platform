import { NextResponse } from "next/server";
import { signToken, getTokenCookieOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Hardcoded admin check — baad mein DB se replace karna
    const isAdmin =
      email === "admin@example.com" && password === "admin123";

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = await signToken({
      id: "admin-1",
      email: email,
      name: "Admin",
      isAdmin: true,
      isPremium: true,
    });

    const cookieOpts = getTokenCookieOptions();
    const res = NextResponse.json({ success: true });
    res.cookies.set(cookieOpts.name, token, cookieOpts);
    return res;

  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}