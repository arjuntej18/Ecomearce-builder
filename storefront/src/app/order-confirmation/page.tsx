// Final order confirmation page.

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();

  const orderNumber =
    searchParams.get("order") || "Unavailable";

  const invoiceNumber =
    searchParams.get("invoice") || "Unavailable";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          {/* Success header */}
          <div className="bg-green-600 px-6 py-10 text-center text-white">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl font-bold text-green-600">
              ✓
            </div>

            <h1 className="mt-5 text-3xl font-bold">
              Order Confirmed
            </h1>

            <p className="mt-2 text-green-50">
              Your payment was successful and your order is confirmed.
            </p>
          </div>

          {/* Order details */}
          <div className="p-6 sm:p-8">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Order Number
                  </p>

                  <p className="mt-1 break-all text-lg font-bold text-gray-900">
                    {orderNumber}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-medium text-gray-500">
                    Invoice Number
                  </p>

                  <p className="mt-1 break-all text-lg font-bold text-gray-900">
                    {invoiceNumber}
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-5 text-center text-sm text-gray-500">
              Keep your order number for future reference.
            </p>

            {/* Actions */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link
                href="/shop"
                className="rounded-lg bg-black px-5 py-3 text-center font-semibold text-white transition hover:bg-gray-800"
              >
                Continue Shopping
              </Link>

              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-center font-semibold text-gray-900 transition hover:bg-gray-100"
              >
                Print Invoice
              </button>
            </div>

            <Link
              href="/"
              className="mt-4 block text-center text-sm font-medium text-gray-600 hover:text-black"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}