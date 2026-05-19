import { Resend } from "resend";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires_at = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Store OTP in Supabase (upsert = update if exists)
  const { error: dbError } = await supabase
    .from("otp_store")
    .upsert({ email, otp, expires_at }, { onConflict: "email" });

  if (dbError) {
    console.error("Supabase OTP store error:", dbError);
    return NextResponse.json({ error: "Failed to store OTP" }, { status: 500 });
  }

  try {
    await resend.emails.send({
      from: "MASTER360 <onboarding@resend.dev>",
      to: email,
      subject: "Your OTP for MASTER360",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #166534; font-size: 24px; margin: 0;">MASTER360</h1>
            <p style="color: #6b7280; margin-top: 8px;">Dr. Amankumar Srivastav Pvt Tutorials</p>
          </div>
          <div style="background: white; border-radius: 8px; padding: 24px; text-align: center;">
            <p style="color: #374151; margin-bottom: 16px;">Your OTP for login is:</p>
            <div style="font-size: 40px; font-weight: bold; color: #166534; letter-spacing: 8px; padding: 16px; background: #f0fdf4; border-radius: 8px;">
              ${otp}
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 16px;">
              This OTP is valid for <strong>10 minutes</strong>.
            </p>
            <p style="color: #ef4444; font-size: 13px;">
              Do not share this OTP with anyone.
            </p>
          </div>
          <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px;">
            If you did not request this OTP, please ignore this email.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email send error:", error);
    // OTP store ho gayi thi, email fail hui — cleanup karo
    await supabase.from("otp_store").delete().eq("email", email);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const otp = searchParams.get("otp");

  if (!email || !otp) {
    return NextResponse.json({ valid: false });
  }

  // Supabase se OTP fetch karo
  const { data, error } = await supabase
    .from("otp_store")
    .select("otp, expires_at")
    .eq("email", email)
    .single();

  if (error || !data) {
    return NextResponse.json({ valid: false, error: "OTP not found" });
  }

  if (Date.now() > data.expires_at) {
    await supabase.from("otp_store").delete().eq("email", email);
    return NextResponse.json({ valid: false, error: "OTP expired" });
  }

  if (data.otp !== otp) {
    return NextResponse.json({ valid: false, error: "Invalid OTP" });
  }

  // OTP sahi hai — delete karo (one-time use)
  await supabase.from("otp_store").delete().eq("email", email);
  return NextResponse.json({ valid: true });
}