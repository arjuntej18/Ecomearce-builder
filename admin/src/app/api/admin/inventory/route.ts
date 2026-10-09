import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const BACKEND_URL =
  process.env.BACKEND_URL ?? "http://backend:4000";

async function getAdminAccessToken() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

export async function GET() {
  try {
    const accessToken = await getAdminAccessToken();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/admin/inventory`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to load inventory." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const accessToken = await getAdminAccessToken();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const response = await fetch(
      `${BACKEND_URL}/api/admin/inventory`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to update inventory." },
      { status: 500 }
    );
  }
}