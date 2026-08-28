"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Order = {
  id: string;
  order_number: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  total_amount: number;
  status: string;
  payment_status: string;
  tracking_number: string | null;
  invoice_number: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type OrderItem = {
  id: string;
  order_id: string;
  variant_id: string | null;
  product_name: string;
  variant_name: string | null;
  sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string | null;
};

const statuses = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
];

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const orderId = String(params.id);

  const [order, setOrder] =
    useState<Order | null>(null);

  const [items, setItems] =
    useState<OrderItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      setError("");

      try {
        const response =
          await fetch(
            `/api/admin/orders/${encodeURIComponent(
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
              "Unable to load order."
          );
          return;
        }

        setOrder(result.order);
        setItems(result.items ?? []);
      } catch (error) {
        console.error(error);

        setError(
          "Unable to load order details."
        );
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  async function updateStatus(
    status: string
  ) {
    if (!order) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response =
        await fetch(
          "/api/admin/orders",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              orderId: order.id,
              status,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Unable to update status."
        );
        return;
      }

      setOrder((current) =>
        current
          ? {
              ...current,
              status,
            }
          : current
      );
    } catch (error) {
      console.error(error);

      setError(
        "Unable to update status."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="p-6">
        Loading order...
      </main>
    );
  }

  if (!order) {
    return (
      <main className="p-6">
        <button
          type="button"
          onClick={() =>
            router.push(
              "/admin/orders"
            )
          }
          className="rounded-lg border px-4 py-2"
        >
          Back to Orders
        </button>

        <p className="mt-6 text-red-600">
          {error ||
            "Order not found."}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/orders"
                )
              }
              className="mb-3 text-sm font-medium text-gray-500 hover:text-black"
            >
              ← Back to Orders
            </button>

            <h1 className="text-3xl font-bold text-gray-900">
              {order.order_number}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {order.created_at
                ? new Date(
                    order.created_at
                  ).toLocaleString()
                : "—"}
            </p>
          </div>

          <select
            value={order.status}
            disabled={saving}
            onChange={(event) =>
              updateStatus(
                event.target.value
              )
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-900"
          >
            {statuses.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status
                    .charAt(0)
                    .toUpperCase() +
                    status.slice(1)}
                </option>
              )
            )}
          </select>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Customer */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Customer
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-gray-500">
                  Name
                </p>
                <p className="font-medium text-gray-900">
                  {order.customer_name ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">
                  Email
                </p>
                <p className="font-medium text-gray-900">
                  {order.customer_email ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">
                  Phone
                </p>
                <p className="font-medium text-gray-900">
                  {order.customer_phone ||
                    "—"}
                </p>
              </div>
            </div>
          </section>

          {/* Address */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Delivery Address
            </h2>

            <div className="mt-4 text-sm leading-6 text-gray-700">
              <p>
                {order.address_line1 ||
                  "—"}
              </p>

              {order.address_line2 && (
                <p>
                  {order.address_line2}
                </p>
              )}

              <p>
                {[
                  order.city,
                  order.state,
                  order.postal_code,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>

              <p>
                {order.country ||
                  "India"}
              </p>
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Payment
            </h2>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm text-gray-500">
                  Payment status
                </p>

                <span
                  className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    order.payment_status ===
                    "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {
                    order.payment_status
                  }
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Invoice
                </p>

                <p className="font-medium text-gray-900">
                  {order.invoice_number ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Tracking
                </p>

                <p className="font-medium text-gray-900">
                  {order.tracking_number ||
                    "Not assigned"}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Items */}
        <section className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Order Items
            </h2>
          </div>

          {items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Product
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      SKU
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Quantity
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Unit Price
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.map(
                    (item) => (
                      <tr
                        key={item.id}
                        className="border-b last:border-b-0"
                      >
                        <td className="px-6 py-5">
                          <div className="font-semibold text-gray-900">
                            {
                              item.product_name
                            }
                          </div>

                          {item.variant_name && (
                            <div className="mt-1 text-sm text-gray-500">
                              {
                                item.variant_name
                              }
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-500">
                          {item.sku ||
                            "—"}
                        </td>

                        <td className="px-6 py-5">
                          {item.quantity}
                        </td>

                        <td className="px-6 py-5">
                          ₹
                          {Number(
                            item.unit_price
                          ).toFixed(2)}
                        </td>

                        <td className="px-6 py-5 font-semibold">
                          ₹
                          {Number(
                            item.total_price
                          ).toFixed(2)}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-gray-500">
              No items found.
            </div>
          )}
        </section>

        {/* Summary */}
        <section className="mt-6 ml-auto max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Order Summary
          </h2>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">
                Subtotal
              </span>

              <span>
                ₹
                {Number(
                  order.subtotal
                ).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                Discount
              </span>

              <span>
                -₹
                {Number(
                  order.discount
                ).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                Shipping
              </span>

              <span>
                ₹
                {Number(
                  order.shipping_fee
                ).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between border-t pt-3 text-base font-bold">
              <span>Total</span>

              <span>
                ₹
                {Number(
                  order.total_amount
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}