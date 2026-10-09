import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ?? "http://backend:4000";

export async function GET(request: Request) {
  try {
    const cookie =
      request.headers.get("cookie") ?? "";

    const response = await fetch(
      `${BACKEND_URL}/api/auth/session`,
      {
        headers: {
          cookie,
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
      {
        error: "Unable to check session.",
      },
      { status: 500 }
    );
  }
}