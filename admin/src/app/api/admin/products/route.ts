import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/verifyAdmin";

const BACKEND_URL =
  process.env.BACKEND_URL ?? "http://backend:4000";

export async function GET() {
  try {
    const admin = await verifyAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/admin/products`,
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
      "ADMIN PRODUCTS GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load products.",
      },
      { status: 500 }
    );
  }
}