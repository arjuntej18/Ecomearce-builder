// Secure admin-only API for loading and updating a product and its variants.

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

type VariantUpdate = {
  id: string;
  price: number;
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

export async function GET(
  _request: Request,
  { params }: Params
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

    const { id } = await params;

    const {
      data: product,
      error: productError,
    } = await supabaseAdmin
      .from("products")
      .select(
        `
        id,
        category_id,
        name,
        slug,
        description,
        brand,
        base_price,
        sale_price,
        main_image_url,
        is_featured,
        is_active
        `
      )
      .eq("id", id)
      .single();

    if (
      productError ||
      !product
    ) {
      return NextResponse.json(
        {
          error:
            "Product not found.",
        },
        { status: 404 }
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
        product_id,
        sku,
        size,
        color,
        price,
        is_active
        `
      )
      .eq("product_id", id)
      .order("id");

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

    return NextResponse.json({
      product,
      variants:
        variants ?? [],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Unable to load product.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: Params
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

    const { id } = await params;

    const body = await request.json();

    const {
      name,
      slug,
      description,
      brand,
      base_price,
      sale_price,
      category_id,
      main_image_url,
      is_featured,
      is_active,
      variants,
    } = body;

    if (
      !name?.trim() ||
      !slug?.trim() ||
      base_price === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Name, slug and base price are required.",
        },
        { status: 400 }
      );
    }

    const numericBasePrice =
      Number(base_price);

    if (
      !Number.isFinite(
        numericBasePrice
      ) ||
      numericBasePrice <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Base price must be greater than zero.",
        },
        { status: 400 }
      );
    }

    let numericSalePrice:
      | number
      | null = null;

    if (
      sale_price !== "" &&
      sale_price != null
    ) {
      numericSalePrice =
        Number(sale_price);

      if (
        !Number.isFinite(
          numericSalePrice
        ) ||
        numericSalePrice < 0
      ) {
        return NextResponse.json(
          {
            error:
              "Sale price is invalid.",
          },
          { status: 400 }
        );
      }
    }

    // Validate category.
    if (category_id) {
      const {
        data: category,
        error: categoryError,
      } = await supabaseAdmin
        .from("categories")
        .select("id")
        .eq(
          "id",
          category_id
        )
        .maybeSingle();

      if (
        categoryError ||
        !category
      ) {
        return NextResponse.json(
          {
            error:
              "Selected category was not found.",
          },
          { status: 400 }
        );
      }
    }

    // Validate variant updates.
    let variantUpdates:
      VariantUpdate[] = [];

    if (
      Array.isArray(variants)
    ) {
      variantUpdates =
        variants.map(
          (variant) => ({
            id: String(
              variant.id
            ),
            price: Number(
              variant.price
            ),
          })
        );

      for (const variant of
        variantUpdates) {
        if (
          !variant.id ||
          !Number.isFinite(
            variant.price
          ) ||
          variant.price <= 0
        ) {
          return NextResponse.json(
            {
              error:
                "Every variant price must be greater than zero.",
            },
            { status: 400 }
          );
        }
      }
    }

    // Make sure the variants belong to this product.
    if (variantUpdates.length) {
      const {
        data: existingVariants,
        error: existingVariantsError,
      } = await supabaseAdmin
        .from("product_variants")
        .select("id")
        .eq(
          "product_id",
          id
        )
        .in(
          "id",
          variantUpdates.map(
            (variant) =>
              variant.id
          )
        );

      if (existingVariantsError) {
        console.error(
          existingVariantsError
        );

        return NextResponse.json(
          {
            error:
              "Unable to validate variants.",
          },
          { status: 500 }
        );
      }

      const validIds = new Set(
        (
          existingVariants ??
          []
        ).map(
          (variant) =>
            variant.id
        )
      );

      const invalidVariant =
        variantUpdates.find(
          (variant) =>
            !validIds.has(
              variant.id
            )
        );

      if (invalidVariant) {
        return NextResponse.json(
          {
            error:
              "One or more variants do not belong to this product.",
          },
          { status: 400 }
        );
      }
    }

    // Update product.
    const {
      data: product,
      error: productUpdateError,
    } = await supabaseAdmin
      .from("products")
      .update({
        category_id:
          category_id || null,

        name: String(
          name
        ).trim(),

        slug: String(
          slug
        ).trim(),

        description:
          String(
            description || ""
          ).trim() || null,

        brand:
          String(
            brand || ""
          ).trim() || null,

        base_price:
          numericBasePrice,

        sale_price:
          numericSalePrice,

        main_image_url:
          String(
            main_image_url || ""
          ).trim() || null,

        is_featured:
          Boolean(
            is_featured
          ),

        is_active:
          Boolean(
            is_active
          ),

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        `
        id,
        category_id,
        name,
        slug,
        description,
        brand,
        base_price,
        sale_price,
        main_image_url,
        is_featured,
        is_active,
        updated_at
        `
      )
      .single();

    if (
      productUpdateError ||
      !product
    ) {
      console.error(
        productUpdateError
      );

      return NextResponse.json(
        {
          error:
            productUpdateError?.message ||
            "Unable to update product.",
        },
        { status: 500 }
      );
    }

    // Update variant prices.
    for (const variant of
      variantUpdates) {
      const {
        error:
          variantUpdateError,
      } = await supabaseAdmin
        .from("product_variants")
        .update({
          price:
            variant.price,
        })
        .eq(
          "id",
          variant.id
        )
        .eq(
          "product_id",
          id
        );

      if (variantUpdateError) {
        console.error(
          variantUpdateError
        );

        return NextResponse.json(
          {
            error:
              "Product was updated, but a variant price could not be updated.",
          },
          { status: 500 }
        );
      }
    }

    const {
      data: updatedVariants,
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
        is_active
        `
      )
      .eq(
        "product_id",
        id
      )
      .order("id");

    return NextResponse.json({
      success: true,
      product,
      variants:
        updatedVariants ?? [],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Unable to update product.",
      },
      { status: 500 }
    );
  }
}