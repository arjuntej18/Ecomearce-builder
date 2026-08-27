// Creates an invoice record for a confirmed paid order.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
      .select(
        "id, order_number, invoice_number, payment_status"
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    if (order.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Order is not paid." },
        { status: 400 }
      );
    }

    const invoiceNumber =
      order.invoice_number ||
      `INV-${Date.now()}`;

    const { data: invoice, error: invoiceError } =
      await supabase
        .from("invoices")
        .upsert(
          {
            order_id: order.id,
            invoice_number: invoiceNumber,
          },
          {
            onConflict: "order_id",
          }
        )
        .select()
        .single();

    if (invoiceError || !invoice) {
      console.error(invoiceError);

      return NextResponse.json(
        { error: "Unable to create invoice." },
        { status: 500 }
      );
    }

    if (!order.invoice_number) {
      await supabase
        .from("orders")
        .update({
          invoice_number: invoiceNumber,
        })
        .eq("id", order.id);
    }

    return NextResponse.json({
      success: true,
      invoiceNumber,
      invoiceId: invoice.id,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to create invoice." },
      { status: 500 }
    );
  }
}