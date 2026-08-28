// Secure admin category API with safe deletion checks.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

export async function GET() {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const { data, error } =
      await supabaseAdmin
        .from("categories")
        .select(
          "id, name, slug, description, created_at"
        )
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error(error);

      return NextResponse.json(
        {
          error:
            "Unable to load categories.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      categories: data ?? [],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Unable to load categories.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const name = String(
      body.name || ""
    ).trim();

    const slug = String(
      body.slug || ""
    )
      .trim()
      .toLowerCase();

    const description =
      body.description
        ? String(
            body.description
          ).trim()
        : null;

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Category name is required.",
        },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        {
          error:
            "Category slug is required.",
        },
        { status: 400 }
      );
    }

    const {
      data: existing,
      error: existingError,
    } = await supabaseAdmin
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingError) {
      console.error(existingError);

      return NextResponse.json(
        {
          error:
            "Unable to check category.",
        },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        {
          error:
            "A category with this slug already exists.",
        },
        { status: 409 }
      );
    }

    const { data, error } =
      await supabaseAdmin
        .from("categories")
        .insert({
          name,
          slug,
          description,
        })
        .select(
          "id, name, slug, description, created_at"
        )
        .single();

    if (error) {
      console.error(error);

      return NextResponse.json(
        {
          error:
            "Unable to create category.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      category: data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Unable to create category.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request
) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const id = String(
      body.id || ""
    ).trim();

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Category ID is required.",
        },
        { status: 400 }
      );
    }

    const {
      data: category,
      error: categoryError,
    } = await supabaseAdmin
      .from("categories")
      .select("id, name")
      .eq("id", id)
      .maybeSingle();

    if (
      categoryError ||
      !category
    ) {
      return NextResponse.json(
        {
          error:
            "Category not found.",
        },
        { status: 404 }
      );
    }

    // Do not allow deletion while products use this category.
    const {
      count: productCount,
      error: productCountError,
    } = await supabaseAdmin
      .from("products")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("category_id", id);

    if (productCountError) {
      console.error(
        productCountError
      );

      return NextResponse.json(
        {
          error:
            "Unable to check products in this category.",
        },
        { status: 500 }
      );
    }

    if ((productCount ?? 0) > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete "${category.name}". ${productCount} product${productCount === 1 ? "" : "s"} ${productCount === 1 ? "is" : "are"} assigned to this category. Move them to another category first.`,
          productCount,
        },
        { status: 409 }
      );
    }

    const { error: deleteError } =
      await supabaseAdmin
        .from("categories")
        .delete()
        .eq("id", id);

    if (deleteError) {
      console.error(deleteError);

      return NextResponse.json(
        {
          error:
            "Unable to delete category.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Unable to delete category.",
      },
      { status: 500 }
    );
  }
}