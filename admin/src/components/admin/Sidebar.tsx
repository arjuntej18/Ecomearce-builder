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
  { name: "Shop Preview", href: "/admin/shop" },
];

export default function Sidebar({
  mobileMenuOpen,
  onClose,
}: {
  mobileMenuOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
    
  className={`fixed left-0 top-0 z-50 h-screen w-64 border-r border-gray-200 bg-white transition-transform duration-300 md:translate-x-0 ${
    mobileMenuOpen
      ? "translate-x-0"
      : "-translate-x-full"
  }`}
>
      <div className="flex items-start justify-between border-b px-6 py-5">
  <div>
    <h1 className="text-xl font-bold text-gray-900">
      Clothing Store
    </h1>

    <p className="mt-1 text-sm text-gray-500">
      Admin Panel
    </p>
  </div>

  <button
    type="button"
    onClick={onClose}
    className="flex h-10 w-10 items-center justify-center rounded-full text-2xl font-semibold text-gray-900 hover:bg-gray-100 md:hidden"
    aria-label="Close menu"
  >
    ×
  </button>
</div>
      
      {mobileMenuOpen && (
  <div
    className="fixed inset-0 -z-10 bg-black/30 md:hidden"
    onClick={onClose}
  />
)}

      <nav className="space-y-1 p-4">
        {items.map((item) => {
          const active =
            pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
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