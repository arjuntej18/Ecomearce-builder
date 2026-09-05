import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function requireAdmin() {
  const supabaseSession = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabaseSession.auth.getUser();

  if (userError || !user) {
    return {
      errorResponse: NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error: profileError } =
    await supabaseSession
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  if (profileError || profile?.role !== "admin") {
    return {
      errorResponse: NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      ),
    };
  }

  return {
    errorResponse: null,
  };
}

export async function GET() {
  const auth = await requireAdmin();

  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const { data: categories, error } = await supabaseAdmin
    .from("categories")
    .select("id, name, slug, description, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Load categories error:", error);

    return NextResponse.json(
      { error: "Unable to load categories." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    categories: categories ?? [],
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();

  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const slug =
      typeof body.slug === "string"
        ? body.slug.trim().toLowerCase()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim() || null
        : null;

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required." },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { error: "Category slug is required." },
        { status: 400 }
      );
    }

    const { data: existingCategory } =
      await supabaseAdmin
        .from("categories")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

    if (existingCategory) {
      return NextResponse.json(
        {
          error:
            "A category with this slug already exists.",
        },
        { status: 409 }
      );
    }

    const { data: category, error } =
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
      console.error("Create category error:", error);

      return NextResponse.json(
        { error: "Unable to create category." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { category },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create category request error:",
      error
    );

    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();

  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    const body = await request.json();

    const id =
      typeof body.id === "string"
        ? body.id.trim()
        : "";

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete category error:", error);

      return NextResponse.json(
        { error: "Unable to delete category." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Delete category request error:",
      error
    );

    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}