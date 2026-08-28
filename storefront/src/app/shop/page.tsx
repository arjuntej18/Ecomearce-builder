"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  main_image_url: string | null;
  product_variants: {
    price: number;
    is_active: boolean;
  }[];
};

export default function ShopPage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadShop() {
      setLoading(true);
      setError("");

      try {
        const [
          categoriesResult,
          productsResult,
        ] = await Promise.all([
          supabase
            .from("categories")
            .select("id, name, slug")
            .order("name", {
              ascending: true,
            }),

          supabase
            .from("products")
            .select(`
              id,
              name,
              slug,
              category_id,
              main_image_url,
              product_variants (
                price,
                is_active
              )
            `)
            .eq("is_active", true)
            .order("created_at", {
              ascending: false,
            }),
        ]);

        if (categoriesResult.error) {
          console.error(
            categoriesResult.error
          );
        }

        if (productsResult.error) {
          console.error(
            productsResult.error
          );

          setError(
            "Unable to load products."
          );

          setProducts([]);
          setCategories([]);
          return;
        }

        setCategories(
          categoriesResult.data ?? []
        );

        setProducts(
          productsResult.data ?? []
        );
      } catch (error) {
        console.error(error);

        setError(
          "Unable to load shop."
        );

        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }

    loadShop();
  }, []);

  const filteredProducts =
    useMemo(() => {
      if (
        selectedCategory ===
        "all"
      ) {
        return products;
      }

      return products.filter(
        (product) =>
          product.category_id ===
          selectedCategory
      );
    }, [
      products,
      selectedCategory,
    ]);

  function getCategoryName(
    categoryId: string | null
  ) {
    if (!categoryId) {
      return "Uncategorized";
    }

    return (
      categories.find(
        (category) =>
          category.id ===
          categoryId
      )?.name ||
      "Uncategorized"
    );
  }

  if (loading) {
    return (
      <main className="p-10">
        Loading products...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Shop
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Browse our products.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              setSelectedCategory(
                "all"
              )
            }
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              selectedCategory ===
              "all"
                ? "bg-black text-white"
                : "border border-gray-300 bg-white text-gray-900 hover:border-black"
            }`}
          >
            All
          </button>

          {categories.map(
            (category) => (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  setSelectedCategory(
                    category.id
                  )
                }
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  selectedCategory ===
                  category.id
                    ? "bg-black text-white"
                    : "border border-gray-300 bg-white text-gray-900 hover:border-black"
                }`}
              >
                {category.name}
              </button>
            )
          )}
        </div>
      )}

      {/* Products */}
      <div className="mt-8">
        {filteredProducts.length ===
        0 ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-10 text-center text-gray-500">
            No products found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map(
              (product) => {
                const activeVariants =
                  product.product_variants?.filter(
                    (variant) =>
                      variant.is_active
                  ) ?? [];

                const prices =
                  activeVariants
                    .map((variant) =>
                      Number(
                        variant.price
                      )
                    )
                    .filter(
                      (price) =>
                        Number.isFinite(
                          price
                        )
                    );

                const lowestPrice =
                  prices.length > 0
                    ? Math.min(
                        ...prices
                      )
                    : null;

                return (
                  <a
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="group rounded-lg border border-gray-200 bg-white p-4 transition hover:border-black hover:shadow-sm"
                  >
                    {product.main_image_url ? (
                      <img
                        src={
                          product.main_image_url
                        }
                        alt={
                          product.name
                        }
                        className="mb-4 aspect-square w-full rounded object-cover transition group-hover:scale-[1.01]"
                      />
                    ) : (
                      <div className="mb-4 flex aspect-square w-full items-center justify-center rounded bg-gray-100 text-sm text-gray-500">
                        No image
                      </div>
                    )}

                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      {getCategoryName(
                        product.category_id
                      )}
                    </p>

                    <h2 className="mt-1 font-semibold text-gray-900">
                      {product.name}
                    </h2>

                    <p className="mt-2 font-medium text-gray-900">
                      {lowestPrice !==
                      null
                        ? `₹${lowestPrice.toFixed(
                            2
                          )}`
                        : "Price unavailable"}
                    </p>
                  </a>
                );
              }
            )}
          </div>
        )}
      </div>
    </main>
  );
}