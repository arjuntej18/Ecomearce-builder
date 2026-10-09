import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ?? "http://backend:4000";

export async function POST(request: Request) {
  try {
    const cookie =
      request.headers.get("cookie") ?? "";

    const response = await fetch(
      `${BACKEND_URL}/api/auth/logout`,
      {
        method: "POST",
        headers: {
          cookie,
        },
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
        error: "Unable to logout.",
      },
      { status: 500 }
    );
  }
}