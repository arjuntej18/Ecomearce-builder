// Verifies the custom checkout OTP stored in Supabase.

import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function POST(request: Request) {
  try {
    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email and OTP are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const otp = String(token).trim();

    const { data: verification, error: fetchError } = await supabase
      .from("email_otp_verifications")
      .select("id, otp_hash, expires_at, attempts, verified_at")
      .eq("email", normalizedEmail)
      .eq("purpose", "checkout")
      .is("verified_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError || !verification) {
      return NextResponse.json(
        { error: "OTP not found or already used." },
        { status: 400 }
      );
    }

    if (new Date(verification.expires_at).getTime() < Date.now()) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    if ((verification.attempts ?? 0) >= 5) {
      return NextResponse.json(
        { error: "Too many attempts. Please request a new OTP." },
        { status: 429 }
      );
    }

    const incomingHash = hashOtp(otp);

    if (incomingHash !== verification.otp_hash) {
      await supabase
        .from("email_otp_verifications")
        .update({
          attempts: (verification.attempts ?? 0) + 1,
        })
        .eq("id", verification.id);

      return NextResponse.json(
        { error: "Invalid OTP." },
        { status: 400 }
      );
    }

    await supabase
      .from("email_otp_verifications")
      .update({
        verified_at: new Date().toISOString(),
      })
      .eq("id", verification.id);

    return NextResponse.json({
      success: true,
      verified: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to verify OTP." },
      { status: 500 }
    );
  }
}