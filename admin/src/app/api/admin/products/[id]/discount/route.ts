// Secure admin API for applying a percentage discount to all active variants of a product.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Params = {
  params: Promise<{
    id: string;
  }>;
};

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

export async function POST(
  request: Request,
  { params }: Params
) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json(
        {
          error: "Admin access required.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const discountPercent = Number(
      body.discount_percent
    );

    if (
      !Number.isFinite(discountPercent) ||
      discountPercent <= 0 ||
      discountPercent >= 100
    ) {
      return NextResponse.json(
        {
          error:
            "Discount must be between 1% and 99%.",
        },
        { status: 400 }
      );
    }

    const {
      data: variants,
      error: variantsError,
    } = await supabaseAdmin
      .from("product_variants")
      .select(
        `
        id,
        price,
        original_price,
        discount_percent,
        is_active
        `
      )
      .eq("product_id", id)
      .eq("is_active", true);

    if (variantsError) {
      console.error(
        variantsError
      );

      return NextResponse.json(
        {
          error:
            "Unable to load product variants.",
        },
        { status: 500 }
      );
    }

    if (!variants?.length) {
      return NextResponse.json(
        {
          error:
            "This product has no active variants.",
        },
        { status: 400 }
      );
    }

    const updates = variants.map(
      (variant) => {
        const originalPrice =
          Number(
            variant.original_price ??
              variant.price
          );

        if (
          !Number.isFinite(
            originalPrice
          ) ||
          originalPrice <= 0
        ) {
          throw new Error(
            "Invalid original price."
          );
        }

        const discountedPrice =
          Number(
            (
              originalPrice *
              (1 -
                discountPercent /
                  100)
            ).toFixed(2)
          );

        if (
          !Number.isFinite(
            discountedPrice
          ) ||
          discountedPrice <= 0
        ) {
          throw new Error(
            "Invalid discounted price."
          );
        }

        return {
          id: variant.id,
          original_price:
            originalPrice,
          price:
            discountedPrice,
          discount_percent:
            discountPercent,
        };
      }
    );

    for (const update of updates) {
      const {
        error: updateError,
      } = await supabaseAdmin
        .from("product_variants")
        .update({
          original_price:
            update.original_price,

          price:
            update.price,

          discount_percent:
            update.discount_percent,
        })
        .eq(
          "id",
          update.id
        )
        .eq(
          "product_id",
          id
        );

      if (updateError) {
        console.error(
          updateError
        );

        return NextResponse.json(
          {
            error:
              "Unable to apply discount.",
          },
          { status: 500 }
        );
      }
    }

    const {
      data: updatedVariants,
      error: reloadError,
    } = await supabaseAdmin
      .from("product_variants")
      .select(
        `
        id,
        product_id,
        sku,
        size,
        color,
        price,
        original_price,
        discount_percent,
        is_active
        `
      )
      .eq(
        "product_id",
        id
      )
      .order("id");

    if (reloadError) {
      console.error(
        reloadError
      );
    }

    return NextResponse.json({
      success: true,
      discount_percent:
        discountPercent,
      variants:
        updatedVariants ?? [],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to apply discount.",
      },
      { status: 500 }
    );
  }
}