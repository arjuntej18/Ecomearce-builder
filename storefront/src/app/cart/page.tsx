"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getGuestSessionId } from "@/lib/cart/guestCart";

type CartItem = {
  id: string;
  quantity: number;
  variant_id: string;
  product_variants: {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  price: number;
  image_url: string | null;
  inventory_quantity: number;
  products: {
      id: string;
      name: string;
      slug: string;
      main_image_url: string | null;
    };
  };
};

type Cart = {
  id: string;
  session_id: string;
  cart_items: CartItem[];
};

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadCart() {
    const sessionId = getGuestSessionId();

    if (!sessionId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/cart?sessionId=${encodeURIComponent(sessionId)}`
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        return;
      }

      setCart(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-3xl font-bold">Cart</h1>
        <p className="mt-4 text-gray-500">Loading cart...</p>
      </main>
    );
  }

  const items = cart?.cart_items ?? [];

  const total = items.reduce((sum, item) => {
    return (
      sum +
      Number(item.product_variants.price) * Number(item.quantity)
    );
  }, 0);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Your Cart
        </h1>
        <p className="mt-2 text-gray-500">
          Review your items before checkout.
        </p>
      </div>

      {!items.length ? (
        <div className="rounded-xl border bg-white p-10 text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Your cart is empty
          </h2>

          <p className="mt-2 text-gray-500">
            Add a product to get started.
          </p>

          <Link
            href="/shop"
            className="mt-6 inline-block rounded-lg bg-black px-6 py-3 font-semibold text-white"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {items.map((item) => {
  const variant = item.product_variants;
  const product = variant.products;

  const stock = Number(variant.inventory_quantity ?? 0);

  const stockText =
    stock <= 0
      ? "Out of Stock"
      : stock <= 5
      ? `Only ${stock} left`
      : "In Stock";

  const stockClass =
    stock <= 0
      ? "text-red-600"
      : stock <= 5
      ? "text-orange-600"
      : "text-green-600";

  return (
    <div
      key={item.id}
      className="rounded-xl border bg-white p-4"
    >
      <div className="flex gap-4">
        <Link
          href={`/product/${product.slug}`}
          className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100"
        >
          {(variant.image_url || product.main_image_url) && (
            <img
              src={
                variant.image_url ||
                product.main_image_url ||
                ""
              }
              alt={product.name}
              className="h-full w-full object-cover transition hover:scale-105"
            />
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <Link
              href={`/product/${product.slug}`}
              className="font-semibold text-gray-900 hover:text-[#72263a]"
            >
              {product.name}
            </Link>

            <button
  type="button"
  onClick={async () => {
    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: getGuestSessionId(),
          itemId: item.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to remove item");
      }

      setCart((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          cart_items: prev.cart_items.filter(
            (cartItem) => cartItem.id !== item.id
          ),
        };
      });
    } catch (error) {
      console.error("Remove cart item failed:", error);
      alert("Failed to remove item.");
    }
  }}
  className="text-xl font-semibold text-gray-400 transition hover:text-red-600"
  aria-label={`Remove ${product.name}`}
>
  ×
</button>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            {[variant.color, variant.size]
              .filter(Boolean)
              .join(" / ") || "Standard"}
          </p>

          <p className="mt-2 font-semibold text-gray-900">
            ₹{Number(variant.price).toFixed(2)}
          </p>

          <p className={`mt-1 text-sm font-medium ${stockClass}`}>
            ● {stockText}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t pt-4">
        <Link
          href={`/product/${product.slug}`}
          className="block w-full rounded-lg bg-[#72263a] px-4 py-3 text-center font-semibold text-white transition hover:bg-[#5d1e2f]"
        >
          View / Buy Product
        </Link>
      </div>
    </div>
  );
})}
          </div>

          <aside className="h-fit rounded-xl border bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Order Summary
            </h2>

            <div className="mt-6 flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">
                ₹{total.toFixed(2)}
              </span>
            </div>

            <div className="mt-3 flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span className="font-medium">₹0.00</span>
            </div>

            <div className="mt-6 flex justify-between border-t pt-4">
              <span className="text-lg font-semibold">
                Total
              </span>

              <span className="text-lg font-bold">
                ₹{total.toFixed(2)}
              </span>
            </div>

            <Link
              href="/checkout"
              className="mt-6 block rounded-lg bg-black px-6 py-3 text-center font-semibold text-white"
            >
              Proceed to Checkout
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}