// Loads admin orders and passes them to the client-side order table.

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import OrdersTable from "./OrdersTable";

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string | null;
  customer_email: string | null;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
};

export default async function OrdersPage() {
  const supabase =
    await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  if (!profile || profile.role !== "admin") {
    redirect("/login");
  }

  const {
    data: orders,
    error,
  } = await supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_email, total_amount, status, payment_status, created_at"
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Orders
        </h1>

        <p className="mt-4 text-red-600">
          Failed to load orders.
        </p>
      </main>
    );
  }

  const orderRows: OrderRow[] =
    (orders ?? []).map((order) => ({
      id: String(order.id),
      order_number: String(
        order.order_number
      ),
      customer_name:
        order.customer_name ?? null,
      customer_email:
        order.customer_email ?? null,
      total_amount: Number(
        order.total_amount
      ),
      status: String(order.status),
      payment_status: String(
        order.payment_status
      ),
      created_at: String(
        order.created_at
      ),
    }));

  return (
    <main className="p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900">
          Orders
        </h1>

        <p className="mt-2 text-gray-600">
          Manage customer orders and payment status.
        </p>

        <OrdersTable
          orders={orderRows}
        />
      </div>
    </main>
  );
}