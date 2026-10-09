"use client";

// Admin product list with inline variant-price editing.

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";



type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  base_price: number;
  sale_price: number | null;
  is_active: boolean;
  is_featured: boolean;
};

type Variant = {
  id: string;
  product_id: string;
  price: number | null;
  size: string | null;
  color: string | null;
  sku: string;
};

type Inventory = {
  variant_id: string;
  quantity: number | null;
};

type Filter =
  | "all"
  | "active"
  | "inactive";

export default function ProductsPage() {
  const router = useRouter();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [variants, setVariants] =
    useState<Variant[]>([]);

  const [inventory, setInventory] =
    useState<Inventory[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<Filter>("all");

  const [editingVariantId, setEditingVariantId] =
    useState<string | null>(null);

  const [editingPrice, setEditingPrice] =
    useState("");

  const [savingVariantId, setSavingVariantId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  async function loadProducts() {
  setLoading(true);
  setError("");

  try {
    const response = await fetch("/api/admin/products", {
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      setError(
        result.error || "Unable to load products."
      );
      return;
    }

    setProducts(result.products ?? []);
    setVariants(result.variants ?? []);
    setInventory(result.inventory ?? []);
  } catch (error) {
    console.error(error);

    setError("Unable to load products.");

    setProducts([]);
    setVariants([]);
    setInventory([]);
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return products.filter(
        (product) => {
          const matchesSearch =
            !query ||
            product.name
              .toLowerCase()
              .includes(query) ||
            product.slug
              .toLowerCase()
              .includes(query) ||
            (
              product.brand ??
              ""
            )
              .toLowerCase()
              .includes(query);

          const matchesFilter =
            filter === "all" ||
            (
              filter === "active" &&
              product.is_active
            ) ||
            (
              filter === "inactive" &&
              !product.is_active
            );

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      products,
      search,
      filter,
    ]);

  function getProductVariants(
    productId: string
  ) {
    return variants.filter(
      (variant) =>
        variant.product_id ===
        productId
    );
  }

  function getVariantCount(
    productId: string
  ) {
    return getProductVariants(
      productId
    ).length;
  }

  function getStock(
    productId: string
  ) {
    const productVariantIds =
      getProductVariants(
        productId
      ).map(
        (variant) =>
          variant.id
      );

    return inventory
      .filter((item) =>
        productVariantIds.includes(
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

  function getStartingPrice(
    productId: string
  ) {
    const prices =
      getProductVariants(
        productId
      )
        .map((variant) =>
          Number(
            variant.price
          )
        )
        .filter(
          (price) =>
            Number.isFinite(
              price
            ) &&
            price > 0
        );

    if (!prices.length) {
      return null;
    }

    return Math.min(
      ...prices
    );
  }

  function startPriceEdit(
    variant: Variant
  ) {
    setEditingVariantId(
      variant.id
    );

    setEditingPrice(
      String(
        variant.price ?? ""
      )
    );

    setError("");
  }

  function cancelPriceEdit() {
    setEditingVariantId(null);
    setEditingPrice("");
  }

  async function saveVariantPrice(
    variant: Variant
  ) {
    const price =
      Number(editingPrice);

    if (
      !Number.isFinite(
        price
      ) ||
      price <= 0
    ) {
      setError(
        "Price must be greater than zero."
      );
      return;
    }

    setSavingVariantId(
      variant.id
    );

    setError("");

    try {
      const response =
        await fetch(
          `/api/admin/products/${variant.product_id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              name:
                products.find(
                  (product) =>
                    product.id ===
                    variant.product_id
                )?.name ?? "",

              slug:
                products.find(
                  (product) =>
                    product.id ===
                    variant.product_id
                )?.slug ?? "",

              description:
                products.find(
                  (product) =>
                    product.id ===
                    variant.product_id
                )?.slug ?? "",

              brand:
                products.find(
                  (product) =>
                    product.id ===
                    variant.product_id
                )?.brand ?? "",

              base_price:
                products.find(
                  (product) =>
                    product.id ===
                    variant.product_id
                )?.base_price ?? price,

              sale_price:
                products.find(
                  (product) =>
                    product.id ===
                    variant.product_id
                )?.sale_price ??
                null,

              category_id:
                null,

              main_image_url:
                null,

              is_featured:
                products.find(
                  (product) =>
                    product.id ===
                    variant.product_id
                )?.is_featured ??
                false,

              is_active:
                products.find(
                  (product) =>
                    product.id ===
                    variant.product_id
                )?.is_active ??
                true,

              variants: [
                {
                  id: variant.id,
                  price,
                },
              ],
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Unable to update price."
        );

        return;
      }

      setVariants(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              variant.id
                ? {
                    ...item,
                    price,
                  }
                : item
          )
      );

      setEditingVariantId(null);
      setEditingPrice("");
    } catch (error) {
      console.error(error);

      setError(
        "Unable to update price."
      );
    } finally {
      setSavingVariantId(
        null
      );
    }
  }
    async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Delete "${product.name}"?\n\nThis cannot be undone.`
    );

    if (!confirmed) return;

    setError("");

    try {
      const response = await fetch(
        `/api/admin/products/${product.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Unable to delete product."
        );
        return;
      }

      setProducts((current) =>
        current.filter(
          (item) => item.id !== product.id
        )
      );

      setVariants((current) =>
        current.filter(
          (item) => item.product_id !== product.id
        )
      );
    } catch (error) {
      console.error(error);

      setError(
        "Unable to delete product."
      );
    }
  }
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                Products
              </h1>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                {products.length}
              </span>
            </div>

            <p className="mt-1 text-gray-500">
              Manage products, pricing, stock and availability.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/products/new"
              )
            }
            className="rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
          >
            + Add Product
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Search + Filters */}
        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search products..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black md:max-w-md"
          />

          <div className="flex gap-2">
            {(
              [
                "all",
                "active",
                "inactive",
              ] as Filter[]
            ).map(
              (filterValue) => (
                <button
                  key={
                    filterValue
                  }
                  type="button"
                  onClick={() =>
                    setFilter(
                      filterValue
                    )
                  }
                  className={`rounded-lg border px-4 py-3 text-sm font-semibold capitalize ${
                    filter ===
                    filterValue
                      ? "border-black bg-black text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                >
                  {filterValue}
                </button>
              )
            )}
          </div>
        </div>

        {/* Products table */}
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-gray-500">
              Loading products...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Product
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Brand
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Price
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Variants
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Stock
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Featured
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map(
                    (product) => {
                      const productVariants =
                        getProductVariants(
                          product.id
                        );

                      const variantCount =
                        productVariants.length;

                      const stock =
                        getStock(
                          product.id
                        );

                      const startingPrice =
                        getStartingPrice(
                          product.id
                        );

                      return (
                        <tr
                          key={
                            product.id
                          }
                          className="border-b last:border-b-0"
                        >
                          <td className="px-6 py-5">
                            <div className="font-semibold text-gray-900">
                              {
                                product.name
                              }
                            </div>

                            <div className="mt-1 text-sm text-gray-500">
                              {
                                product.slug
                              }
                            </div>
                          </td>

                          <td className="px-6 py-5 text-gray-700">
                            {
                              product.brand ||
                              "—"
                            }
                          </td>

                          <td className="px-6 py-5">
                            {productVariants.length >
                            0 ? (
                              <div className="space-y-2">
                                {productVariants.map(
                                  (
                                    variant
                                  ) => {
                                    const isEditing =
                                      editingVariantId ===
                                      variant.id;

                                    const isSaving =
                                      savingVariantId ===
                                      variant.id;

                                    const label =
                                      [
                                        variant.size,
                                        variant.color,
                                      ]
                                        .filter(
                                          Boolean
                                        )
                                        .join(
                                          " / "
                                        ) ||
                                      variant.sku;

                                    return (
                                      <div
                                        key={
                                          variant.id
                                        }
                                        className="flex items-center gap-2"
                                      >
                                        <span className="min-w-[90px] text-xs text-gray-500">
                                          {
                                            label
                                          }
                                        </span>

                                        {!isEditing ? (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              startPriceEdit(
                                                variant
                                              )
                                            }
                                            className="rounded px-2 py-1 font-semibold text-gray-900 hover:bg-gray-100 hover:underline"
                                          >
                                            ₹
                                            {Number(
                                              variant.price ??
                                                0
                                            ).toFixed(
                                              2
                                            )}
                                          </button>
                                        ) : (
                                          <>
                                            <input
                                              type="number"
                                              min="0.01"
                                              step="0.01"
                                              value={
                                                editingPrice
                                              }
                                              onChange={(
                                                event
                                              ) =>
                                                setEditingPrice(
                                                  event
                                                    .target
                                                    .value
                                                )
                                              }
                                              className="w-24 rounded border border-gray-300 px-2 py-1 text-sm"
                                              autoFocus
                                            />

                                            <button
                                              type="button"
                                              disabled={
                                                isSaving
                                              }
                                              onClick={() =>
                                                saveVariantPrice(
                                                  variant
                                                )
                                              }
                                              className="rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white disabled:bg-gray-400"
                                            >
                                              {isSaving
                                                ? "..."
                                                : "Save"}
                                            </button>

                                            <button
                                              type="button"
                                              disabled={
                                                isSaving
                                              }
                                              onClick={
                                                cancelPriceEdit
                                              }
                                              className="rounded border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-700"
                                            >
                                              Cancel
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">
                                No variant price
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-5">
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                              {
                                variantCount
                              }
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={
                                stock ===
                                0
                                  ? "font-semibold text-red-600"
                                  : stock <=
                                    5
                                  ? "font-semibold text-orange-600"
                                  : "font-semibold text-gray-900"
                              }
                            >
                              {stock}
                            </span>

                            {stock <=
                              5 && (
                              <div className="mt-1 text-xs text-gray-500">
                                {stock ===
                                0
                                  ? "Out of stock"
                                  : "Low stock"}
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-5">
                            {product.is_featured
                              ? "Yes"
                              : "No"}
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                product.is_active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {product.is_active
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>

                          <td className="px-6 py-5">
  <div className="flex gap-2">
    <button
      type="button"
      onClick={() =>
        router.push(
          `/admin/products/${product.id}`
        )
      }
      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:border-black"
    >
      Edit
    </button>

    <button
      type="button"
      onClick={() =>
        deleteProduct(product)
      }
      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
    >
      Delete
    </button>
  </div>
</td>
                        </tr>
                      );
                    }
                  )}

                  {!filteredProducts.length && (
                    <tr>
                      <td
                        colSpan={
                          8
                        }
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}