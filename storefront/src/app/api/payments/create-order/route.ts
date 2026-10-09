import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ?? "http://backend:4000";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const cookie =
      request.headers.get("cookie") ?? "";

    const response = await fetch(
      `${BACKEND_URL}/api/payments/create-order`,
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
      "Razorpay order proxy error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to create Razorpay order.",
      },
      { status: 500 }
    );
  }
}