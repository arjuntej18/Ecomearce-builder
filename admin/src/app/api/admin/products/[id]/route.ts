import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/verifyAdmin";

const BACKEND_URL =
  process.env.BACKEND_URL ?? "http://backend:4000";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: Params
) {
  try {
    const admin = await verifyAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const response = await fetch(
      `${BACKEND_URL}/api/admin/products/${id}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      "ADMIN PRODUCT GET ERROR:",
      error
    );

    return NextResponse.json(
      { error: "Unable to load product." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: Params
) {
  try {
    const admin = await verifyAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const response = await fetch(
      `${BACKEND_URL}/api/admin/products/${id}`,
      {
        method: "PATCH",
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
    console.error(
      "ADMIN PRODUCT PATCH ERROR:",
      error
    );

    return NextResponse.json(
      { error: "Unable to update product." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: Params
) {
  try {
    const admin = await verifyAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const response = await fetch(
      `${BACKEND_URL}/api/admin/products/${id}`,
      {
        method: "DELETE",
        cache: "no-store",
      }
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      "ADMIN PRODUCT DELETE ERROR:",
      error
    );

    return NextResponse.json(
      { error: "Unable to delete product." },
      { status: 500 }
    );
  }
}