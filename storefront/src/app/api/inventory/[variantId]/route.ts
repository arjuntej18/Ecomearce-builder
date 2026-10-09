import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ?? "http://backend:4000";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    const { variantId } = await params;

    const response = await fetch(
      `${BACKEND_URL}/api/inventory/${encodeURIComponent(
        variantId
      )}`,
      {
        cache: "no-store",
      }
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      "Inventory proxy error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to load stock." },
      { status: 500 }
    );
  }
}