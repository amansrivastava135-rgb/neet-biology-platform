import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

// In-memory rate limiter Vercel pe useless tha — JWT verify hi kaafi hai

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ valid: false, message: "Unauthorized" }, { status: 401 });
    }

    const { deviceId } = await req.json();

    if (!deviceId || typeof deviceId !== "string") {
      return NextResponse.json(
        { valid: false, message: "Missing deviceId" },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true, userId: user.id });
  } catch (err) {
    console.error("validate-session error:", err);
    return NextResponse.json(
      { valid: false, message: "Server error" },
      { status: 500 }
    );
  }
}
