// Verifies Razorpay webhook signatures and updates payment/order status.

import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    const signature = request.headers.get(
      "x-razorpay-signature"
    );

    if (!signature) {
      return NextResponse.json(
        { error: "Missing Razorpay signature." },
        { status: 400 }
      );
    }

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_WEBHOOK_SECRET!
      )
      .update(rawBody)
      .digest("hex");

    const valid =
      expectedSignature.length === signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature)
      );

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 400 }
      );
    }

    const payload = JSON.parse(rawBody);

    if (payload.event === "payment.captured") {
      const payment = payload.payload?.payment?.entity;

      if (!payment) {
        return NextResponse.json({ received: true });
      }

      const razorpayOrderId = payment.order_id;
      const razorpayPaymentId = payment.id;

      const { data: paymentRecord } = await supabase
        .from("payments")
        .select("id, order_id")
        .eq("provider_order_id", razorpayOrderId)
        .maybeSingle();

      if (paymentRecord) {
        await supabase
          .from("payments")
          .update({
            provider_payment_id: razorpayPaymentId,
            status: "paid",
          })
          .eq("id", paymentRecord.id);

        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            status: "confirmed",
          })
          .eq("id", paymentRecord.order_id);
      }
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    );
  }
}