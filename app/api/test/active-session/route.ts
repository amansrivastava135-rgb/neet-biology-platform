import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { deviceId, testType } = await req.json();

    if (!deviceId || !testType) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Purani session delete karo
    await supabaseAdmin
      .from("active_sessions")
      .delete()
      .eq("user_id", user.id);

    const sessionId = `session_${user.id}_${Date.now()}`;

    const { error } = await supabaseAdmin.from("active_sessions").insert({
      session_id: sessionId,
      user_id: user.id,
      device_id: deviceId,
      test_type: testType,
      start_time: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Session create error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to start session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, sessionId });
  } catch (err) {
    console.error("start session error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Missing sessionId" },
        { status: 400 }
      );
    }

    // Sirf apni session delete kar sakta hai
    await supabaseAdmin
      .from("active_sessions")
      .delete()
      .eq("session_id", sessionId)
      .eq("user_id", user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("end session error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: session } = await supabaseAdmin
      .from("active_sessions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    return NextResponse.json({ success: true, session: session || null });
  } catch (err) {
    console.error("get session error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
