// Admin inventory update API using the Supabase service-role key.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(request: Request) {
  try {
    // Verify logged-in admin.
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

    const { data: profile, error: profileError } =
      await supabaseServer
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (
      profileError ||
      profile?.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      variantId,
      quantity,
    } = body;

    if (!variantId) {
      return NextResponse.json(
        { error: "Variant ID is required." },
        { status: 400 }
      );
    }

    const newQuantity = Number(quantity);

    if (
      !Number.isInteger(newQuantity) ||
      newQuantity < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Stock quantity must be a whole number greater than or equal to zero.",
        },
        { status: 400 }
      );
    }

    // Make sure the variant exists.
    const {
      data: variant,
      error: variantError,
    } = await supabaseAdmin
      .from("product_variants")
      .select("id")
      .eq("id", variantId)
      .single();

    if (variantError || !variant) {
      return NextResponse.json(
        {
          error:
            "Product variant not found.",
        },
        { status: 404 }
      );
    }

    // Check whether inventory already exists.
    const {
      data: existingInventory,
      error: lookupError,
    } = await supabaseAdmin
      .from("inventory")
      .select("variant_id")
      .eq("variant_id", variantId)
      .maybeSingle();

    if (lookupError) {
      console.error(lookupError);

      return NextResponse.json(
        {
          error:
            "Unable to check inventory.",
        },
        { status: 500 }
      );
    }

    if (existingInventory) {
      const {
        error: updateError,
      } = await supabaseAdmin
        .from("inventory")
        .update({
          quantity: newQuantity,
        })
        .eq(
          "variant_id",
          variantId
        );

      if (updateError) {
        console.error(updateError);

        return NextResponse.json(
          {
            error:
              "Unable to update stock.",
          },
          { status: 500 }
        );
      }
    } else {
      const {
        error: insertError,
      } = await supabaseAdmin
        .from("inventory")
        .insert({
          variant_id: variantId,
          quantity: newQuantity,
          low_stock_threshold: 5,
        });

      if (insertError) {
        console.error(insertError);

        return NextResponse.json(
          {
            error:
              "Unable to create inventory record.",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      variantId,
      quantity: newQuantity,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Unable to update inventory.",
      },
      { status: 500 }
    );
  }
}