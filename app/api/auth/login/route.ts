import { NextResponse } from "next/server";
import { signToken, getTokenCookieOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = body.user;

    if (!user?.id || !user?.email || !user?.name) {
      return NextResponse.json({ error: "Invalid user payload" }, { status: 400 });
    }

    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin ?? false,
      isPaid: user.isPaid ?? false,
      subscriptionPlan: user.subscriptionPlan ?? "free",
      subscriptionEnd: user.subscriptionEnd ?? undefined,
    });

    const response = NextResponse.json({ success: true });
    const opts = getTokenCookieOptions();
    response.cookies.set(opts.name, token, opts);

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
