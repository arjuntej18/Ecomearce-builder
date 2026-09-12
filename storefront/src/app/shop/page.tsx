"use client";

// Displays products with category filtering, discounts and interactive image galleries.

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

type ProductVariant = {
  price: number | null;
  original_price: number | null;
  discount_percent: number | null;
  is_active: boolean;
};

type ProductImage = {
  id: string;
  image_url: string;
  sort_order: number;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  main_image_url: string | null;
  category_id: string | null;
  product_variants: ProductVariant[];
  product_images: ProductImage[];
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type ProductCardProps = {
  product: Product;
};

function ProductCard({ product }: ProductCardProps) {
  const [imageIndex, setImageIndex] = useState(0);

  const galleryImages =
    product.product_images
      ?.slice()
      .sort(
        (a, b) =>
          a.sort_order - b.sort_order
      ) ?? [];

  // Use gallery images when available, otherwise fall back to main_image_url.
  const imageUrls =
    galleryImages.length > 0
      ? galleryImages.map(
          (image) => image.image_url
        )
      : product.main_image_url
        ? [product.main_image_url]
        : [];

  function handleMouseMove(
    event: React.MouseEvent<HTMLDivElement>
  ) {
    if (imageUrls.length <= 1) {
      return;
    }

    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      event.clientX - rect.left;

    const zoneWidth =
      rect.width / imageUrls.length;

    const nextIndex = Math.min(
      imageUrls.length - 1,
      Math.floor(x / zoneWidth)
    );

    setImageIndex(nextIndex);
  }

  function handleTouchEnd() {
    if (imageUrls.length <= 1) {
      return;
    }

    setImageIndex((current) =>
      current >= imageUrls.length - 1
        ? 0
        : current + 1
    );
  }

  const activeVariants =
    product.product_variants?.filter(
      (variant) => variant.is_active
    ) ?? [];

  const validVariants =
    activeVariants.filter(
      (variant) =>
        Number.isFinite(
          Number(variant.price)
        ) &&
        Number(variant.price) > 0
    );

  const lowestVariant =
    validVariants.length > 0
      ? validVariants.reduce(
          (lowest, current) =>
            Number(current.price) <
            Number(lowest.price)
              ? current
              : lowest
        )
      : null;

  const currentPrice = lowestVariant
    ? Number(lowestVariant.price)
    : null;

  const originalPrice =
    lowestVariant?.original_price != null
      ? Number(
          lowestVariant.original_price
        )
      : null;

  const discountPercent =
    lowestVariant?.discount_percent != null
      ? Number(
          lowestVariant.discount_percent
        )
      : 0;

  const hasDiscount =
    originalPrice !== null &&
    currentPrice !== null &&
    originalPrice > currentPrice &&
    discountPercent > 0;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group overflow-hidden rounded-xl border border-[#e4d8ca] bg-[#fffaf2] transition duration-200 hover:-translate-y-0.5 hover:border-[#b59670] hover:shadow-lg"
    >
      {/* Product image */}
      <div
        className="relative overflow-hidden bg-[#eee3d4] touch-pan-y"
        onMouseMove={handleMouseMove}
        onTouchEnd={handleTouchEnd}
      >
        {imageUrls.length > 0 ? (
          <img
            src={imageUrls[imageIndex]}
            alt={product.name}
            className="aspect-square w-full object-cover transition-opacity duration-200"
          />
        ) : (
          <div className="flex aspect-square items-center justify-center text-sm text-[#8b776a]">
            No image
          </div>
        )}

        {/* Image indicators */}
        {imageUrls.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/35 px-2.5 py-1.5 backdrop-blur-sm">
            {imageUrls.map(
              (_, index) => (
                <span
                  key={index}
                  className={`h-1.5 w-1.5 rounded-full transition ${
                    index === imageIndex
                      ? "bg-white"
                      : "bg-white/45"
                  }`}
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Product details */}
      <div className="p-4 sm:p-5">
        <h2 className="truncate font-medium text-[#422622]">
          {product.name}
        </h2>

        {hasDiscount ? (
          <div className="mt-2 flex items-center gap-2 whitespace-nowrap">
            <span className="text-sm text-[#9a8b82] line-through">
              ₹{originalPrice!.toFixed(2)}
            </span>

            <span className="text-sm font-semibold text-[#9b7548]">
              {discountPercent}% OFF
            </span>

            <span className="text-lg font-bold text-[#72263a]">
              ₹{currentPrice!.toFixed(2)}
            </span>
          </div>
        ) : (
          <p className="mt-2 text-lg font-bold text-[#72263a]">
            {currentPrice !== null
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

export default function ShopPage() {
  const supabase =
    createSupabaseBrowserClient();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [activeCategory, setActiveCategory] =
    useState<Category | null>(null);

  const [loading, setLoading] =
    useState(true);
  const [filterOpen, setFilterOpen] =
  useState(false);
useEffect(() => {
  const params = new URLSearchParams(
    window.location.search
  );

  if (params.get("filter") === "open") {
    setFilterOpen(true);
  }
}, []);
const [sortOpen, setSortOpen] =
  useState(false);

const [sortBy, setSortBy] =
  useState<
    "newest" |
    "price-low" |
    "price-high" |
    "discount"
  >("newest");

const [maxPrice, setMaxPrice] =
  useState<number | null>(null);

const [discountOnly, setDiscountOnly] =
  useState(false);
  useEffect(() => {
    async function loadShop() {
      setLoading(true);

      const params =
        new URLSearchParams(
          window.location.search
        );
        setFilterOpen(
  params.get("filter") === "open"
);
      const categorySlug =
        params.get("category");

      let category: Category | null =
        null;

      if (categorySlug) {
        const {
          data: categoryData,
          error: categoryError,
        } = await supabase
          .from("categories")
          .select(
            "id, name, slug"
          )
          .eq(
            "slug",
            categorySlug
          )
          .maybeSingle();

        if (categoryError) {
          console.error(
            categoryError
          );
        }

        category =
          categoryData ?? null;
      }

      setActiveCategory(category);

      let productQuery = supabase
        .from("products")
        .select(
          `
          id,
          name,
          slug,
          main_image_url,
          category_id,
          product_variants (
            price,
            original_price,
            discount_percent,
            is_active
          ),
          product_images (
            id,
            image_url,
            sort_order
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

      if (category) {
        productQuery =
          productQuery.eq(
            "category_id",
            category.id
          );
      }

      const {
        data,
        error,
      } = await productQuery;
      console.log("SHOP PRODUCTS:", data);
      console.log("SHOP PRODUCT ERROR:", error);
      if (error) {
        console.error(error);
        setProducts([]);
      } else {
        setProducts(
          (data ?? []) as Product[]
        );
      }

      setLoading(false);
    }

    loadShop();
  }, []);

    const filteredAndSortedProducts = [...products]
    .filter((product) => {
      const variants =
        product.product_variants?.filter(
          (variant) => variant.is_active
        ) ?? [];

      const prices = variants
        .map((variant) => Number(variant.price))
        .filter(
          (price) =>
            Number.isFinite(price) && price > 0
        );

      const lowestPrice =
        prices.length > 0
          ? Math.min(...prices)
          : null;

      if (
        maxPrice !== null &&
        (lowestPrice === null ||
          lowestPrice > maxPrice)
      ) {
        return false;
      }

      if (discountOnly) {
        const hasDiscount = variants.some(
          (variant) =>
            Number(variant.discount_percent ?? 0) > 0
        );

        if (!hasDiscount) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") {
        const aPrice = Math.min(
          ...(a.product_variants ?? [])
            .filter((v) => v.is_active)
            .map((v) => Number(v.price))
            .filter((p) => Number.isFinite(p) && p > 0)
        );

        const bPrice = Math.min(
          ...(b.product_variants ?? [])
            .filter((v) => v.is_active)
            .map((v) => Number(v.price))
            .filter((p) => Number.isFinite(p) && p > 0)
        );

        return aPrice - bPrice;
      }

      if (sortBy === "price-high") {
        const aPrice = Math.min(
          ...(a.product_variants ?? [])
            .filter((v) => v.is_active)
            .map((v) => Number(v.price))
            .filter((p) => Number.isFinite(p) && p > 0)
        );

        const bPrice = Math.min(
          ...(b.product_variants ?? [])
            .filter((v) => v.is_active)
            .map((v) => Number(v.price))
            .filter((p) => Number.isFinite(p) && p > 0)
        );

        return bPrice - aPrice;
      }

      if (sortBy === "discount") {
        const aDiscount = Math.max(
          ...(a.product_variants ?? [])
            .filter((v) => v.is_active)
            .map((v) =>
              Number(v.discount_percent ?? 0)
            )
        );

        const bDiscount = Math.max(
          ...(b.product_variants ?? [])
            .filter((v) => v.is_active)
            .map((v) =>
              Number(v.discount_percent ?? 0)
            )
        );

        return bDiscount - aDiscount;
      }

      return 0;
    });


  return (
    <main className="min-h-screen bg-[#faeadf]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">

        {/* Page heading */}
<div className="mb-9">
  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#a17b4f]">
    Setetha Vastram
  </p>

  <h1 className="text-3xl font-semibold tracking-tight text-[#4a2925] sm:text-4xl">
    {activeCategory
      ? activeCategory.name
      : "Shop"}
  </h1>

  <div className="mt-4 h-px w-16 bg-[#a17b4f]" />
</div>

{/* Filter + Sort */}
<div className="mb-8 flex items-center justify-between border-y border-[#e2d4c5] py-4">
  <button
  type="button"
  onClick={() => setFilterOpen((open) => !open)}
  className="text-sm font-medium text-[#4a2925] hover:opacity-60"
>
  Filter
</button>

  <button
  type="button"
  onClick={() => setSortOpen((open) => !open)}
  className="text-sm font-medium text-[#4a2925] hover:opacity-60"
>
  Sort
</button>
</div>
{filterOpen && (
  <div className="mb-8 rounded-xl border border-[#e2d4c5] bg-[#fffaf2] p-5">
    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <label className="text-sm font-semibold text-[#4a2925]">
          Maximum Price
        </label>

        <input
          type="number"
          min="0"
          value={maxPrice ?? ""}
          onChange={(event) =>
            setMaxPrice(
              event.target.value
                ? Number(event.target.value)
                : null
            )
          }
          placeholder="Any price"
          className="mt-2 w-full rounded-lg border border-[#d6bda8] bg-white px-4 py-3 text-[#4a2925] outline-none focus:border-[#72263a]"
        />
      </div>

      <label className="flex items-center gap-3 text-sm font-medium text-[#4a2925]">
        <input
          type="checkbox"
          checked={discountOnly}
          onChange={(event) =>
            setDiscountOnly(event.target.checked)
          }
          className="h-4 w-4"
        />
        Only show discounted products
      </label>
    </div>
  </div>
)}
{sortOpen && (
  <div className="mb-8 rounded-xl border border-[#e2d4c5] bg-[#fffaf2] p-4">
    <div className="flex flex-col gap-2">
      {[
        ["newest", "Newest"],
        ["price-low", "Price: Low to High"],
        ["price-high", "Price: High to Low"],
        ["discount", "Biggest Discount"],
      ].map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => {
            setSortBy(
              value as
                | "newest"
                | "price-low"
                | "price-high"
                | "discount"
            );
            setSortOpen(false);
          }}
          className={`rounded-lg px-4 py-3 text-left text-sm font-medium ${
            sortBy === value
              ? "bg-[#72263a] text-white"
              : "text-[#4a2925] hover:bg-[#f3e7dc]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  </div>
)}
{loading ? (
      
          <div className="py-20 text-center text-[#765f52]">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-[#e5d7c6] bg-[#fffaf2] px-6 py-16 text-center">
            <p className="text-[#765f52]">
              No products available in this
              category.
            </p>

            {activeCategory && (
              <Link
                href="/shop"
                className="mt-5 inline-block rounded-md bg-[#72263a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5d1e2f]"
              >
                View all products
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {filteredAndSortedProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}