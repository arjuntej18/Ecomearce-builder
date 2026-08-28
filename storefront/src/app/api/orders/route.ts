// Creates an order from the normal cart or Buy Now.
// Coupon discounts are validated server-side.
// Expected delivery date is calculated from store settings.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      sessionId,
      variantId,
      quantity = 1,

      couponCode,

      customerName,
      customerEmail,
      customerPhone,

      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country = "India",
    } = body;

    const isDirectBuy = Boolean(variantId);

    if (
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !addressLine1 ||
      !city ||
      !state ||
      !postalCode
    ) {
      return NextResponse.json(
        {
          error:
            "Missing checkout details.",
        },
        { status: 400 }
      );
    }

    if (!isDirectBuy && !sessionId) {
      return NextResponse.json(
        {
          error:
            "Cart session is required.",
        },
        { status: 400 }
      );
    }

    let items: Array<{
      variant_id: string;
      product_name: string;
      variant_name: string;
      sku: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }> = [];

    // -------------------------
    // BUY NOW
    // -------------------------
    if (isDirectBuy) {
      const requestedQuantity =
        Math.max(
          1,
          Number(quantity)
        );

      const {
        data: variant,
        error: variantError,
      } = await supabase
        .from("product_variants")
        .select(`
          id,
          sku,
          size,
          color,
          price,
          products (
            id,
            name
          )
        `)
        .eq("id", variantId)
        .eq("is_active", true)
        .single();

      if (variantError || !variant) {
        return NextResponse.json(
          {
            error:
              "Selected product variant not found.",
          },
          { status: 404 }
        );
      }

      const unitPrice = Number(
        variant.price
      );

      if (
        !Number.isFinite(unitPrice) ||
        unitPrice <= 0
      ) {
        return NextResponse.json(
          {
            error:
              "Selected product has an invalid price.",
          },
          { status: 400 }
        );
      }

      const product = Array.isArray(
        variant.products
      )
        ? variant.products[0]
        : variant.products;

      if (!product) {
        return NextResponse.json(
          {
            error:
              "Product information not found.",
          },
          { status: 404 }
        );
      }

      const totalPrice =
        unitPrice *
        requestedQuantity;

      items = [
        {
          variant_id: variant.id,
          product_name: product.name,
          variant_name: [
            variant.size,
            variant.color,
          ]
            .filter(Boolean)
            .join(" / "),
          sku: variant.sku,
          quantity: requestedQuantity,
          unit_price: unitPrice,
          total_price: totalPrice,
        },
      ];
    }

    // -------------------------
    // NORMAL CART
    // -------------------------
    else {
      const {
        data: cart,
        error: cartError,
      } = await supabase
        .from("carts")
        .select(`
          id,
          cart_items (
            id,
            quantity,
            variant_id,
            product_variants (
              id,
              sku,
              size,
              color,
              price,
              product_id,
              products (
                id,
                name
              )
            )
          )
        `)
        .eq("session_id", sessionId)
        .maybeSingle();

      if (cartError || !cart) {
        return NextResponse.json(
          {
            error: "Cart not found.",
          },
          { status: 404 }
        );
      }

      if (!cart.cart_items?.length) {
        return NextResponse.json(
          {
            error: "Cart is empty.",
          },
          { status: 400 }
        );
      }

      items = cart.cart_items.map(
        (item: any) => {
          const variant =
            item.product_variants;

          const product =
            variant?.products;

          if (!variant || !product) {
            throw new Error(
              "Invalid cart product."
            );
          }

          const unitPrice =
            Number(variant.price);

          if (
            !Number.isFinite(
              unitPrice
            ) ||
            unitPrice <= 0
          ) {
            throw new Error(
              `Invalid variant price for SKU ${variant.sku}`
            );
          }

          const itemQuantity =
            Number(item.quantity);

          if (
            !Number.isFinite(
              itemQuantity
            ) ||
            itemQuantity <= 0
          ) {
            throw new Error(
              `Invalid quantity for SKU ${variant.sku}`
            );
          }

          const totalPrice =
            unitPrice *
            itemQuantity;

          return {
            variant_id: variant.id,
            product_name:
              product.name,
            variant_name: [
              variant.size,
              variant.color,
            ]
              .filter(Boolean)
              .join(" / "),
            sku: variant.sku,
            quantity: itemQuantity,
            unit_price: unitPrice,
            total_price: totalPrice,
          };
        }
      );
    }

    // -------------------------
    // TOTALS
    // -------------------------
    const subtotal =
      items.reduce(
        (sum, item) =>
          sum + item.total_price,
        0
      );

    const shippingFee = 0;

    // -------------------------
    // COUPON
    // -------------------------
    let discount = 0;
    let couponId: string | null =
      null;
    let couponUsedCount:
      | number
      | null = null;

    if (
      couponCode &&
      typeof couponCode ===
        "string"
    ) {
      const normalizedCode =
        couponCode
          .trim()
          .toUpperCase();

      const {
        data: coupon,
        error: couponError,
      } = await supabase
        .from("coupons")
        .select(`
          id,
          code,
          discount_type,
          discount_value,
          minimum_order_amount,
          usage_limit,
          used_count,
          expires_at,
          is_active
        `)
        .eq(
          "code",
          normalizedCode
        )
        .maybeSingle();

      if (
        couponError ||
        !coupon
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid coupon code.",
          },
          { status: 400 }
        );
      }

      if (!coupon.is_active) {
        return NextResponse.json(
          {
            error:
              "This coupon is inactive.",
          },
          { status: 400 }
        );
      }

      if (
        coupon.expires_at &&
        new Date(
          coupon.expires_at
        ).getTime() <=
          Date.now()
      ) {
        return NextResponse.json(
          {
            error:
              "This coupon has expired.",
          },
          { status: 400 }
        );
      }

      if (
        coupon.usage_limit != null &&
        Number(
          coupon.used_count
        ) >=
          Number(
            coupon.usage_limit
          )
      ) {
        return NextResponse.json(
          {
            error:
              "This coupon has reached its usage limit.",
          },
          { status: 400 }
        );
      }

      if (
        coupon.minimum_order_amount !=
          null &&
        subtotal <
          Number(
            coupon.minimum_order_amount
          )
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

      if (
        coupon.discount_type ===
        "percentage"
      ) {
        discount =
          subtotal *
          (Number(
            coupon.discount_value
          ) /
            100);
      } else if (
        coupon.discount_type ===
        "fixed"
      ) {
        discount = Number(
          coupon.discount_value
        );
      } else {
        return NextResponse.json(
          {
            error:
              "Invalid coupon type.",
          },
          { status: 400 }
        );
      }

      discount = Math.min(
        Math.max(0, discount),
        subtotal
      );

      couponId = coupon.id;

      couponUsedCount = Number(
        coupon.used_count
      );
    }

    const totalAmount =
      subtotal +
      shippingFee -
      discount;

    if (totalAmount <= 0) {
      return NextResponse.json(
        {
          error:
            "Order total must be greater than zero.",
        },
        { status: 400 }
      );
    }

    // -------------------------
    // DELIVERY DATE
    // -------------------------
    const {
      data: settings,
      error: settingsError,
    } = await supabase
      .from("store_settings")
      .select("delivery_days")
      .limit(1)
      .maybeSingle();

    if (settingsError) {
      console.error(
        settingsError
      );

      return NextResponse.json(
        {
          error:
            "Unable to load delivery settings.",
        },
        { status: 500 }
      );
    }

    const deliveryDays = Math.max(
      1,
      Number(
        settings?.delivery_days ?? 7
      )
    );

    const expectedDeliveryDate =
      new Date();

    expectedDeliveryDate.setDate(
      expectedDeliveryDate.getDate() +
        deliveryDays
    );

    const expectedDeliveryDateString =
      expectedDeliveryDate
        .toISOString()
        .split("T")[0];

    // -------------------------
    // ORDER NUMBERS
    // -------------------------
    const orderNumber =
      `ORD-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)
        .toUpperCase()}`;

    const invoiceNumber =
      `INV-${Date.now()}`;

    // -------------------------
    // CREATE ORDER
    // -------------------------
    const {
      data: order,
      error: orderError,
    } = await supabase
      .from("orders")
      .insert({
        order_number:
          orderNumber,

        customer_name:
          customerName,

        customer_email:
          customerEmail.toLowerCase(),

        customer_phone:
          customerPhone,

        address_line1:
          addressLine1,

        address_line2:
          addressLine2 || null,

        city,
        state,

        postal_code:
          postalCode,

        country,

        subtotal,
        discount,
        shipping_fee:
          shippingFee,

        total_amount:
          totalAmount,

        status: "pending",

        payment_status:
          "pending",

        invoice_number:
          invoiceNumber,

        expected_delivery_date:
          expectedDeliveryDateString,
      })
      .select()
      .single();

    if (
      orderError ||
      !order
    ) {
      console.error(
        orderError
      );

      return NextResponse.json(
        {
          error:
            "Unable to create order.",
        },
        { status: 500 }
      );
    }

    // -------------------------
    // CREATE ORDER ITEMS
    // -------------------------
    const {
      error: itemsError,
    } = await supabase
      .from("order_items")
      .insert(
        items.map((item) => ({
          order_id:
            order.id,
          ...item,
        }))
      );

    if (itemsError) {
      console.error(
        itemsError
      );

      await supabase
        .from("orders")
        .delete()
        .eq(
          "id",
          order.id
        );

      return NextResponse.json(
        {
          error:
            "Unable to create order items.",
        },
        { status: 500 }
      );
    }

    // -------------------------
    // CONSUME COUPON
    // -------------------------
    if (
      couponId &&
      couponUsedCount !== null
    ) {
      const {
        data: updatedCoupon,
        error:
          updateCouponError,
      } = await supabase
        .from("coupons")
        .update({
          used_count:
            couponUsedCount + 1,
        })
        .eq(
          "id",
          couponId
        )
        .eq(
          "used_count",
          couponUsedCount
        )
        .select("id")
        .maybeSingle();

      if (
        updateCouponError ||
        !updatedCoupon
      ) {
        await supabase
          .from("order_items")
          .delete()
          .eq(
            "order_id",
            order.id
          );

        await supabase
          .from("orders")
          .delete()
          .eq(
            "id",
            order.id
          );

        return NextResponse.json(
          {
            error:
              "Coupon could not be applied. Please try again.",
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json({
      success: true,

      orderId:
        order.id,

      orderNumber,

      amount:
        totalAmount,

      subtotal,

      discount,

      invoiceNumber,

      expectedDeliveryDate:
        expectedDeliveryDateString,

      deliveryDays,

      directBuy:
        isDirectBuy,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create order.",
      },
      { status: 500 }
    );
  }
}