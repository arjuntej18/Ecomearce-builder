"use client";

import { useEffect, useMemo, useState } from "react";



type Product = {
  id: string;
  name: string;
  slug: string;
};

type Variant = {
  id: string;
  product_id: string;
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

type InventoryRow = {
  variantId: string;
  productName: string;
  sku: string;
  option: string;
  price: number;
  quantity: number;
};

export default function InventoryPage() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] =
    useState<string | null>(null);
  const [stockValues, setStockValues] =
    useState<Record<string, string>>({});
  const [error, setError] = useState("");

  async function loadInventory() {
  setLoading(true);
  setError("");

  try {
    const response = await fetch(
      "/api/admin/products",
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const result = await response.json();

    if (!response.ok) {
      setError(
        result.error ||
          "Unable to load inventory."
      );
      return;
    }

    const products =
      Array.isArray(result.products)
        ? result.products
        : [];

    const variants =
      Array.isArray(result.variants)
        ? result.variants
        : [];

    const inventory =
      Array.isArray(result.inventory)
        ? result.inventory
        : [];

    const activeVariants =
      variants.filter(
        (variant: Variant) =>
          variant.is_active
      );

    if (!activeVariants.length) {
      setRows([]);
      setStockValues({});
      return;
    }

    const productMap = new Map(
      products.map(
        (product: Product) => [
          product.id,
          product.name,
        ]
      )
    );

    const inventoryMap = new Map(
      inventory.map(
        (item: Inventory) => [
          item.variant_id,
          Number(
            item.quantity ?? 0
          ),
        ]
      )
    );

    const combinedRows: InventoryRow[] =
      activeVariants.map(
        (variant: Variant) => ({
          variantId: variant.id,

          productName:
            productMap.get(
              variant.product_id
            ) || "Unknown product",

          sku: variant.sku,

          option: [
            variant.size,
            variant.color,
          ]
            .filter(Boolean)
            .join(" / ") || "—",

          price: Number(
            variant.price ?? 0
          ),

          quantity:
            inventoryMap.get(
              variant.id
            ) ?? 0,
        })
      );

    setRows(combinedRows);

    const values: Record<
      string,
      string
    > = {};

    combinedRows.forEach((row: InventoryRow) => {
  values[row.variantId] =
    String(row.quantity);
});

    setStockValues(values);
  } catch (error) {
    console.error(error);
    setError(
      "Unable to load inventory."
    );
  } finally {
    setLoading(false);
  }
}
  useEffect(() => {
    loadInventory();
  }, []);

  const filteredRows = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return rows;
    }

    return rows.filter(
      (row) =>
        row.productName
          .toLowerCase()
          .includes(query) ||
        row.sku
          .toLowerCase()
          .includes(query) ||
        row.option
          .toLowerCase()
          .includes(query)
    );
  }, [rows, search]);

  const totalStock = rows.reduce(
    (sum, row) =>
      sum + row.quantity,
    0
  );

  const lowStockCount = rows.filter(
    (row) =>
      row.quantity > 0 &&
      row.quantity <= 5
  ).length;

  const outOfStockCount =
    rows.filter(
      (row) => row.quantity === 0
    ).length;

  function updateStockInput(
    variantId: string,
    value: string
  ) {
    if (!/^\d*$/.test(value)) {
      return;
    }

    setStockValues((prev) => ({
      ...prev,
      [variantId]: value,
    }));
  }

  function adjustStock(
    variantId: string,
    amount: number
  ) {
    const current = Number(
      stockValues[variantId] ?? 0
    );

    const next = Math.max(
      0,
      current + amount
    );

    setStockValues((prev) => ({
      ...prev,
      [variantId]: String(next),
    }));
  }

  async function saveStock(
    row: InventoryRow
  ) {
    const quantity = Number(
      stockValues[row.variantId]
    );

    if (
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      setError(
        `Enter a valid stock quantity for ${row.sku}.`
      );
      return;
    }

    setSavingId(row.variantId);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/inventory",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            variantId:
              row.variantId,
            quantity,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Unable to update stock."
        );
        return;
      }

      setRows((prev) =>
  prev.map((item) =>
    item.variantId === row.variantId
      ? {
          ...item,
          quantity,
        }
      : item
  )
);

setStockValues((prev) => ({
  ...prev,
  [row.variantId]: String(quantity),
}));
    } catch (error) {
      console.error(error);

      setError(
        "Unable to update stock."
      );
    } finally {
      setSavingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Inventory
          </h1>

          <p className="mt-1 text-gray-500">
            View and manage product stock.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Variants
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {rows.length}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Stock
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {totalStock}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Low Stock
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-600">
              {lowStockCount}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Out of Stock
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {outOfStockCount}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search product, SKU or size/color..."
            className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black"
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-gray-500">
              Loading inventory...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Product
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Option
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      SKU
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Price
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Stock
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.map((row) => {
                    const currentValue =
                      stockValues[
                        row.variantId
                      ] ??
                      String(
                        row.quantity
                      );

                    const saving =
                      savingId ===
                      row.variantId;

                    const currentNumber =
                      Number(
                        currentValue || 0
                      );

                    return (
                      <tr
                        key={
                          row.variantId
                        }
                        className="border-b last:border-b-0"
                      >
                        <td className="px-6 py-5">
                          <div className="font-semibold text-gray-900">
                            {row.productName}
                          </div>
                        </td>

                        <td className="px-6 py-5 text-gray-700">
                          {row.option}
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-500">
                          {row.sku}
                        </td>

                        <td className="px-6 py-5 font-medium text-gray-900">
                          ₹
                          {row.price.toFixed(
                            2
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                adjustStock(
                                  row.variantId,
                                  -1
                                )
                              }
                              disabled={
                                saving ||
                                currentNumber <=
                                  0
                              }
                              className="h-9 w-9 rounded-lg border border-gray-300 bg-white text-lg font-semibold text-gray-900 hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              −
                            </button>

                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={
                                currentValue
                              }
                              onChange={(
                                event
                              ) =>
                                updateStockInput(
                                  row.variantId,
                                  event
                                    .target
                                    .value
                                )
                              }
                              className="w-20 rounded-lg border border-gray-300 p-2 text-center font-semibold text-gray-900"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                adjustStock(
                                  row.variantId,
                                  1
                                )
                              }
                              disabled={
                                saving
                              }
                              className="h-9 w-9 rounded-lg border border-gray-300 bg-white text-lg font-semibold text-gray-900 hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>

                          {currentNumber ===
                            0 && (
                            <div className="mt-1 text-xs font-medium text-red-600">
                              Out of stock
                            </div>
                          )}

                          {currentNumber >
                            0 &&
                            currentNumber <=
                              5 && (
                              <div className="mt-1 text-xs font-medium text-orange-600">
                                Low stock
                              </div>
                            )}
                        </td>

                        <td className="px-6 py-5">
                          <button
                            type="button"
                            onClick={() =>
                              saveStock(
                                row
                              )
                            }
                            disabled={
                              saving ||
                              currentNumber ===
                                row.quantity
                            }
                            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                          >
                            {saving
                              ? "Saving..."
                              : "Save"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {!filteredRows.length && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No inventory found.
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