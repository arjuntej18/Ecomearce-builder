// Returns orders belonging to the authenticated customer.

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase =
      await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const {
      data: profile,
    } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (
      profile?.role !== "customer"
    ) {
      return NextResponse.json(
        {
          error:
            "Customer access required.",
        },
        { status: 403 }
      );
    }

    const {
      data: orders,
      error,
    } = await supabase
      .from("orders")
      .select(
        `
        id,
        order_number,
        total_amount,
        status,
        payment_status,
        created_at
        `
      )
      .eq(
        "user_id",
        user.id
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

    if (error) {
      console.error(error);

      return NextResponse.json(
        {
          error:
            "Unable to load orders.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orders: orders ?? [],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Unable to load orders.",
      },
      { status: 500 }
    );
  }
}