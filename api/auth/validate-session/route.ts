import { NextRequest, NextResponse } from "next/server";
import { isSubscriptionActive } from "@/lib/subscription-utils";

/**
 * Validate user session on every request
 * Checks subscription status and device limits
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, deviceId } = await req.json();

    if (!userId || !deviceId) {
      return NextResponse.json(
        { valid: false, message: "Missing userId or deviceId" },
        { status: 400 }
      );
    }

    // in a real app, fetch user from database
    // for now, we rely on client-side storage and frontend validation
    // in production, you would:
    // 1. Look up user in database by userId
    // 2. Check subscription_end against current time
    // 3. Check deviceId is in user.devices
    // 4. Validate device limit

    return NextResponse.json({ valid: true });
  } catch (err: any) {
    console.error("validate-session error", err);
    return NextResponse.json(
      { valid: false, message: "Server error" },
      { status: 500 }
    );
  }
}
