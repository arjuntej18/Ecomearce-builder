import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ?? "http://backend:4000";

export async function GET(request: Request) {
  try {
    const cookie = request.headers.get("cookie") ?? "";

    const sessionResponse = await fetch(
      `${BACKEND_URL}/api/auth/session`,
      {
        headers: {
          cookie,
        },
        cache: "no-store",
      }
    );

    if (!sessionResponse.ok) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        {
          status: sessionResponse.status,
        }
      );
    }

    const session = await sessionResponse.json();

    if (session.role !== "customer") {
      return NextResponse.json(
        {
          error: "Customer access required.",
        },
        { status: 403 }
      );
    }

    const ordersResponse = await fetch(
  `${BACKEND_URL}/api/account/orders/${session.userId}`,
  {
    headers: {
      cookie,
    },
    cache: "no-store",
  }
);

    if (!ordersResponse.ok) {
      return NextResponse.json(
        {
          error: "Unable to load orders.",
        },
        { status: 500 }
      );
    }

    const data = await ordersResponse.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Unable to load orders.",
      },
      { status: 500 }
    );
  }
}