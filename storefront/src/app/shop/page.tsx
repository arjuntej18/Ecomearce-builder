"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Product = {
  id: string;
  name: string;
  slug: string;
  main_image_url: string | null;
  product_variants: {
    price: number;
    is_active: boolean;
  }[];
};

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          slug,
          main_image_url,
          product_variants (
            price,
            is_active
          )
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setProducts([]);
        setLoading(false);
        return;
      }

      setProducts(data ?? []);
      setLoading(false);
    }

    loadProducts();
  }, []);

  if (loading) {
    return <main className="p-10">Loading products...</main>;
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-8 text-3xl font-bold">Shop</h1>

      {products.length === 0 ? (
        <p>No products available yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => {
            const activeVariants =
              product.product_variants?.filter(
                (variant) => variant.is_active
              ) ?? [];

            const prices = activeVariants
              .map((variant) => Number(variant.price))
              .filter((price) => Number.isFinite(price));

            const lowestPrice =
              prices.length > 0
                ? Math.min(...prices)
                : null;

            return (
              <a
                key={product.id}
                href={`/product/${product.slug}`}
                className="rounded-lg border p-4 transition hover:shadow"
              >
                {product.main_image_url && (
                  <img
                    src={product.main_image_url}
                    alt={product.name}
                    className="mb-4 aspect-square w-full rounded object-cover"
                  />
                )}

                <h2 className="font-semibold">
                  {product.name}
                </h2>

                <p className="mt-2 font-medium">
                  {lowestPrice !== null
                    ? `₹${lowestPrice.toFixed(2)}`
                    : "Price unavailable"}
                </p>
              </a>
            );
          })}
        </div>
      )}
    </main>
  );
}