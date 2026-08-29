"use client";

// Displays the storefront product grid with sale pricing and discount badges.

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ProductVariant = {
  price: number | null;
  original_price: number | null;
  discount_percent: number | null;
  is_active: boolean;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  main_image_url: string | null;
  product_variants: ProductVariant[];
};

export default function ShopPage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadProducts() {
      const {
        data,
        error,
      } = await supabase
        .from("products")
        .select(
          `
          id,
          name,
          slug,
          main_image_url,
          product_variants (
            price,
            original_price,
            discount_percent,
            is_active
          )
          `
        )
        .eq(
          "is_active",
          true
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

      if (error) {
        console.error(error);
        setProducts([]);
        setLoading(false);
        return;
      }

      setProducts(
        (data ?? []) as Product[]
      );

      setLoading(false);
    }

    loadProducts();
  }, []);

  if (loading) {
    return (
      <main className="p-10">
        Loading products...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-8 text-3xl font-bold">
        Shop
      </h1>

      {products.length === 0 ? (
        <p>
          No products available yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map(
            (product) => {
              const activeVariants =
                product.product_variants?.filter(
                  (variant) =>
                    variant.is_active
                ) ?? [];

              const validVariants =
                activeVariants.filter(
                  (variant) =>
                    Number.isFinite(
                      Number(
                        variant.price
                      )
                    ) &&
                    Number(
                      variant.price
                    ) > 0
                );

              const lowestVariant =
                validVariants.length >
                0
                  ? validVariants.reduce(
                      (
                        lowest,
                        current
                      ) =>
                        Number(
                          current.price
                        ) <
                        Number(
                          lowest.price
                        )
                          ? current
                          : lowest
                    )
                  : null;

              const currentPrice =
                lowestVariant
                  ? Number(
                      lowestVariant.price
                    )
                  : null;

              const originalPrice =
                lowestVariant?.original_price !=
                null
                  ? Number(
                      lowestVariant.original_price
                    )
                  : null;

              const discountPercent =
                lowestVariant?.discount_percent !=
                null
                  ? Number(
                      lowestVariant.discount_percent
                    )
                  : 0;

              const hasDiscount =
                originalPrice !== null &&
                currentPrice !== null &&
                originalPrice >
                  currentPrice &&
                discountPercent > 0;

              return (
                <Link
                  key={
                    product.id
                  }
                  href={`/product/${product.slug}`}
                  className="group rounded-lg border border-gray-200 bg-white p-4 transition hover:border-black hover:shadow-sm"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden rounded-lg bg-gray-100">
                    {product.main_image_url ? (
                      <img
                        src={
                          product.main_image_url
                        }
                        alt={
                          product.name
                        }
                        className="aspect-square w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex aspect-square items-center justify-center text-sm text-gray-500">
                        No image
                      </div>
                    )}

                    {hasDiscount && (
                      <span className="absolute left-2 top-2 rounded-md bg-green-600 px-2.5 py-1 text-xs font-bold text-white">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  {/* Product details */}
                  <div className="mt-4">
                    <h2 className="font-semibold text-gray-900">
                      {product.name}
                    </h2>

                    {hasDiscount ? (
  <div className="mt-2 flex items-center gap-2 whitespace-nowrap">
    <span className="text-sm font-medium text-gray-400 line-through">
      ₹{originalPrice!.toFixed(2)}
    </span>

    <span className="text-sm font-bold text-green-600">
      {discountPercent}% OFF
    </span>

    <span className="text-xl font-bold text-gray-900">
      ₹{currentPrice!.toFixed(2)}
    </span>
  </div>
) : (
                      <p className="mt-2 text-lg font-bold text-gray-900">
                        {currentPrice !==
                        null
                          ? `₹${currentPrice.toFixed(
                              2
                            )}`
                          : "Price unavailable"}
                      </p>
                    )}
                  </div>
                </Link>
              );
            }
          )}
        </div>
      )}
    </main>
  );
}