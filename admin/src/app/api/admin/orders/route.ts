// Updates an order status for an authenticated admin.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const allowedStatuses = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export async function PATCH(request: Request) {
  try {
    const supabaseServer =
      await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { data: profile } =
      await supabaseServer
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const { orderId, status } =
      await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status are required." },
        { status: 400 }
      );
    }

    if (
      !allowedStatuses.includes(status)
    ) {
      return NextResponse.json(
        { error: "Invalid order status." },
        { status: 400 }
      );
    }

    const { data: order, error } =
      await supabaseAdmin
        .from("orders")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select(
          "id, order_number, status"
        )
        .single();

    if (error || !order) {
      console.error(error);

      return NextResponse.json(
        { error: "Unable to update order status." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to update order status." },
      { status: 500 }
    );
  }
}