import { NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = body.user;

    if (!user) {
      return NextResponse.json({ error: "No user provided" }, { status: 400 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin ?? false,
      isPaid: user.isPaid ?? false,
      isPremium: user.isPaid ?? false,
      subscriptionEnd: user.subscriptionEnd ?? null,
      subscriptionPlan: user.subscriptionPlan ?? "free",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("365d")
      .sign(secret);

    const response = NextResponse.json({ success: true });
    response.cookies.set("neet_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}