import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ?? "http://backend:4000";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(
      `${BACKEND_URL}/api/auth/google`,
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

    const nextResponse =
      NextResponse.json(data, {
        status: response.status,
      });

    const setCookie =
      response.headers.get("set-cookie");

    if (setCookie) {
      nextResponse.headers.set(
        "set-cookie",
        setCookie
      );
    }

    return nextResponse;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Unable to authenticate with Google.",
      },
      { status: 500 }
    );
  }
}