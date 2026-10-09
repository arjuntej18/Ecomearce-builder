import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/verifyAdmin";

const BACKEND_URL =
  process.env.BACKEND_URL ?? "http://backend:4000";

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const admin = await verifyAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          error: "Admin access required.",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Order ID is required.",
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/admin/orders/${encodeURIComponent(id)}`,
      {
        method: "GET",
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
      {
        error: "Unable to load order details.",
      },
      { status: 500 }
    );
  }
}