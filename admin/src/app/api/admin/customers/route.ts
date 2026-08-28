// Loads customer profile information and email securely for admins.

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
        {
          error:
            "Admin access required.",
        },
        { status: 403 }
      );
    }

    const {
      data: profiles,
      error: profileError,
    } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, full_name, phone, role, created_at"
      )
      .eq("role", "customer")
      .order("created_at", {
        ascending: false,
      });

    if (profileError) {
      console.error(profileError);

      return NextResponse.json(
        {
          error:
            "Unable to load customers.",
        },
        { status: 500 }
      );
    }

    const {
      data: accounts,
      error: accountError,
    } = await supabaseAdmin
      .from("customer_accounts")
      .select(
        "id, user_id, last_login_at, created_at"
      );

    if (accountError) {
      console.error(accountError);

      return NextResponse.json(
        {
          error:
            "Unable to load customer accounts.",
        },
        { status: 500 }
      );
    }

    const accountMap = new Map(
      (accounts ?? []).map(
        (account) => [
          account.user_id,
          account,
        ]
      )
    );

    const authUsers = [];
    let page = 1;
    const perPage = 1000;

    while (true) {
      const {
        data,
        error,
      } =
        await supabaseAdmin.auth.admin.listUsers(
          {
            page,
            perPage,
          }
        );

      if (error) {
        console.error(error);

        return NextResponse.json(
          {
            error:
              "Unable to load customer emails.",
          },
          { status: 500 }
        );
      }

      authUsers.push(
        ...(data.users ?? [])
      );

      if (
        data.users.length <
        perPage
      ) {
        break;
      }

      page += 1;
    }

    const emailMap = new Map(
      authUsers.map((user) => [
        user.id,
        user.email ?? null,
      ])
    );

    const customers = (
      profiles ?? []
    ).map((profile) => {
      const account =
        accountMap.get(profile.id);

      return {
        id: profile.id,
        full_name:
          profile.full_name,
        email:
          emailMap.get(profile.id) ??
          null,
        phone: profile.phone,
        created_at:
          profile.created_at ??
          account?.created_at ??
          null,
        last_login_at:
          account?.last_login_at ??
          null,
      };
    });

    return NextResponse.json({
      customers,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Unable to load customers.",
      },
      { status: 500 }
    );
  }
}