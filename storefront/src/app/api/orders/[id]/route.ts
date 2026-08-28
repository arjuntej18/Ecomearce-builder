// Returns one order for the order-confirmation page.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Order ID is required.",
        },
        { status: 400 }
      );
    }

    const {
      data: order,
      error,
    } = await supabase
      .from("orders")
      .select(
        `
        order_number,
        invoice_number,
        expected_delivery_date,
        payment_status,
        total_amount
        `
      )
      .eq("id", id)
      .single();

    if (error || !order) {
      console.error(error);

      return NextResponse.json(
        {
          error:
            "Order not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      order: {
        order_number:
          order.order_number,

        invoice_number:
          order.invoice_number,

        expected_delivery_date:
          order.expected_delivery_date,

        payment_status:
          order.payment_status,

        total_amount:
          Number(
            order.total_amount
          ),
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Unable to load order.",
      },
      { status: 500 }
    );
  }
}