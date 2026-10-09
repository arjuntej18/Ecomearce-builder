import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ?? "http://backend:4000";

export async function GET(request: Request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const category =
      searchParams.get("category");

    const url = new URL(
      `${BACKEND_URL}/api/products`
    );

    if (category) {
      url.searchParams.set(
        "category",
        category
      );
    }

    const response = await fetch(
      url.toString(),
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
      "Products proxy error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load products",
      },
      {
        status: 500,
      }
    );
  }
}