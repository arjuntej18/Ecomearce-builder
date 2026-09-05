// Creates/synchronizes a customer account and links verified guest orders.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    const supabase =
      await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const email =
      user.email
        ?.trim()
        .toLowerCase();

    if (!email) {
      return NextResponse.json(
        {
          error:
            "Authenticated user has no email.",
        },
        { status: 400 }
      );
    }

    const { data: existingProfile } =
      await supabaseAdmin
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .maybeSingle();

    if (
      existingProfile?.role === "admin"
    ) {
      return NextResponse.json(
        {
          error:
            "Admin accounts cannot use the customer account area.",
        },
        { status: 403 }
      );
    }

    const { error: profileError } =
      await supabaseAdmin
        .from("profiles")
        .upsert(
          {
            id: user.id,
            full_name:
              user.user_metadata
                ?.full_name ??
              null,
            role: "customer",
          },
          {
            onConflict: "id",
          }
        );

    if (profileError) {
      console.error(profileError);

      return NextResponse.json(
        {
          error:
            "Unable to create customer profile.",
        },
        { status: 500 }
      );
    }

    const {
      error: customerError,
    } = await supabaseAdmin
      .from("customer_accounts")
      .upsert(
        {
          user_id: user.id,
          last_login_at:
            new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

    if (customerError) {
      console.error(customerError);

      return NextResponse.json(
        {
          error:
            "Unable to create customer account.",
        },
        { status: 500 }
      );
    }

    // Link all previously verified guest orders
    // that used this same email.
    const {
      error: orderError,
    } = await supabaseAdmin
      .from("orders")
      .update({
        user_id: user.id,
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "customer_email",
        email
      )
      .is(
        "user_id",
        null
      );

    if (orderError) {
      console.error(
        orderError
      );

      return NextResponse.json(
        {
          error:
            "Customer created, but previous orders could not be linked.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      email,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Unable to synchronize customer account.",
      },
      { status: 500 }
    );
  }
}