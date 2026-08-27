// Creates a Razorpay order for an existing pending store order.

import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required." },
        { status: 400 }
      );
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, order_number, total_amount, payment_status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    if (order.payment_status === "paid") {
      return NextResponse.json(
        { error: "Order is already paid." },
        { status: 400 }
      );
    }

    const amountInPaise = Math.round(Number(order.total_amount) * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: order.order_number,
      notes: {
        order_id: order.id,
        order_number: order.order_number,
      },
    });

    const { error: paymentError } = await supabase
      .from("payments")
      .upsert(
        {
          order_id: order.id,
          provider: "razorpay",
          provider_order_id: razorpayOrder.id,
          amount: Number(order.total_amount),
          currency: "INR",
          status: "created",
        },
        {
          onConflict: "order_id",
        }
      );

    if (paymentError) {
      console.error(paymentError);
      return NextResponse.json(
        { error: "Unable to save payment record." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to create Razorpay order." },
      { status: 500 }
    );
  }
}