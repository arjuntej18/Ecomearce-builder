// Validates a coupon and returns the discount calculation.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const {
      code,
      sessionId = null,
      variantId = null,
      quantity = 1,
    } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Coupon code is required." },
        { status: 400 }
      );
    }

    const normalizedCode = code.trim().toUpperCase();

    let subtotal = 0;

    // Buy Now
    if (variantId) {
      const { data: variant, error } = await supabase
        .from("product_variants")
        .select("id, price, is_active")
        .eq("id", variantId)
        .eq("is_active", true)
        .single();

      if (error || !variant) {
        return NextResponse.json(
          { error: "Selected product not found." },
          { status: 404 }
        );
      }

      const price = Number(variant.price);
      const qty = Math.max(1, Number(quantity));

      if (!Number.isFinite(price) || price <= 0) {
        return NextResponse.json(
          { error: "Invalid product price." },
          { status: 400 }
        );
      }

      subtotal = price * qty;
    }

    // Normal cart
    else {
      if (!sessionId) {
        return NextResponse.json(
          { error: "Cart session is required." },
          { status: 400 }
        );
      }

      const { data: cart, error: cartError } = await supabase
        .from("carts")
        .select(`
          id,
          cart_items (
            quantity,
            product_variants (
              price,
              is_active
            )
          )
        `)
        .eq("session_id", sessionId)
        .maybeSingle();

      if (cartError || !cart) {
        return NextResponse.json(
          { error: "Cart not found." },
          { status: 404 }
        );
      }

      if (!cart.cart_items?.length) {
        return NextResponse.json(
          { error: "Cart is empty." },
          { status: 400 }
        );
      }

      for (const item of cart.cart_items as any[]) {
        const variant = item.product_variants;

        if (!variant || !variant.is_active) {
          return NextResponse.json(
            { error: "Cart contains an invalid product." },
            { status: 400 }
          );
        }

        const price = Number(variant.price);
        const qty = Number(item.quantity);

        if (
          !Number.isFinite(price) ||
          price <= 0 ||
          !Number.isFinite(qty) ||
          qty <= 0
        ) {
          return NextResponse.json(
            { error: "Cart contains invalid pricing or quantity." },
            { status: 400 }
          );
        }

        subtotal += price * qty;
      }
    }

    const { data: coupon, error: couponError } = await supabase
      .from("coupons")
      .select(`
        id,
        code,
        description,
        discount_type,
        discount_value,
        minimum_order_amount,
        usage_limit,
        used_count,
        expires_at,
        is_active
      `)
      .eq("code", normalizedCode)
      .maybeSingle();

    if (couponError || !coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code." },
        { status: 400 }
      );
    }

    if (!coupon.is_active) {
      return NextResponse.json(
        { error: "This coupon is inactive." },
        { status: 400 }
      );
    }

    if (
      coupon.expires_at &&
      new Date(coupon.expires_at).getTime() <= Date.now()
    ) {
      return NextResponse.json(
        { error: "This coupon has expired." },
        { status: 400 }
      );
    }

    if (
      coupon.usage_limit !== null &&
      Number(coupon.used_count) >= Number(coupon.usage_limit)
    ) {
      return NextResponse.json(
        { error: "This coupon has reached its usage limit." },
        { status: 400 }
      );
    }

    if (
      coupon.minimum_order_amount !== null &&
      subtotal < Number(coupon.minimum_order_amount)
    ) {
      return NextResponse.json(
        {
          error: `Minimum order value is ₹${Number(
            coupon.minimum_order_amount
          ).toFixed(2)}.`,
        },
        { status: 400 }
      );
    }

    let discount = 0;

    if (coupon.discount_type === "percentage") {
      discount =
        subtotal *
        (Number(coupon.discount_value) / 100);
    } else if (coupon.discount_type === "fixed") {
      discount = Number(coupon.discount_value);
    } else {
      return NextResponse.json(
        { error: "Invalid coupon type." },
        { status: 400 }
      );
    }

    discount = Math.min(
      Math.max(0, discount),
      subtotal
    );

    const total = subtotal - discount;

    if (total <= 0) {
      return NextResponse.json(
        { error: "Coupon cannot make the order total zero." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      description: coupon.description,
      subtotal,
      discount,
      total,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to validate coupon." },
      { status: 500 }
    );
  }
}