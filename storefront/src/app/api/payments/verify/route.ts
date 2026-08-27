// Verifies Razorpay payment and safely completes the paid order.
// Inventory is reduced exactly once on successful payment.

import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = await request.json();

    if (
      !orderId ||
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return NextResponse.json(
        {
          error:
            "Missing payment verification data.",
        },
        { status: 400 }
      );
    }

    // Find the payment record.
    const {
      data: payment,
      error: paymentError,
    } = await supabase
      .from("payments")
      .select(
        "id, provider_order_id, amount, order_id, status"
      )
      .eq("order_id", orderId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        {
          error:
            "Payment record not found.",
        },
        { status: 404 }
      );
    }

    // Make sure this Razorpay order belongs to our payment record.
    if (
      payment.provider_order_id !==
      razorpayOrderId
    ) {
      return NextResponse.json(
        {
          error:
            "Razorpay order mismatch.",
        },
        { status: 400 }
      );
    }

    // Verify Razorpay signature.
    const body =
      `${razorpayOrderId}|${razorpayPaymentId}`;

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET!
        )
        .update(body)
        .digest("hex");

    if (
      expectedSignature.length !==
      razorpaySignature.length
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid payment signature.",
        },
        { status: 400 }
      );
    }

    const valid =
      crypto.timingSafeEqual(
        Buffer.from(
          expectedSignature
        ),
        Buffer.from(
          razorpaySignature
        )
      );

    if (!valid) {
      return NextResponse.json(
        {
          error:
            "Invalid payment signature.",
        },
        { status: 400 }
      );
    }

    // Get the order first.
    const {
      data: order,
      error: orderError,
    } = await supabase
      .from("orders")
      .select(
        "id, payment_status"
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          error:
            "Order not found.",
        },
        { status: 404 }
      );
    }

    // Idempotency:
    // If payment was already completed, do not reduce stock again.
    if (
      order.payment_status ===
      "paid"
    ) {
      return NextResponse.json({
        success: true,
        verified: true,
        alreadyProcessed: true,
      });
    }

    // Complete payment + order + inventory
    // through one database transaction.
    const {
      data: result,
      error: completionError,
    } = await supabase.rpc(
      "complete_paid_order",
      {
        p_order_id: orderId,
        p_payment_id: payment.id,
        p_provider_payment_id:
          razorpayPaymentId,
      }
    );

    if (completionError) {
      console.error(
        completionError
      );

      return NextResponse.json(
        {
          error:
            completionError.message ||
            "Unable to complete paid order.",
        },
        { status: 500 }
      );
    }

    if (!result?.success) {
      return NextResponse.json(
        {
          error:
            result?.error ||
            "Unable to complete paid order.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      inventoryUpdated: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Unable to verify payment.",
      },
      { status: 500 }
    );
  }
}