// Generates a checkout OTP, stores its hash in Supabase, and sends it with Resend.

import { NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Valid email is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const otp = generateOtp();
    const otpHash = hashOtp(otp);

    // Remove older unverified checkout OTPs for this email.
    await supabase
      .from("email_otp_verifications")
      .delete()
      .eq("email", normalizedEmail)
      .eq("purpose", "checkout")
      .is("verified_at", null);

    const { error: insertError } = await supabase
      .from("email_otp_verifications")
      .insert({
        email: normalizedEmail,
        otp_hash: otpHash,
        purpose: "checkout",
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        attempts: 0,
      });

    if (insertError) {
      console.error(insertError);

      return NextResponse.json(
        { error: "Unable to create verification code." },
        { status: 500 }
      );
    }

    const fromEmail =
      process.env.OTP_FROM_EMAIL || "onboarding@resend.dev";

    const { error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: [normalizedEmail],
      subject: "Your checkout verification code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
          <h2>Email verification</h2>
          <p>Use this code to verify your email address:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 24px 0;">
            ${otp}
          </div>
          <p>This code expires in 10 minutes.</p>
          <p>If you did not request this code, you can ignore this email.</p>
        </div>
      `,
    });

    if (emailError) {
      console.error(emailError);

      return NextResponse.json(
        { error: "Unable to send verification email." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to send verification code." },
      { status: 500 }
    );
  }
}