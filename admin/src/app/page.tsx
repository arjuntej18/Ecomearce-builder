// Admin dashboard with real Supabase statistics.

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/login");
  }

  const [
    productsResult,
    ordersResult,
    paidOrdersResult,
    customersResult,
    inventoryResult,
    recentOrdersResult,
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("orders")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("payment_status", "paid"),

    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "customer"),

    supabase
      .from("inventory")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("orders")
      .select(
        "id, order_number, customer_name, total_amount, payment_status, status, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <main className="p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          Store overview
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Products", productsResult.count ?? 0],
            ["Orders", ordersResult.count ?? 0],
            ["Paid Orders", paidOrdersResult.count ?? 0],
            ["Customers", customersResult.count ?? 0],
            ["Inventory Items", inventoryResult.count ?? 0],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-gray-500">{label}</p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="border-b px-6 py-5">
            <h2 className="text-xl font-semibold">
              Recent Orders
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Order
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Payment
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {(recentOrdersResult.data ?? []).map((order) => (
                  <tr key={order.id} className="border-t">
                    <td className="px-6 py-4 font-medium">
                      {order.order_number}
                    </td>

                    <td className="px-6 py-4">
                      {order.customer_name}
                    </td>

                    <td className="px-6 py-4 font-medium">
                      ₹{Number(order.total_amount).toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          order.payment_status === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {!recentOrdersResult.data?.length && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}