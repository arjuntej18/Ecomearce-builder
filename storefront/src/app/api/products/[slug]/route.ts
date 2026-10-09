import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ?? "http://backend:4000";

export async function GET(
  request: Request,
  context: {
    params: Promise<{ slug: string }>;
  }
) {
  try {
    const { slug } = await context.params;

    const response = await fetch(
      `${BACKEND_URL}/api/products/${encodeURIComponent(slug)}`,
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
      "Product proxy error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load product",
      },
      {
        status: 500,
      }
    );
  }
}