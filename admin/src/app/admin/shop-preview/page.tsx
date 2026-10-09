"use client";

import { useEffect, useMemo, useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type ProductVariant = {
  id: string;
  product_id: string;
  price: number | null;
  size: string | null;
  color: string | null;
  sku: string | null;
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
  category: Category | null;
  is_active?: boolean;
  is_featured?: boolean;
  product_variants: ProductVariant[];
  product_images?: ProductImage[];
};

const PRODUCTS_API = "/api/admin/products";

function getCurrentPrice(product: Product): number | null {
  const prices = (product.product_variants ?? [])
    .filter((variant) => variant.is_active)
    .map((variant) => Number(variant.price))
    .filter(
      (price) => Number.isFinite(price) && price > 0
    );

  return prices.length > 0 ? Math.min(...prices) : null;
}

function getProductImage(product: Product): string | null {
  const galleryImage = product.product_images
    ?.slice()
    .sort((a, b) => a.sort_order - b.sort_order)[0];

  return galleryImage?.image_url ?? product.main_image_url ?? null;
}

export default function ShopPreviewPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [editingPriceId, setEditingPriceId] =
    useState<string | null>(null);

  const [priceInput, setPriceInput] = useState("");

  const [savingPriceId, setSavingPriceId] =
    useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadProducts(showRefreshing = false) {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(PRODUCTS_API, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to load products: ${response.status}`
        );
      }

      const data = await response.json();

      setProducts(data.products ?? []);

      /*
       * The backend may return categories directly.
       * If it does not, categories are also derived from products.
       */
      if (Array.isArray(data.categories)) {
        setCategories(data.categories);
      } else {
        const categoryMap = new Map<string, Category>();

        for (const product of data.products ?? []) {
          if (product.category) {
            categoryMap.set(
              product.category.id,
              product.category
            );
          }
        }

        setCategories(
          Array.from(categoryMap.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
          )
        );
      }
    } catch (err) {
      console.error(
        "Failed to load Shop Preview:",
        err
      );

      setError("Unable to load products.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query) ||
        product.category?.name
          ?.toLowerCase()
          .includes(query);

      const matchesCategory =
        categoryFilter === "all" ||
        product.category_id === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  function startPriceEdit(product: Product) {
    const currentPrice = getCurrentPrice(product);

    setEditingPriceId(product.id);
    setPriceInput(
      currentPrice !== null
        ? currentPrice.toFixed(2)
        : ""
    );

    setMessage("");
    setError("");
  }

  function cancelPriceEdit() {
    setEditingPriceId(null);
    setPriceInput("");
  }

  async function savePrice(product: Product) {
    const newPrice = Number(priceInput);

    if (
      !Number.isFinite(newPrice) ||
      newPrice <= 0
    ) {
      setError("Price must be greater than zero.");
      return;
    }

    setSavingPriceId(product.id);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${PRODUCTS_API}/${product.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            replace_price: newPrice,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to update product price."
        );
      }

      setProducts((current) =>
        current.map((item) => {
          if (item.id !== product.id) {
            return item;
          }

          return {
            ...item,
            product_variants:
              data.variants ??
              item.product_variants,
          };
        })
      );

      setEditingPriceId(null);
      setPriceInput("");

      setMessage(
        `${product.name} price updated successfully.`
      );
    } catch (err) {
      console.error(
        "Failed to update product price:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update product price."
      );
    } finally {
      setSavingPriceId(null);
    }
  }

  function handlePriceKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
    product: Product
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      savePrice(product);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelPriceEdit();
    }
  }

  return (
    <main className="min-h-screen bg-[#f7efe7] text-[#422622]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#a17b4f]">
              Seetha Vastram
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-[#4a2925]">
              Shop Preview
            </h1>

            <p className="mt-2 text-sm text-[#765f52]">
              Quick storefront controls and product
              preview.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadProducts(true)}
            disabled={refreshing}
            className="rounded-lg border border-[#d6c1ae] bg-[#fffaf2] px-4 py-2.5 text-sm font-semibold text-[#4a2925] transition hover:border-[#a17b4f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* Search / Filter */}
        <div className="mb-6 rounded-xl border border-[#e1d2c2] bg-[#fffaf2] p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_240px]">
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search products..."
              className="w-full rounded-lg border border-[#d6c1ae] bg-white px-4 py-3 text-sm text-[#422622] outline-none placeholder:text-[#a08d80] focus:border-[#72263a]"
            />

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value
                )
              }
              className="rounded-lg border border-[#d6c1ae] bg-white px-4 py-3 text-sm text-[#422622] outline-none focus:border-[#72263a]"
            >
              <option value="all">
                All categories
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-5 rounded-lg border border-[#cddcc8] bg-[#f1f7ee] px-4 py-3 text-sm text-[#496047]">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-lg border border-[#e1c4bd] bg-[#fff3f0] px-4 py-3 text-sm text-[#8b3f32]">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-xl border border-[#e1d2c2] bg-[#fffaf2] py-20 text-center text-sm text-[#765f52]">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-xl border border-[#e1d2c2] bg-[#fffaf2] py-20 text-center text-sm text-[#765f52]">
            No products found.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#e1d2c2] bg-[#fffaf2] shadow-sm">

            {/* Desktop table header */}
            <div className="hidden grid-cols-[100px_1.6fr_1fr_190px_100px] gap-4 border-b border-[#e1d2c2] bg-[#f5eadf] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#765f52] md:grid">
              <span>Image</span>
              <span>Product</span>
              <span>Category</span>
              <span>Price</span>
              <span>Status</span>
            </div>

            <div className="divide-y divide-[#e8dcd0]">

              {filteredProducts.map((product) => {
                const currentPrice =
                  getCurrentPrice(product);

                const image =
                  getProductImage(product);

                const activeVariants =
                  product.product_variants?.filter(
                    (variant) =>
                      variant.is_active
                  ) ?? [];

                const isEditing =
                  editingPriceId === product.id;

                const isSaving =
                  savingPriceId === product.id;

                return (
                  <div
                    key={product.id}
                    className="grid gap-4 px-5 py-5 md:grid-cols-[100px_1.6fr_1fr_190px_100px] md:items-center"
                  >

                    {/* Image */}
                    <div className="h-20 w-20 overflow-hidden rounded-lg border border-[#e1d2c2] bg-[#eee3d4]">
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-[#8b776a]">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Product */}
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#422622]">
                        {product.name}
                      </p>

                      <p className="mt-1 truncate text-xs text-[#927e70]">
                        /product/{product.slug}
                      </p>

                      <p className="mt-2 text-xs text-[#927e70]">
                        {activeVariants.length} active{" "}
                        {activeVariants.length === 1
                          ? "variant"
                          : "variants"}
                      </p>
                    </div>

                    {/* Category */}
                    <div className="text-sm text-[#765f52]">
                      <span className="font-semibold md:hidden">
                        Category:{" "}
                      </span>

                      {product.category?.name ??
                        "Uncategorized"}
                    </div>

                    {/* Price */}
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#927e70]">
                        Price
                      </p>

                      {isEditing ? (
                        <div className="flex flex-wrap items-center gap-2">

                          <div className="flex items-center rounded-lg border border-[#a17b4f] bg-white">
                            <span className="pl-3 text-sm text-[#765f52]">
                              ₹
                            </span>

                            <input
                              autoFocus
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={priceInput}
                              onChange={(event) =>
                                setPriceInput(
                                  event.target.value
                                )
                              }
                              onKeyDown={(event) =>
                                handlePriceKeyDown(
                                  event,
                                  product
                                )
                              }
                              className="w-24 rounded-lg bg-transparent px-2 py-2 text-sm font-semibold text-[#422622] outline-none"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              savePrice(product)
                            }
                            disabled={isSaving}
                            className="rounded-lg bg-[#72263a] px-3 py-2 text-xs font-semibold text-white hover:bg-[#5d1e2f] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isSaving
                              ? "Saving..."
                              : "Save"}
                          </button>

                          <button
                            type="button"
                            onClick={
                              cancelPriceEdit
                            }
                            disabled={isSaving}
                            className="rounded-lg border border-[#d6c1ae] px-3 py-2 text-xs font-semibold text-[#4a2925] hover:bg-[#f5eadf]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            startPriceEdit(
                              product
                            )
                          }
                          title="Click to edit price"
                          className="rounded-lg border border-transparent px-2 py-1 text-left text-lg font-bold text-[#72263a] transition hover:border-[#d6c1ae] hover:bg-[#f8efe7]"
                        >
                          {currentPrice !== null
                            ? `₹${currentPrice.toFixed(
                                2
                              )}`
                            : "No price"}
                        </button>
                      )}

                      {!isEditing && (
                        <p className="mt-1 text-[11px] text-[#a08d80]">
                          Click price to edit
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      {product.is_active === false ? (
                        <span className="rounded-full bg-[#f3e1df] px-2.5 py-1 text-[11px] font-semibold text-[#8b3f32]">
                          Inactive
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#e7f0e5] px-2.5 py-1 text-[11px] font-semibold text-[#496047]">
                          Active
                        </span>
                      )}

                      {product.is_featured && (
                        <div className="mt-2">
                          <span className="rounded-full bg-[#f2e5c8] px-2.5 py-1 text-[11px] font-semibold text-[#80602b]">
                            Featured
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer count */}
        {!loading && (
          <div className="mt-5 text-xs text-[#927e70]">
            Showing{" "}
            {filteredProducts.length} of{" "}
            {products.length} products.
          </div>
        )}
      </div>
    </main>
  );
}