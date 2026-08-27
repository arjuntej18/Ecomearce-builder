// Product detail page with variant selection, pricing and simple stock status.

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams, useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  main_image_url: string | null;
};

type Variant = {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  price: number | null;
  is_active: boolean;
};

type Inventory = {
  variant_id: string;
  quantity: number | null;
};

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();

  const slug = String(params.slug);

  const [product, setProduct] =
    useState<Product | null>(null);

  const [variants, setVariants] =
    useState<Variant[]>([]);

  const [inventory, setInventory] =
    useState<Inventory[]>([]);

  const [selectedVariant, setSelectedVariant] =
    useState<Variant | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [buying, setBuying] =
    useState(false);

  useEffect(() => {
    async function loadProduct() {
      const {
        data: productData,
        error: productError,
      } = await supabase
        .from("products")
        .select(
          "id, name, slug, description, main_image_url"
        )
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (productError || !productData) {
        console.error(productError);
        setLoading(false);
        return;
      }

      const {
        data: variantData,
        error: variantError,
      } = await supabase
        .from("product_variants")
        .select(
          "id, sku, size, color, price, is_active"
        )
        .eq("product_id", productData.id)
        .eq("is_active", true)
        .order("size", {
          ascending: true,
        });

      if (variantError) {
        console.error(variantError);
      }

      const loadedVariants =
        variantData ?? [];

      const variantIds =
        loadedVariants.map(
          (variant) => variant.id
        );

      let loadedInventory: Inventory[] = [];

      if (variantIds.length > 0) {
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
        } else {
          loadedInventory =
            inventoryData ?? [];
        }
      }

      setProduct(productData);
      setVariants(loadedVariants);
      setInventory(loadedInventory);

      if (loadedVariants.length) {
        setSelectedVariant(
          loadedVariants[0]
        );
      }

      setLoading(false);
    }

    loadProduct();
  }, [slug]);

  function getStock(
    variantId: string
  ) {
    const stockRow = inventory.find(
      (item) =>
        item.variant_id === variantId
    );

    return Number(
      stockRow?.quantity ?? 0
    );
  }

  function getStockText(
    variantId: string
  ) {
    const stock = getStock(
      variantId
    );

    if (stock <= 0) {
      return "Out of Stock";
    }

    if (stock <= 5) {
      return "Only a few left";
    }

    return "In Stock";
  }

  async function handleBuyNow() {
    if (!selectedVariant) {
      alert(
        "Please select a size and color."
      );
      return;
    }

    const stock = getStock(
      selectedVariant.id
    );

    if (stock <= 0) {
      alert(
        "This option is currently out of stock."
      );
      return;
    }

    if (
      selectedVariant.price == null ||
      Number(selectedVariant.price) <= 0
    ) {
      alert(
        "This product has an invalid price."
      );
      return;
    }

    setBuying(true);

    router.push(
      `/checkout?buyVariant=${encodeURIComponent(
        selectedVariant.id
      )}&quantity=1`
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white p-10 text-gray-900">
        Loading product...
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-white p-10 text-gray-900">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border border-gray-200 bg-white p-8">
            <h1 className="text-2xl font-bold">
              Product not found
            </h1>

            <p className="mt-2 text-gray-600">
              This product is unavailable or no longer active.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const selectedPrice =
    selectedVariant?.price != null
      ? Number(
          selectedVariant.price
        )
      : null;

  const selectedLabel =
    selectedVariant
      ? [
          selectedVariant.size,
          selectedVariant.color,
        ]
          .filter(Boolean)
          .join(" / ")
      : "";

  const selectedStock =
    selectedVariant
      ? getStock(
          selectedVariant.id
        )
      : 0;

  const selectedStockText =
    selectedVariant
      ? getStockText(
          selectedVariant.id
        )
      : "";

  const selectedOutOfStock =
    selectedStock <= 0;

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-6xl p-6">
        <div className="grid gap-10 md:grid-cols-2">
          {/* Image */}
          <div>
            {product.main_image_url ? (
              <img
                src={
                  product.main_image_url
                }
                alt={product.name}
                className="w-full rounded-2xl border border-gray-200 object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-gray-500">
                No image
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {product.name}
            </h1>

            <p className="mt-4 text-3xl font-bold text-gray-900">
              {selectedPrice !== null
                ? `₹${selectedPrice.toFixed(
                    2
                  )}`
                : "Select an option"}
            </p>

            {product.description && (
              <p className="mt-5 leading-7 text-gray-700">
                {product.description}
              </p>
            )}

            {/* Options */}
            {variants.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Choose your option
                </h2>

                <div className="flex flex-wrap gap-3">
                  {variants.map(
                    (variant) => {
                      const label = [
                        variant.size,
                        variant.color,
                      ]
                        .filter(Boolean)
                        .join(" / ");

                      const isSelected =
                        selectedVariant?.id ===
                        variant.id;

                      const stock =
                        getStock(
                          variant.id
                        );

                      const outOfStock =
                        stock <= 0;

                      return (
                        <button
                          key={variant.id}
                          type="button"
                          disabled={
                            outOfStock
                          }
                          onClick={() =>
                            setSelectedVariant(
                              variant
                            )
                          }
                          className={`min-w-[120px] rounded-lg border-2 px-4 py-3 text-left transition ${
                            isSelected
                              ? "border-black bg-black text-white"
                              : outOfStock
                              ? "border-gray-200 bg-gray-100 text-gray-400"
                              : "border-gray-300 bg-white text-gray-900 hover:border-black"
                          }`}
                        >
                          <div className="font-semibold">
                            {label ||
                              variant.sku}
                          </div>

                          <div
                            className={`mt-1 text-sm ${
                              isSelected
                                ? "text-white"
                                : outOfStock
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                          >
                            ₹
                            {Number(
                              variant.price ??
                                0
                            ).toFixed(2)}
                          </div>

                          <div
                            className={`mt-1 text-xs font-medium ${
                              isSelected
                                ? "text-white"
                                : outOfStock
                                ? "text-gray-400"
                                : stock <= 5
                                ? "text-gray-600"
                                : "text-gray-500"
                            }`}
                          >
                            {getStockText(
                              variant.id
                            )}
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              </section>
            )}

            {/* Selection */}
            <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-base font-semibold text-gray-900">
                Your selection
              </h2>

              {selectedVariant ? (
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">
                      Product
                    </span>

                    <span className="font-medium text-gray-900">
                      {product.name}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">
                      Option
                    </span>

                    <span className="font-medium text-gray-900">
                      {selectedLabel ||
                        selectedVariant.sku}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">
                      Code
                    </span>

                    <span className="font-medium text-gray-900">
                      {
                        selectedVariant.sku
                      }
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">
                      Availability
                    </span>

                    <span
                      className={`font-semibold ${
                        selectedOutOfStock
                          ? "text-gray-500"
                          : "text-gray-900"
                      }`}
                    >
                      {
                        selectedStockText
                      }
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-gray-200 pt-3">
                    <span className="font-semibold text-gray-900">
                      Price
                    </span>

                    <span className="font-bold text-gray-900">
                      ₹
                      {selectedPrice?.toFixed(
                        2
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-600">
                  Select an option before buying.
                </p>
              )}
            </div>

            {/* Buy button */}
            <button
              type="button"
              onClick={
                handleBuyNow
              }
              disabled={
                buying ||
                !selectedVariant ||
                selectedOutOfStock
              }
              className="mt-6 w-full rounded-xl bg-black px-6 py-4 text-base font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {buying
                ? "Opening checkout..."
                : selectedOutOfStock
                ? "Out of Stock"
                : selectedVariant
                ? `Buy Now — ₹${selectedPrice?.toFixed(
                    2
                  )}`
                : "Select an option"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}