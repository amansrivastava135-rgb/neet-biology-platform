import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const resetTokenStore = new Map<string, { token: string; expires: number }>();

function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const token = generateToken();
  const expires = Date.now() + 30 * 60 * 1000; // 30 minutes
  resetTokenStore.set(email, { token, expires });

  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://neet-biology-platform.vercel.app"}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  try {
    await resend.emails.send({
      from: "NEET Biology Platform <onboarding@resend.dev>",
      to: email,
      subject: "Reset Your Password — NEET Biology Platform",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #166534; font-size: 24px; margin: 0;">NEET Biology Platform</h1>
            <p style="color: #6b7280; margin-top: 8px;">Dr. Amankumar Srivastav Pvt Tutorials</p>
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
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}

// Verify token
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  if (!email || !token) {
    return NextResponse.json({ valid: false });
  }

  const stored = resetTokenStore.get(email);
  if (!stored) return NextResponse.json({ valid: false, error: "Token not found" });
  if (Date.now() > stored.expires) {
    resetTokenStore.delete(email);
    return NextResponse.json({ valid: false, error: "Token expired" });
  }
  if (stored.token !== token) return NextResponse.json({ valid: false, error: "Invalid token" });

  return NextResponse.json({ valid: true });
}

// Reset password
export async function PATCH(req: Request) {
  const { email, token, newPassword } = await req.json();

  const stored = resetTokenStore.get(email);
  if (!stored || stored.token !== token || Date.now() > stored.expires) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  resetTokenStore.delete(email);
  return NextResponse.json({ success: true });
}