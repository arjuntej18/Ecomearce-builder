// Verifies Razorpay payment and safely completes the paid order.
// Inventory is reduced exactly once on successful payment.

import { NextResponse } from "next/server";
import { Resend } from "resend";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const resend = new Resend(
  process.env.RESEND_API_KEY
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

// Fetch the completed order details.
const {
  data: completedOrder,
  error: completedOrderError,
} = await supabase
  .from("orders")
  .select(`
    id,
    order_number,
    customer_name,
    customer_email,
    customer_phone,
    address_line1,
    address_line2,
    city,
    state,
    postal_code,
    country,
    subtotal,
    discount,
    shipping_fee,
    total_amount,
    invoice_number,
    expected_delivery_date
  `)
  .eq("id", orderId)
  .single();

if (completedOrderError || !completedOrder) {
  console.error(completedOrderError);
} else {
  // Fetch order items for the emails.
  const {
    data: orderItems,
    error: orderItemsError,
  } = await supabase
    .from("order_items")
    .select(`
      product_name,
      variant_name,
      sku,
      quantity,
      unit_price,
      total_price
    `)
    .eq("order_id", orderId);

  if (orderItemsError) {
    console.error(orderItemsError);
  }

  const items = orderItems ?? [];

  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;">
            ${item.product_name}
            ${
              item.variant_name
                ? ` — ${item.variant_name}`
                : ""
            }
          </td>
          <td style="padding:8px 0;text-align:center;">
            ${item.quantity}
          </td>
          <td style="padding:8px 0;text-align:right;">
            ₹${Number(item.total_price).toFixed(2)}
          </td>
        </tr>
      `
    )
    .join("");

  const from =
    process.env.RESEND_FROM_EMAIL ||
    "onboarding@resend.dev";

  const emailResults =
    await Promise.allSettled([
      // Customer email
      resend.emails.send(
        {
          from: `Seetha Vastram <${from}>`,
          to: [completedOrder.customer_email],
          subject: `Your Order ${completedOrder.order_number} Confirmed`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#4a2925;">
              <h1 style="font-family:Georgia,serif;">
                Order Confirmed
              </h1>

              <p>
                Dear ${completedOrder.customer_name},
              </p>

              <p>
                Thank you for shopping with Seetha Vastram.
                Your order has been successfully confirmed.
              </p>

              <p>
                <strong>Order:</strong>
                ${completedOrder.order_number}
              </p>

              <table style="width:100%;border-collapse:collapse;margin-top:20px;">
                <thead>
                  <tr>
                    <th style="text-align:left;">Product</th>
                    <th>Qty</th>
                    <th style="text-align:right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <hr style="margin:24px 0;border:none;border-top:1px solid #e2d4c5;" />

              <p>
                <strong>Subtotal:</strong>
                ₹${Number(completedOrder.subtotal).toFixed(2)}
              </p>

              <p>
                <strong>Discount:</strong>
                ₹${Number(completedOrder.discount).toFixed(2)}
              </p>

              <p>
                <strong>Total:</strong>
                ₹${Number(completedOrder.total_amount).toFixed(2)}
              </p>

              <p>
                <strong>Expected delivery:</strong>
                ${completedOrder.expected_delivery_date}
              </p>

              <p style="margin-top:30px;">
                Thank you,<br />
                Seetha Vastram
              </p>
            </div>
          `,
        },
        {
          idempotencyKey:
            `order-customer-${orderId}`,
        }
      ),

      // Admin email
      resend.emails.send(
        {
          from: `Seetha Vastram <${from}>`,
          to: process.env.ADMIN_ORDER_EMAIL!,
          subject: `New Order — ${completedOrder.order_number}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;color:#222;">
              <h1>New Order Received</h1>

              <p>
                <strong>Order:</strong>
                ${completedOrder.order_number}
              </p>

              <h2>Customer</h2>

              <p>
                <strong>Name:</strong>
                ${completedOrder.customer_name}<br />
                <strong>Email:</strong>
                ${completedOrder.customer_email}<br />
                <strong>Phone:</strong>
                ${completedOrder.customer_phone}
              </p>

              <h2>Delivery Address</h2>

              <p>
                ${completedOrder.address_line1}<br />
                ${
                  completedOrder.address_line2
                    ? `${completedOrder.address_line2}<br />`
                    : ""
                }
                ${completedOrder.city},
                ${completedOrder.state}
                ${completedOrder.postal_code}<br />
                ${completedOrder.country}
              </p>

              <h2>Items</h2>

              <table style="width:100%;border-collapse:collapse;">
                <thead>
                  <tr>
                    <th style="text-align:left;">Product</th>
                    <th>Qty</th>
                    <th style="text-align:right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <hr style="margin:24px 0;" />

              <p>
                <strong>Subtotal:</strong>
                ₹${Number(completedOrder.subtotal).toFixed(2)}
              </p>

              <p>
                <strong>Discount:</strong>
                ₹${Number(completedOrder.discount).toFixed(2)}
              </p>

              <p>
                <strong>Total:</strong>
                ₹${Number(completedOrder.total_amount).toFixed(2)}
              </p>

              <p>
                <strong>Invoice:</strong>
                ${completedOrder.invoice_number}
              </p>
            </div>
          `,
        },
        {
          idempotencyKey:
            `order-admin-${orderId}`,
        }
      ),
    ]);

  for (const result of emailResults) {
    if (result.status === "rejected") {
      console.error(
        "Order email failed:",
        result.reason
      );
    } else if (result.value.error) {
      console.error(
        "Order email error:",
        result.value.error
      );
    }
  }
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