import { NextRequest, NextResponse } from "next/server";

interface TestSessionType {
  sessionId: string;
  userId: string;
  deviceId: string;
  startTime: string; // ISO string
  testType: string; // "full" | "preview" | "chapter" | "practice"
}

// in-memory store for active sessions (use Redis in production)
const activeSessions = new Map<string, TestSessionType>();

/**
 * Start a new test session
 * POST /api/test/active-session
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, deviceId, testType } = await req.json();

    if (!userId || !deviceId || !testType) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // check for existing session from this user
    const existingSession = Array.from(activeSessions.values()).find(
      (s) => s.userId === userId
    );

    if (existingSession) {
      // terminate the previous session
      activeSessions.delete(existingSession.sessionId);
    }

    // create new session
    const sessionId = `session_${userId}_${Date.now()}`;
    const session: TestSessionType = {
      sessionId,
      userId,
      deviceId,
      startTime: new Date().toISOString(),
      testType,
    };

    activeSessions.set(sessionId, session);

    return NextResponse.json({
      success: true,
      sessionId,
      message: "Test session started",
    });
  } catch (err: any) {
    console.error("start test session error", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

/**
 * End a test session
 * PUT /api/test/active-session
 */
export async function PUT(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Missing sessionId" },
        { status: 400 }
      );
    }

    activeSessions.delete(sessionId);

    return NextResponse.json({
      success: true,
      message: "Test session ended",
    });
  } catch (err: any) {
    console.error("end test session error", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

/**
 * Get active session for user
 * GET /api/test/active-session?userId=xxx
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Missing userId" },
        { status: 400 }
      );
    }

    const session = Array.from(activeSessions.values()).find(
      (s) => s.userId === userId
    );

    return NextResponse.json({
      success: true,
      session: session || null,
    });
  } catch (err: any) {
    console.error("get active session error", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
