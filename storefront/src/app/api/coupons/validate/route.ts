import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ?? "http://backend:4000";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(
      `${BACKEND_URL}/api/coupons/validate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
    console.error(error);

    return NextResponse.json(
      {
        error: "Unable to validate coupon.",
      },
      { status: 500 }
    );
  }
}