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

              const itemTotal =
                Number(variant.price) * Number(item.quantity);

              return (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-xl border bg-white p-4"
                >
                  <div className="h-24 w-24 overflow-hidden rounded-lg bg-gray-100">
                    {(variant.image_url ||
                      product.main_image_url) && (
                      <img
                        src={
                          variant.image_url ||
                          product.main_image_url ||
                          ""
                        }
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <h2 className="font-semibold text-gray-900">
                      {product.name}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {[variant.color, variant.size]
                        .filter(Boolean)
                        .join(" / ") || "Standard"}
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>

                    <p className="mt-2 font-semibold text-gray-900">
                      ₹{Number(variant.price).toFixed(2)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ₹{itemTotal.toFixed(2)}
                    </p>
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