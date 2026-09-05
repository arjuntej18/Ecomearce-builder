"use client";

// Displays the confirmed order and expected delivery date.

import {
  Suspense,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Order = {
  order_number: string;
  invoice_number: string | null;
  expected_delivery_date: string | null;
  payment_status: string;
  total_amount: number;
};

function OrderConfirmationContent() {
  const searchParams =
    useSearchParams();

  const orderId =
    searchParams.get("orderId");

  const orderNumberFromUrl =
    searchParams.get("order") ||
    "Unavailable";

  const invoiceNumberFromUrl =
    searchParams.get("invoice") ||
    "Unavailable";

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const response =
          await fetch(
            `/api/orders/${encodeURIComponent(
              orderId
            )}`,
            {
              cache: "no-store",
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          setError(
            result.error ||
              "Unable to load order details."
          );
          return;
        }

        setOrder(result.order);
      } catch (error) {
        console.error(error);

        setError(
          "Unable to load order details."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  const expectedDelivery =
    order?.expected_delivery_date
      ? new Date(
          `${order.expected_delivery_date}T00:00:00`
        ).toLocaleDateString(
          "en-IN",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        )
      : null;

  const orderNumber =
    order?.order_number ||
    orderNumberFromUrl;

  const invoiceNumber =
    order?.invoice_number ||
    invoiceNumberFromUrl;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
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

          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <div className="space-y-4">
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

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-medium text-gray-500">
                    Expected Delivery
                  </p>

                  {loading ? (
                    <p className="mt-1 text-sm text-gray-500">
                      Loading delivery date...
                    </p>
                  ) : expectedDelivery ? (
                    <p className="mt-1 text-lg font-bold text-gray-900">
                      {expectedDelivery}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">
                      Delivery date unavailable
                    </p>
                  )}
                </div>

                {order && (
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm font-medium text-gray-500">
                      Order Total
                    </p>

                    <p className="mt-1 text-lg font-bold text-gray-900">
                      ₹
                      {Number(
                        order.total_amount
                      ).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <p className="mt-5 text-center text-sm text-gray-500">
              Keep your order number for future reference.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link
                href="/shop"
                className="rounded-lg bg-black px-5 py-3 text-center font-semibold text-white transition hover:bg-gray-800"
              >
                Continue Shopping
              </Link>

              <button
                type="button"
                onClick={() =>
                  window.print()
                }
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

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 px-4 py-12">
          <div className="mx-auto max-w-2xl">
            Loading order confirmation...
          </div>
        </main>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}