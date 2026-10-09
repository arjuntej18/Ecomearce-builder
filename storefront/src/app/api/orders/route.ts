import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ?? "http://backend:4000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("PROXY ORDER BODY:", body);

    const cookie =
      request.headers.get("cookie") ?? "";

    const response = await fetch(
      `${BACKEND_URL}/api/orders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie,
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      "Order proxy error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to create order.",
      },
      { status: 500 }
    );
  }
}