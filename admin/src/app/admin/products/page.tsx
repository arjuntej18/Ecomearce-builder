"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
};

type Inventory = {
  variant_id: string;
  quantity: number | null;
};

type Filter = "all" | "active" | "inactive";

export default function ProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  async function loadProducts() {
    setLoading(true);

    try {
      const { data: productData, error: productError } =
        await supabase
          .from("products")
          .select(
            "id, name, slug, brand, base_price, sale_price, is_active, is_featured"
          )
          .order("created_at", { ascending: false });

      if (productError) {
        console.error(productError);
        setProducts([]);
        return;
      }

      const loadedProducts = (productData ?? []) as Product[];
      setProducts(loadedProducts);

      if (loadedProducts.length === 0) {
        setVariants([]);
        setInventory([]);
        return;
      }

      const productIds = loadedProducts.map(
        (product) => product.id
      );

      const { data: variantData, error: variantError } =
        await supabase
          .from("product_variants")
          .select("id, product_id, price")
          .in("product_id", productIds);

      if (variantError) {
        console.error(variantError);
        setVariants([]);
        setInventory([]);
        return;
      }

      const loadedVariants = (variantData ?? []) as Variant[];
      setVariants(loadedVariants);

      if (loadedVariants.length === 0) {
        setInventory([]);
        return;
      }

      const variantIds = loadedVariants.map(
        (variant) => variant.id
      );

      const {
        data: inventoryData,
        error: inventoryError,
      } = await supabase
        .from("inventory")
        .select("variant_id, quantity")
        .in("variant_id", variantIds);

      if (inventoryError) {
        console.error(inventoryError);
        setInventory([]);
        return;
      }

      setInventory((inventoryData ?? []) as Inventory[]);
    } catch (error) {
      console.error(error);
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

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query) ||
        (product.brand ?? "").toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && product.is_active) ||
        (filter === "inactive" && !product.is_active);

      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  function getProductVariants(productId: string) {
    return variants.filter(
      (variant) => variant.product_id === productId
    );
  }

  function getVariantCount(productId: string) {
    return getProductVariants(productId).length;
  }

  function getStock(productId: string) {
    const productVariantIds = getProductVariants(productId).map(
      (variant) => variant.id
    );

    return inventory
      .filter((item) =>
        productVariantIds.includes(item.variant_id)
      )
      .reduce(
        (total, item) =>
          total + Number(item.quantity ?? 0),
        0
      );
  }

  function getStartingPrice(productId: string) {
    const prices = getProductVariants(productId)
      .map((variant) => Number(variant.price))
      .filter(
        (price) =>
          Number.isFinite(price) && price > 0
      );

    if (!prices.length) {
      return null;
    }

    return Math.min(...prices);
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
              router.push("/admin/products/new")
            }
            className="rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
          >
            + Add Product
          </button>
        </div>

        {/* Search + Filters */}
        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black md:max-w-md"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-lg border px-4 py-3 text-sm font-semibold ${
                filter === "all"
                  ? "border-black bg-black text-white"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
            >
              All
            </button>

            <button
              type="button"
              onClick={() => setFilter("active")}
              className={`rounded-lg border px-4 py-3 text-sm font-semibold ${
                filter === "active"
                  ? "border-black bg-black text-white"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
            >
              Active
            </button>

            <button
              type="button"
              onClick={() => setFilter("inactive")}
              className={`rounded-lg border px-4 py-3 text-sm font-semibold ${
                filter === "inactive"
                  ? "border-black bg-black text-white"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
            >
              Inactive
            </button>
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
                  {filteredProducts.map((product) => {
                    const variantCount = getVariantCount(
                      product.id
                    );

                    const stock = getStock(product.id);

                    const startingPrice =
                      getStartingPrice(product.id);

                    return (
                      <tr
                        key={product.id}
                        className="border-b last:border-b-0"
                      >
                        <td className="px-6 py-5">
                          <div className="font-semibold text-gray-900">
                            {product.name}
                          </div>

                          <div className="mt-1 text-sm text-gray-500">
                            {product.slug}
                          </div>
                        </td>

                        <td className="px-6 py-5 text-gray-700">
                          {product.brand || "—"}
                        </td>

                        <td className="px-6 py-5">
                          {startingPrice !== null ? (
                            <span className="font-semibold text-gray-900">
                              ₹{startingPrice.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">
                              No variant price
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                            {variantCount}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={
                              stock === 0
                                ? "font-semibold text-red-600"
                                : stock <= 5
                                ? "font-semibold text-orange-600"
                                : "font-semibold text-gray-900"
                            }
                          >
                            {stock}
                          </span>

                          {stock <= 5 && (
                            <div className="mt-1 text-xs text-gray-500">
                              {stock === 0
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
                        </td>
                      </tr>
                    );
                  })}

                  {!filteredProducts.length && (
                    <tr>
                      <td
                        colSpan={8}
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