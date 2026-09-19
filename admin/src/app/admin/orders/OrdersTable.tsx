"use client";

import { formatDateTime } from "@/lib/formatDateTime";
import { useState } from "react";

type Order = {
  id: string;
  order_number: string;
  customer_name: string | null;
  customer_email: string | null;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
};

const statuses = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
];

export default function OrdersTable({
  orders,
}: {
  orders: Order[];
}) {
  const [orderList, setOrderList] =
    useState<Order[]>(orders);

  const [savingId, setSavingId] =
    useState<string | null>(null);

  const [error, setError] = useState("");

  async function updateStatus(
    orderId: string,
    status: string
  ) {
    setSavingId(orderId);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/orders",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            orderId,
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to update order status."
        );
        return;
      }

      setOrderList((current) =>
        current.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status,
              }
            : order
        )
      );
    } catch (error) {
      console.error(error);
      setError(
        "Unable to update order status."
      );
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="mt-8">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {orderList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Order
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Payment
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {orderList.map((order) => {
                  const saving =
                    savingId === order.id;

                  return (
                    <tr
                      key={order.id}
                      className="border-b last:border-b-0"
                    >
                      <td className="px-6 py-4 font-medium">
  <button
    type="button"
    onClick={() =>
      window.location.href =
        `/admin/orders/${order.id}`
    }
    className="font-semibold text-gray-900 hover:underline"
  >
    {order.order_number}
  </button>
</td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {order.customer_name ||
                            "—"}
                        </div>

                        <div className="text-sm text-gray-500">
                          {order.customer_email ||
                            "—"}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-900">
                        ₹
                        {Number(
                          order.total_amount
                        ).toFixed(2)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            order.payment_status ===
                            "paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.payment_status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          disabled={saving}
                          onChange={(event) =>
                            updateStatus(
                              order.id,
                              event.target.value
                            )
                          }
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900"
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

                        {saving && (
                          <div className="mt-1 text-xs text-gray-500">
                            Saving...
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDateTime(order.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-gray-500">
            No orders found.
          </div>
        )}
      </div>
    </div>
  );
}