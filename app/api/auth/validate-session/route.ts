import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

function rateLimit(ip: string, maxRequests = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.lastReset > windowMs) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true; // allowed
  }

  if (record.count >= maxRequests) {
    return false; // blocked
  }

  record.count++;
  return true; // allowed
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting — max 5 requests per minute per IP
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { valid: false, message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { userId, deviceId } = await req.json();

    if (!userId || !deviceId) {
      return NextResponse.json(
        { valid: false, message: "Missing userId or deviceId" },
        { status: 400 }
      );
    }

    // Basic validation — userId and deviceId must be non-empty strings
    if (typeof userId !== "string" || typeof deviceId !== "string") {
      return NextResponse.json(
        { valid: false, message: "Invalid request format" },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (err: any) {
    console.error("validate-session error", err);
    return NextResponse.json(
      { valid: false, message: "Server error" },
      { status: 500 }
    );
  }
}