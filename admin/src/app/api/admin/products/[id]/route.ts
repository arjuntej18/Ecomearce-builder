// Admin-only product update API.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const { data: product, error } = await supabaseAdmin
      .from("products")
      .select(
        "id, name, slug, description, brand, base_price, sale_price, main_image_url, is_featured, is_active"
      )
      .eq("id", id)
      .single();

    if (error || !product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to load product." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      name,
      slug,
      description,
      brand,
      base_price,
      sale_price,
      main_image_url,
      is_featured,
      is_active,
    } = body;

    if (!name?.trim() || !slug?.trim() || base_price === undefined) {
      return NextResponse.json(
        {
          error:
            "Name, slug and base price are required.",
        },
        { status: 400 }
      );
    }

    const { data: product, error } = await supabaseAdmin
      .from("products")
      .update({
        name: String(name).trim(),
        slug: String(slug).trim(),
        description: String(description || "").trim(),
        brand: String(brand || "").trim(),
        base_price: Number(base_price),
        sale_price:
          sale_price === "" || sale_price == null
            ? null
            : Number(sale_price),
        main_image_url:
          String(main_image_url || "").trim() || null,
        is_featured: Boolean(is_featured),
        is_active: Boolean(is_active),
      })
      .eq("id", id)
      .select("id")
      .single();

    if (error || !product) {
      console.error(error);

      return NextResponse.json(
        {
          error:
            error?.message ||
            "Unable to update product.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      productId: product.id,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to update product." },
      { status: 500 }
    );
  }
}