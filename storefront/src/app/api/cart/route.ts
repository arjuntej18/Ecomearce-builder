// Guest cart API using the server-side Supabase secret.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json(
      { error: "sessionId is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("carts")
    .select(`
      id,
      session_id,
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
          image_url,
          products (
            id,
            name,
            slug,
            main_image_url
          )
        )
      )
    `)
    .eq("session_id", sessionId)
    .maybeSingle();

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load cart" },
      { status: 500 }
    );
  }

  return NextResponse.json(data ?? null);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { sessionId, variantId, quantity = 1 } = body;

    if (!sessionId || !variantId) {
      return NextResponse.json(
        { error: "sessionId and variantId are required" },
        { status: 400 }
      );
    }

    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .upsert(
        { session_id: sessionId },
        { onConflict: "session_id" }
      )
      .select("id")
      .single();

    if (cartError || !cart) {
      console.error(cartError);
      return NextResponse.json(
        { error: "Failed to create cart" },
        { status: 500 }
      );
    }

    const { error: itemError } = await supabase
      .from("cart_items")
      .upsert(
        {
          cart_id: cart.id,
          variant_id: variantId,
          quantity,
        },
        { onConflict: "cart_id,variant_id" }
      );

    if (itemError) {
      console.error(itemError);
      return NextResponse.json(
        { error: "Failed to add item" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required." },
        { status: 400 }
      );
    }

    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("id")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (cartError) {
      console.error(cartError);
      return NextResponse.json(
        { error: "Unable to find cart." },
        { status: 500 }
      );
    }

    if (!cart) {
      return NextResponse.json({ success: true });
    }

    const { error: deleteError } = await supabase
      .from("carts")
      .delete()
      .eq("id", cart.id);

    if (deleteError) {
      console.error(deleteError);
      return NextResponse.json(
        { error: "Unable to clear cart." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to clear cart." },
      { status: 500 }
    );
  }
}