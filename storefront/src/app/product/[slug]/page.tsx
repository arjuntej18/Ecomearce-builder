"use client";

// Product detail page with image gallery, variant selection, pricing and stock status.

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useParams, useRouter } from "next/navigation";

type ProductImage = {
  id: string;
  image_url: string;
  sort_order: number;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  main_image_url: string | null;
  product_images: ProductImage[];
};

type Variant = {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  price: number | null;
  original_price: number | null;
  discount_percent: number | null;
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

  const [selectedImageIndex, setSelectedImageIndex] =
  useState(0);

const [touchStartX, setTouchStartX] =
  useState<number | null>(null);

const [touchStartY, setTouchStartY] =
  useState<number | null>(null);

const [touchMoved, setTouchMoved] =
  useState(false);
  const [loading, setLoading] =
    useState(true);

  const [buying, setBuying] =
    useState(false);

  useEffect(() => {
    async function loadProduct() {
      const supabase =
        createSupabaseBrowserClient();

      const {
        data: productData,
        error: productError,
      } = await supabase
        .from("products")
        .select(
          `
          id,
          name,
          slug,
          description,
          main_image_url,
          product_images (
            id,
            image_url,
            sort_order
          )
        `
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
          "id, sku, size, color, price, original_price, discount_percent, is_active"
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

      const sortedImages =
        (
          productData.product_images ??
          []
        )
          .slice()
          .sort(
            (a, b) =>
              a.sort_order - b.sort_order
          );

      const finalProduct: Product = {
        ...productData,
        product_images:
          sortedImages,
      };

      setProduct(finalProduct);
      setVariants(loadedVariants);
      setInventory(loadedInventory);

      if (loadedVariants.length > 0) {
        setSelectedVariant(
          loadedVariants[0]
        );
      }

      setSelectedImageIndex(0);
      setLoading(false);
    }

    loadProduct();
  }, [slug]);

  function getStock(
    variantId: string
  ) {
    const stockRow =
      inventory.find(
        (item) =>
          item.variant_id ===
          variantId
      );

    return Number(
      stockRow?.quantity ?? 0
    );
  }

  function getStockText(
    variantId: string
  ) {
    const stock =
      getStock(variantId);

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
      selectedVariant.price ==
        null ||
      Number(
        selectedVariant.price
      ) <= 0
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
      <main className="min-h-screen bg-[#faeadf] p-10 text-[#4a2925]">
        Loading product...
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#faeadf] p-10 text-[#4a2925]">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border border-[#e5d7c6] bg-[#fffaf2] p-8">
            <h1 className="text-2xl font-bold">
              Product not found
            </h1>

            <p className="mt-2 text-[#765f52]">
              This product is unavailable
              or no longer active.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const galleryImages =
    product.product_images.length >
    0
      ? product.product_images
      : product.main_image_url
        ? [
            {
              id: "main-image",
              image_url:
                product.main_image_url,
              sort_order: 0,
            },
          ]
        : [];

  const currentImage =
    galleryImages[
      selectedImageIndex
    ]?.image_url ??
    galleryImages[0]?.image_url ??
    null;

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

  function handleTouchStart(
    event: React.TouchEvent<HTMLDivElement>
  ) {
    const touch = event.touches[0];

    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
    setTouchMoved(false);
  }

  function handleTouchMove(
    event: React.TouchEvent<HTMLDivElement>
  ) {
    if (
      touchStartX === null ||
      touchStartY === null ||
      galleryImages.length <= 1
    ) {
      return;
    }

    const touch = event.touches[0];

    const deltaX =
      touch.clientX - touchStartX;

    const deltaY =
      touch.clientY - touchStartY;

    // Only use clearly horizontal gestures for image navigation.
    if (
      Math.abs(deltaX) < 45 ||
      Math.abs(deltaX) <= Math.abs(deltaY)
    ) {
      return;
    }

    if (deltaX < 0) {
      setSelectedImageIndex((current) =>
        current >= galleryImages.length - 1
          ? 0
          : current + 1
      );
    } else {
      setSelectedImageIndex((current) =>
        current <= 0
          ? galleryImages.length - 1
          : current - 1
      );
    }

    // Allow a continued drag to move through multiple images.
    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
    setTouchMoved(true);
  }

  function handleTouchEnd() {
    setTouchStartX(null);
    setTouchStartY(null);
    setTouchMoved(false);
  }

  return (
    <main className="min-h-screen bg-[#faeadf] text-[#4a2925]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-2">

          {/* IMAGE GALLERY */}
          <div>
            <div
              className={`relative overflow-hidden rounded-2xl border border-[#e2d4c5] bg-[#fffaf2] touch-pan-y ${
                touchMoved ? "select-none" : ""
              }`}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  draggable={false}
                  className="aspect-square w-full object-cover select-none transition-opacity duration-150"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center text-[#8b776a]">
                  No image
                </div>
              )}

              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous product image"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedImageIndex((current) =>
                        current <= 0
                          ? galleryImages.length - 1
                          : current - 1
                      );
                    }}
                    className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/45 px-3 py-2 text-lg text-white backdrop-blur-sm transition hover:bg-black/65 md:block"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    aria-label="Next product image"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedImageIndex((current) =>
                        current >= galleryImages.length - 1
                          ? 0
                          : current + 1
                      );
                    }}
                    className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/45 px-3 py-2 text-lg text-white backdrop-blur-sm transition hover:bg-black/65 md:block"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {galleryImages.length >
              1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {galleryImages.map(
                  (
                    image,
                    index
                  ) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() =>
                        setSelectedImageIndex(
                          index
                        )
                      }
                      className={`w-20 min-w-20 overflow-hidden rounded-lg border-2 bg-[#fffaf2] transition ${
                        selectedImageIndex ===
                        index
                          ? "border-[#72263a]"
                          : "border-[#e2d4c5] hover:border-[#b59670]"
                      }`}
                      aria-label={`View image ${
                        index + 1
                      }`}
                    >
                      <img
                        src={
                          image.image_url
                        }
                        alt={`${product.name} ${
                          index + 1
                        }`}
                        className="aspect-square w-full object-cover"
                      />
                    </button>
                  )
                )}
              </div>
            )}

            {galleryImages.length >
              1 && (
              <p className="mt-3 text-center text-xs text-[#8b776a]">
                Image{" "}
                {selectedImageIndex +
                  1}{" "}
                of{" "}
                {galleryImages.length}
              </p>
            )}
          </div>

          {/* DETAILS */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#a17b4f]">
              Setetha Vastram
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-[#4a2925] sm:text-4xl">
              {product.name}
            </h1>

            {/* PRICE */}
            <div className="mt-5">
              {selectedVariant &&
              selectedVariant.original_price !=
                null &&
              Number(
                selectedVariant.discount_percent ??
                  0
              ) > 0 &&
              Number(
                selectedVariant.original_price
              ) >
                Number(
                  selectedVariant.price ??
                    0
                ) ? (
                <div className="flex items-center gap-3">
                  <span className="text-base text-[#9a8b82] line-through">
                    ₹
                    {Number(
                      selectedVariant.original_price
                    ).toFixed(2)}
                  </span>

                  <span className="text-2xl font-bold text-[#72263a]">
                    ₹
                    {selectedPrice?.toFixed(
                      2
                    )}
                  </span>

                  <span className="rounded-md bg-[#eadfcf] px-2 py-1 text-sm font-bold text-[#9b7548]">
                    {Number(
                      selectedVariant.discount_percent
                    ).toFixed(0)}
                    % OFF
                  </span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-[#72263a]">
                  {selectedPrice !== null
                    ? `₹${selectedPrice.toFixed(
                        2
                      )}`
                    : "Select an option"}
                </p>
              )}
            </div>

            {/* DESCRIPTION */}
            {product.description && (
              <p className="mt-6 leading-7 text-[#6d574e]">
                {product.description}
              </p>
            )}

            {/* OPTIONS */}
            {variants.length >
              0 && (
              <section className="mt-8">
                <h2 className="mb-4 text-lg font-semibold text-[#4a2925]">
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
                        .join(
                          " / "
                        );

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
                          key={
                            variant.id
                          }
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
                              ? "border-[#72263a] bg-[#72263a] text-white"
                              : outOfStock
                              ? "border-[#e4ddd5] bg-[#f2ece5] text-[#aaa099]"
                              : "border-[#d8cabb] bg-[#fffaf2] text-[#4a2925] hover:border-[#72263a]"
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
                                ? "text-[#aaa099]"
                                : "text-[#6d574e]"
                            }`}
                          >
                            ₹
                            {Number(
                              variant.price ??
                                0
                            ).toFixed(
                              2
                            )}
                          </div>

                          <div
                            className={`mt-1 text-xs font-medium ${
                              isSelected
                                ? "text-white"
                                : outOfStock
                                ? "text-[#aaa099]"
                                : stock <= 5
                                ? "text-[#8a6c4c]"
                                : "text-[#8b776a]"
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

            {/* SELECTION */}
            <div className="mt-8 rounded-xl border border-[#e2d4c5] bg-[#fffaf2] p-5">
              <h2 className="text-base font-semibold text-[#4a2925]">
                Your selection
              </h2>

              {selectedVariant ? (
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-[#7b665c]">
                      Product
                    </span>

                    <span className="font-medium text-[#4a2925]">
                      {
                        product.name
                      }
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-[#7b665c]">
                      Option
                    </span>

                    <span className="font-medium text-[#4a2925]">
                      {selectedLabel ||
                        selectedVariant.sku}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-[#7b665c]">
                      Code
                    </span>

                    <span className="font-medium text-[#4a2925]">
                      {
                        selectedVariant.sku
                      }
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-[#7b665c]">
                      Availability
                    </span>

                    <span
                      className={`font-semibold ${
                        selectedOutOfStock
                          ? "text-[#8b776a]"
                          : "text-[#72263a]"
                      }`}
                    >
                      {
                        selectedStockText
                      }
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-[#e5d9cc] pt-3">
                    <span className="font-semibold text-[#4a2925]">
                      Price
                    </span>

                    <span className="font-bold text-[#72263a]">
                      ₹
                      {selectedPrice?.toFixed(
                        2
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-[#7b665c]">
                  Select an option before
                  buying.
                </p>
              )}
            </div>

            {/* BUY BUTTON */}
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
              className="mt-6 w-full rounded-xl bg-[#72263a] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#5d1e2f] disabled:cursor-not-allowed disabled:bg-[#b8aaa0]"
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