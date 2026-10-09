"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type OrderItem = {
  id: string;
  product_name: string;
  variant_name: string | null;
  sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
};

type Order = {
  id: string;
  order_number: string;
  invoice_number: string | null;
  expected_delivery_date: string | null;
  payment_status: string;
  status: string;
  total_amount: number;
  created_at: string;
  items: OrderItem[];
};

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!orderId) return;

    async function loadOrder() {
      try {
        const response = await fetch(
          `/api/orders/${encodeURIComponent(orderId)}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load order.");
        }

        setOrder(data.order);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load order."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 pt-32 pb-12 text-gray-900">
        <div className="mx-auto max-w-4xl">
          <p className="text-gray-500">
            Loading order...
          </p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 pt-32 pb-12 text-gray-900">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold">
              Order not found
            </h1>

            <p className="mt-2 text-gray-500">
              {error ||
                "Unable to load this order."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 pt-32 pb-12 text-gray-900">
      <div className="mx-auto max-w-4xl">

        {/* Header */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Order
              </p>

              <h1 className="mt-1 text-2xl font-bold">
                {order.order_number}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                {new Date(
                  order.created_at
                ).toLocaleDateString("en-IN")}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-2xl font-bold">
                ₹
                {Number(
                  order.total_amount
                ).toFixed(2)}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {order.payment_status}
                {" · "}
                {order.status}
              </p>
            </div>

          </div>
        </section>

        {/* Products */}

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-semibold">
            Items
          </h2>

          <div className="mt-5 divide-y">

            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
              >

                <div>
                  <p className="font-semibold">
                    {item.product_name}
                  </p>

                  {item.variant_name && (
                    <p className="mt-1 text-sm text-gray-500">
                      {item.variant_name}
                    </p>
                  )}

                  {item.sku && (
                    <p className="mt-1 text-xs text-gray-400">
                      SKU: {item.sku}
                    </p>
                  )}
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-sm text-gray-500">
                    {item.quantity} × ₹
                    {Number(
                      item.unit_price
                    ).toFixed(2)}
                  </p>

                  <p className="mt-1 font-semibold">
                    ₹
                    {Number(
                      item.total_price
                    ).toFixed(2)}
                  </p>
                </div>

              </div>
            ))}

          </div>

        </section>

        {/* Order information */}

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-semibold">
            Order Information
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">

            <div>
              <p className="text-sm text-gray-500">
                Payment
              </p>

              <p className="mt-1 font-medium">
                {order.payment_status}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Order status
              </p>

              <p className="mt-1 font-medium">
                {order.status}
              </p>
            </div>

            {order.expected_delivery_date && (
              <div>
                <p className="text-sm text-gray-500">
                  Expected delivery
                </p>

                <p className="mt-1 font-medium">
                  {new Date(
                    order.expected_delivery_date
                  ).toLocaleDateString(
                    "en-IN"
                  )}
                </p>
              </div>
            )}

            {order.invoice_number && (
              <div>
                <p className="text-sm text-gray-500">
                  Invoice
                </p>

                <p className="mt-1 font-medium">
                  {order.invoice_number}
                </p>
              </div>
            )}

          </div>

        </section>

      </div>
    </main>
  );
}