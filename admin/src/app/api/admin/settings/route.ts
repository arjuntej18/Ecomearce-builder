// Secure admin API for reading and updating store delivery settings.

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

    const {
      data,
      error,
    } = await supabaseAdmin
      .from("store_settings")
      .select("id, delivery_days, updated_at")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: "Unable to load settings." },
        { status: 500 }
      );
    }

    if (!data) {
      const {
        data: created,
        error: createError,
      } = await supabaseAdmin
        .from("store_settings")
        .insert({
          delivery_days: 7,
        })
        .select(
          "id, delivery_days, updated_at"
        )
        .single();

      if (createError) {
        console.error(createError);

        return NextResponse.json(
          {
            error:
              "Unable to create store settings.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        settings: created,
      });
    }

    return NextResponse.json({
      settings: data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to load settings." },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const deliveryDays = Number(
      body.delivery_days
    );

    if (
      !Number.isInteger(deliveryDays) ||
      deliveryDays < 1 ||
      deliveryDays > 365
    ) {
      return NextResponse.json(
        {
          error:
            "Delivery days must be a whole number between 1 and 365.",
        },
        { status: 400 }
      );
    }

    const {
      data: existing,
      error: lookupError,
    } = await supabaseAdmin
      .from("store_settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (lookupError) {
      console.error(lookupError);

      return NextResponse.json(
        {
          error:
            "Unable to check store settings.",
        },
        { status: 500 }
      );
    }

    let data;
    let error;

    if (existing) {
      const result = await supabaseAdmin
        .from("store_settings")
        .update({
          delivery_days: deliveryDays,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select(
          "id, delivery_days, updated_at"
        )
        .single();

      data = result.data;
      error = result.error;
    } else {
      const result = await supabaseAdmin
        .from("store_settings")
        .insert({
          delivery_days: deliveryDays,
        })
        .select(
          "id, delivery_days, updated_at"
        )
        .single();

      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error(error);

      return NextResponse.json(
        {
          error:
            "Unable to update delivery settings.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Unable to update settings.",
      },
      { status: 500 }
    );
  }
}