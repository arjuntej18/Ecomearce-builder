import { redirect } from "next/navigation";
import { verifyAdmin } from "@/lib/verifyAdmin";
import OrdersTable from "./OrdersTable";

const BACKEND_URL =
  process.env.BACKEND_URL ?? "http://backend:4000";

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string | null;
  customer_email: string | null;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
  location_accuracy: number | null;
  location_shared_at: string | null;
};

export default async function OrdersPage() {
  const admin = await verifyAdmin();

  if (!admin) {
    redirect("/login");
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/admin/orders`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!response.ok) {
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

    const data = await response.json();

    const orderRows: OrderRow[] = (
      data?.orders ?? []
    ).map((order: any) => ({
      id: String(order.id),
      order_number: String(order.order_number),
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
      latitude:
        order.latitude == null ? null : Number(order.latitude),
      longitude:
        order.longitude == null ? null : Number(order.longitude),
      location_accuracy:
        order.location_accuracy == null
          ? null
          : Number(order.location_accuracy),
      location_shared_at:
        order.location_shared_at == null
          ? null
          : String(order.location_shared_at),
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

          <div className="mt-6">
            <OrdersTable orders={orderRows} />
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error(
      "ADMIN ORDERS PAGE ERROR:",
      error
    );

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
}