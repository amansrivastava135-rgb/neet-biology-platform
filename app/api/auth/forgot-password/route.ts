import { Resend } from "resend";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import bcrypt from "bcryptjs";

const resend = new Resend(process.env.RESEND_API_KEY);

// Token Supabase ke otp_store mein save hoga — Map nahi
export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  // User exists check
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .single();

  // Email exist kare ya na kare — same response do (enumeration prevent)
  if (!user) {
    return NextResponse.json({ success: true });
  }

  // Secure random token generate karo
  const tokenRaw = crypto.randomUUID() + crypto.randomUUID();
  const token = tokenRaw.replace(/-/g, "");
  const expires_at = Date.now() + 30 * 60 * 1000; // 30 min

  // otp_store mein save karo (same table reuse)
  const { error: dbError } = await supabaseAdmin
    .from("otp_store")
    .upsert(
      { email: email.trim().toLowerCase(), otp: token, expires_at },
      { onConflict: "email" }
    );

  if (dbError) {
    console.error("Token store error:", dbError);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  try {
    await resend.emails.send({
      from: "NEET Biology Platform <onboarding@resend.dev>",
      to: email,
      subject: "Reset Your Password — NEET Biology Platform",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #166534; font-size: 24px; margin: 0;">NEET Biology Platform</h1>
            <p style="color: #6b7280; margin-top: 8px;">Dr. Amankumar Srivastav</p>
          </div>
          <div style="background: white; border-radius: 8px; padding: 24px; text-align: center;">
            <h2 style="color: #374151; margin-bottom: 16px;">Reset Your Password</h2>
            <p style="color: #6b7280; margin-bottom: 24px;">
              Click the button below to reset your password. This link is valid for <strong>30 minutes</strong>.
            </p>
            <a href="${resetLink}" style="display: inline-block; background: #166534; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Reset Password
            </a>
            <p style="color: #ef4444; font-size: 13px; margin-top: 16px;">
              If you did not request this, please ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    await supabaseAdmin.from("otp_store").delete().eq("email", email);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}

// Token verify
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  if (!email || !token) {
    return NextResponse.json({ valid: false });
  }

  const { data, error } = await supabaseAdmin
    .from("otp_store")
    .select("otp, expires_at")
    .eq("email", email.trim().toLowerCase())
    .single();

  if (error || !data) {
    return NextResponse.json({ valid: false, error: "Token not found" });
  }

  if (Date.now() > data.expires_at) {
    await supabaseAdmin.from("otp_store").delete().eq("email", email);
    return NextResponse.json({ valid: false, error: "Token expired" });
  }

  if (data.otp !== token) {
    return NextResponse.json({ valid: false, error: "Invalid token" });
  }

  return NextResponse.json({ valid: true });
}

// Password reset
export async function PATCH(req: Request) {
  const { email, token, newPassword } = await req.json();

  if (!email || !token || !newPassword) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("otp_store")
    .select("otp, expires_at")
    .eq("email", email.trim().toLowerCase())
    .single();

  if (error || !data || data.otp !== token || Date.now() > data.expires_at) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 }
    );
  }

  // Token valid — password update karo
  const hashed = await bcrypt.hash(newPassword, 12);

  const { error: updateError } = await supabaseAdmin
    .from("users")
    .update({ password: hashed })
    .eq("email", email.trim().toLowerCase());

  if (updateError) {
    return NextResponse.json({ error: "Password update failed" }, { status: 500 });
  }

  // Token delete karo — one-time use
  await supabaseAdmin.from("otp_store").delete().eq("email", email);

  return NextResponse.json({ success: true });
}