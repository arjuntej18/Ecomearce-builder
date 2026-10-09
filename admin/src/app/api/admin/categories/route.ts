import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/verifyAdmin";

const BACKEND_URL =
  process.env.BACKEND_URL ?? "http://backend:4000";

async function requireAdmin() {
  const admin = await verifyAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 403 }
    );
  }

  return null;
}

export async function GET() {
  const authError = await requireAdmin();

  if (authError) {
    return authError;
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/admin/categories`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        data,
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "Load categories request error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to load categories." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();

  if (authError) {
    return authError;
  }

  try {
    const body = await request.json();

    const response = await fetch(
      `${BACKEND_URL}/api/admin/categories`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        data,
        { status: response.status }
      );
    }

    return NextResponse.json(
      data,
      { status: response.status }
    );
  } catch (error) {
    console.error(
      "Create category request error:",
      error
    );

    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin();

  if (authError) {
    return authError;
  }

  try {
    const body = await request.json();

    const response = await fetch(
      `${BACKEND_URL}/api/admin/categories`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        data,
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "Delete category request error:",
      error
    );

    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}