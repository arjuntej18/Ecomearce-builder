"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  description: string | null;
  main_image_url: string | null;
  base_price: number;
  sale_price: number | null;
};

type Variant = {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  price: number | null;
  is_active: boolean;
};

type Inventory = {
  variant_id: string;
  quantity: number | null;
};

export default function ShopPreviewPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<Variant[]>(
    []
  );
  const [inventory, setInventory] = useState<Inventory[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadShop() {
    setLoading(true);
    setError("");

    try {
      const {
        data: productData,
        error: productError,
      } = await supabase
        .from("products")
        .select(
          "id, name, slug, brand, description, main_image_url, base_price, sale_price"
        )
        .eq("is_active", true)
        .order("created_at", {
          ascending: false,
        });

      if (productError) {
        console.error(productError);
        setError(
          "Unable to load products."
        );
        return;
      }

      const loadedProducts =
        (productData ?? []) as Product[];

      setProducts(loadedProducts);

      if (!loadedProducts.length) {
        setVariants([]);
        setInventory([]);
        return;
      }

      const productIds =
        loadedProducts.map(
          (product) => product.id
        );

      const {
        data: variantData,
        error: variantError,
      } = await supabase
        .from("product_variants")
        .select(
          "id, product_id, size, color, price, is_active"
        )
        .in("product_id", productIds)
        .eq("is_active", true);

      if (variantError) {
        console.error(variantError);
        setError(
          "Unable to load product options."
        );
        return;
      }

      const loadedVariants =
        (variantData ?? []) as Variant[];

      setVariants(loadedVariants);

      if (!loadedVariants.length) {
        setInventory([]);
        return;
      }

      const variantIds =
        loadedVariants.map(
          (variant) => variant.id
        );

      const {
        data: inventoryData,
        error: inventoryError,
      } = await supabase
        .from("inventory")
        .select(
          "variant_id, quantity"
        )
        .in(
          "variant_id",
          variantIds
        );

      if (inventoryError) {
        console.error(
          inventoryError
        );
        setInventory([]);
        return;
      }

      setInventory(
        (inventoryData ?? []) as Inventory[]
      );
    } catch (error) {
      console.error(error);
      setError(
        "Unable to load shop preview."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadShop();
  }, []);

  function getProductVariants(
    productId: string
  ) {
    return variants.filter(
      (variant) =>
        variant.product_id ===
        productId
    );
  }

  function getProductPrice(
    product: Product
  ) {
    const prices =
      getProductVariants(
        product.id
      )
        .map((variant) =>
          Number(variant.price)
        )
        .filter(
          (price) =>
            Number.isFinite(price) &&
            price > 0
        );

    if (!prices.length) {
      return Number(
        product.sale_price ??
          product.base_price ??
          0
      );
    }

    return Math.min(...prices);
  }

  function getProductStock(
    productId: string
  ) {
    const variantIds =
      getProductVariants(
        productId
      ).map(
        (variant) => variant.id
      );

    return inventory
      .filter((item) =>
        variantIds.includes(
          item.variant_id
        )
      )
      .reduce(
        (total, item) =>
          total +
          Number(
            item.quantity ?? 0
          ),
        0
      );
  }

  function getAvailability(
    productId: string
  ) {
    const stock =
      getProductStock(
        productId
      );

    if (stock <= 0) {
      return "Out of Stock";
    }

    if (stock <= 5) {
      return "Only a few left";
    }

    return "In Stock";
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold">
                Shop Preview
              </h1>

              <p className="mt-1 text-gray-500">
                Customer-facing shop preview using live store data.
              </p>
            </div>

            <Link
              href="http://localhost:3001/shop"
              target="_blank"
              className="rounded-lg border-2 border-green-600 bg-green-600 px-5 py-3 text-center font-semibold text-white hover:bg-green-700"
            >
              Open Storefront
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-gray-500">
            Loading shop...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
            No active products found.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => {
              const price =
                getProductPrice(
                  product
                );

              const stock =
                getProductStock(
                  product.id
                );

              const availability =
                getAvailability(
                  product.id
                );

              return (
                <Link
                  key={product.id}
                  href={`http://localhost:3001/product/${product.slug}`}
                  target="_blank"
                  className="group rounded-xl border border-gray-200 bg-white p-4 transition hover:border-black"
                >
                  {/* Image */}
                  <div className="overflow-hidden rounded-lg bg-gray-100">
                    {product.main_image_url ? (
                      <img
                        src={
                          product.main_image_url
                        }
                        alt={
                          product.name
                        }
                        className="aspect-square w-full object-cover transition group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex aspect-square items-center justify-center text-sm text-gray-500">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="mt-4">
                    <h2 className="font-semibold text-gray-900">
                      {product.name}
                    </h2>

                    {product.brand && (
                      <p className="mt-1 text-xs text-gray-500">
                        {product.brand}
                      </p>
                    )}

                    <p className="mt-3 text-lg font-bold text-gray-900">
                      ₹
                      {price.toFixed(
                        2
                      )}
                    </p>

                    <p className="mt-2 text-sm font-medium text-gray-700">
                      {availability}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {getProductVariants(
                        product.id
                      ).length}{" "}
                      option
                      {getProductVariants(
                        product.id
                      ).length === 1
                        ? ""
                        : "s"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Note */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          This preview uses the same products, variant prices and stock data as the storefront.
        </div>
      </div>
    </main>
  );
}