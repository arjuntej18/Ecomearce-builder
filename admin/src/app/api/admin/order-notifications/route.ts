import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/verifyAdmin";

export async function GET(request: Request) {
  const admin = await verifyAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const since = searchParams.get("since");

  const BACKEND_URL =
    process.env.BACKEND_URL ?? "http://backend:4000";

  const query = new URLSearchParams();

  if (since) {
    query.set("since", since);
  }

  const response = await fetch(
    `${BACKEND_URL}/api/admin/order-notifications${
      query.toString()
        ? `?${query.toString()}`
        : ""
    }`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: response.status }
    );
  }

  const data = await response.json();

  return NextResponse.json(data);
}