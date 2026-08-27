// Admin coupon API using the server-side Supabase service-role key.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("coupons")
      .select(
        "id, code, discount_type, discount_value, usage_limit, used_count, expires_at, is_active"
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: "Unable to load coupons." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      coupons: data ?? [],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to load coupons." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      code,
      discount_type = "percentage",
      discount_value,
      expires_at = null,
      usage_limit = null,
    } = body;

    const normalizedCode = String(
      code || ""
    )
      .trim()
      .toUpperCase();

    const discountValue =
      Number(discount_value);

    const usageLimit =
      usage_limit === null ||
      usage_limit === "" ||
      usage_limit === undefined
        ? null
        : Number(usage_limit);

    if (!normalizedCode) {
      return NextResponse.json(
        { error: "Coupon code is required." },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(discountValue) ||
      discountValue <= 0
    ) {
      return NextResponse.json(
        { error: "Enter a valid discount." },
        { status: 400 }
      );
    }

    if (
      discount_type === "percentage" &&
      discountValue > 100
    ) {
      return NextResponse.json(
        {
          error:
            "Percentage discount cannot exceed 100%.",
        },
        { status: 400 }
      );
    }

    if (
      usageLimit !== null &&
      (!Number.isInteger(usageLimit) ||
        usageLimit <= 0)
    ) {
      return NextResponse.json(
        {
          error:
            "Usage limit must be a positive whole number.",
        },
        { status: 400 }
      );
    }

    const { data: existingCoupon } =
      await supabase
        .from("coupons")
        .select("id")
        .eq("code", normalizedCode)
        .maybeSingle();

    if (existingCoupon) {
      return NextResponse.json(
        {
          error:
            "A coupon with this code already exists.",
        },
        { status: 409 }
      );
    }

    const { data, error } =
      await supabase
        .from("coupons")
        .insert({
          code: normalizedCode,
          description: null,
          discount_type,
          discount_value: discountValue,
          minimum_order_amount: null,
          usage_limit: usageLimit,
          used_count: 0,
          expires_at: expires_at || null,
          is_active: true,
        })
        .select(
          "id, code, discount_type, discount_value, usage_limit, used_count, expires_at, is_active"
        )
        .single();

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: "Unable to create coupon." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      coupon: data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to create coupon." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const {
      id,
      is_active,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Coupon ID is required." },
        { status: 400 }
      );
    }

    const { data, error } =
      await supabase
        .from("coupons")
        .update({
          is_active: Boolean(
            is_active
          ),
        })
        .eq("id", id)
        .select(
          "id, code, discount_type, discount_value, usage_limit, used_count, expires_at, is_active"
        )
        .single();

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: "Unable to update coupon." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      coupon: data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to update coupon." },
      { status: 500 }
    );
  }
}