// Loads one complete order securely for an authenticated admin.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyAdmin() {
  const supabase =
    await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data: profile } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  return profile?.role === "admin";
}

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json(
        {
          error:
            "Admin access required.",
        },
        { status: 403 }
      );
    }

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
      error: orderError,
    } = await supabaseAdmin
      .from("orders")
      .select(
        `
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
        status,
        payment_status,
        tracking_number,
        invoice_number,
        created_at,
        updated_at
        `
      )
      .eq("id", id)
      .single();

    if (orderError || !order) {
      console.error(orderError);

      return NextResponse.json(
        {
          error:
            "Order not found.",
        },
        { status: 404 }
      );
    }

    const {
      data: items,
      error: itemsError,
    } = await supabaseAdmin
      .from("order_items")
      .select(
        `
        id,
        order_id,
        variant_id,
        product_name,
        variant_name,
        sku,
        quantity,
        unit_price,
        total_price,
        created_at
        `
      )
      .eq("order_id", id)
      .order("created_at", {
        ascending: true,
      });

    if (itemsError) {
      console.error(itemsError);

      return NextResponse.json(
        {
          error:
            "Unable to load order items.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      order,
      items: items ?? [],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Unable to load order details.",
      },
      { status: 500 }
    );
  }
}