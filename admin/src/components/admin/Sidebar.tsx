"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { name: "Dashboard", href: "/admin" },
  { name: "Orders", href: "/admin/orders" },
  { name: "Products", href: "/admin/products" },
  { name: "Categories", href: "/admin/categories" },
  { name: "Customers", href: "/admin/customers" },
  { name: "Inventory", href: "/admin/inventory" },
  { name: "Coupons", href: "/admin/coupons" },
  { name: "Shop Preview", href: "/shop" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r bg-white md:block">
      <div className="border-b px-6 py-5">
        <h1 className="text-xl font-bold text-gray-900">
          Clothing Store
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Admin Panel
        </p>
      </div>

      <nav className="space-y-1 p-4">
        {items.map((item) => {
          const active =
            pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}