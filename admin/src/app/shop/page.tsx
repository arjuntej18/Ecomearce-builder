"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  brand: string | null;
  description: string | null;
  main_image_url: string | null;
  base_price: number;
  sale_price: number | null;
  is_featured: boolean;
  is_active: boolean;
};

type Variant = {
  id: string;
  product_id: string;
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

type EditVariant = {
  id: string;
  sku: string;
  size: string;
  color: string;
  price: string;
};

type EditForm = {
  name: string;
  category_id: string;
  description: string;
  brand: string;
  base_price: string;
  sale_price: string;
  main_image_url: string;
  is_featured: boolean;
  is_active: boolean;
};

export default function ShopPreviewPage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [variants, setVariants] =
    useState<Variant[]>([]);

  const [inventory, setInventory] =
    useState<Inventory[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [savingId, setSavingId] =
    useState<string | null>(null);

  const [editForm, setEditForm] =
    useState<EditForm | null>(null);

  const [editVariants, setEditVariants] =
    useState<EditVariant[]>([]);
  const [discountId, setDiscountId] =
  useState<string | null>(null);

const [discountPercent, setDiscountPercent] =
  useState("");

const [savingDiscountId, setSavingDiscountId] =
  useState<string | null>(null);
  async function loadShop() {
    setLoading(true);
    setError("");

    try {
      const [
        productsResult,
        categoriesResult,
      ] = await Promise.all([
        supabase
          .from("products")
          .select(
            `
            id,
            name,
            slug,
            category_id,
            brand,
            description,
            main_image_url,
            base_price,
            sale_price,
            is_featured,
            is_active
            `
          )
          .eq("is_active", true)
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("categories")
          .select(
            "id, name, slug"
          )
          .order("name", {
            ascending: true,
          }),
      ]);

      if (productsResult.error) {
        console.error(
          productsResult.error
        );

        setError(
          "Unable to load products."
        );

        return;
      }

      const loadedProducts =
        (productsResult.data ??
          []) as Product[];

      const loadedCategories =
        (categoriesResult.data ??
          []) as Category[];

      setProducts(
        loadedProducts
      );

      setCategories(
        loadedCategories
      );

      if (!loadedProducts.length) {
        setVariants([]);
        setInventory([]);
        return;
      }

      const productIds =
        loadedProducts.map(
          (product) =>
            product.id
        );

      const {
        data: variantData,
        error: variantError,
      } = await supabase
        .from("product_variants")
        .select(
  `
  id,
  product_id,
  sku,
  size,
  color,
  price,
  original_price,
  discount_percent,
  is_active
  `
)
        .in(
          "product_id",
          productIds
        )
        .eq(
          "is_active",
          true
        );

      if (variantError) {
        console.error(
          variantError
        );

        setError(
          "Unable to load product options."
        );

        return;
      }

      const loadedVariants =
        (variantData ??
          []) as Variant[];

      setVariants(
        loadedVariants
      );

      if (!loadedVariants.length) {
        setInventory([]);
        return;
      }

      const variantIds =
        loadedVariants.map(
          (variant) =>
            variant.id
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
      } else {
        setInventory(
          (inventoryData ??
            []) as Inventory[]
        );
      }
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
    const productVariants =
      getProductVariants(
        product.id
      );

    const prices =
      productVariants
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

    if (prices.length) {
      return Math.min(
        ...prices
      );
    }

    if (
      product.sale_price !=
      null
    ) {
      return Number(
        product.sale_price
      );
    }

    return Number(
      product.base_price
    );
  }

  function getProductStock(
    productId: string
  ) {
    const variantIds =
      getProductVariants(
        productId
      ).map(
        (variant) =>
          variant.id
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

  function startEditing(
    product: Product
  ) {
    setEditingId(product.id);

    setEditForm({
      name: product.name,
      category_id:
        product.category_id ??
        "",
      description:
        product.description ??
        "",
      brand:
        product.brand ??
        "",
      base_price:
        String(
          product.base_price
        ),
      sale_price:
        product.sale_price ==
        null
          ? ""
          : String(
              product.sale_price
            ),
      main_image_url:
        product.main_image_url ??
        "",
      is_featured:
        Boolean(
          product.is_featured
        ),
      is_active:
        Boolean(
          product.is_active
        ),
    });

    const productVariants =
      getProductVariants(
        product.id
      );

    setEditVariants(
      productVariants.map(
        (variant) => ({
          id: variant.id,
          sku: variant.sku,
          size:
            variant.size ??
            "",
          color:
            variant.color ??
            "",
          price:
            variant.price ==
            null
              ? ""
              : String(
                  variant.price
                ),
        })
      )
    );

    setError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditForm(null);
    setEditVariants([]);
    setError("");
  }

  function updateEditVariantPrice(
    variantId: string,
    value: string
  ) {
    setEditVariants(
      (current) =>
        current.map(
          (variant) =>
            variant.id ===
            variantId
              ? {
                  ...variant,
                  price: value,
                }
              : variant
        )
    );
  }

  async function saveProduct(
    productId: string
  ) {
    if (!editForm) {
      return;
    }

    const basePrice = Number(
      editForm.base_price
    );

    if (
      !Number.isFinite(
        basePrice
      ) ||
      basePrice <= 0
    ) {
      setError(
        "Base price must be greater than zero."
      );

      return;
    }

    let salePrice:
      | number
      | null = null;

    if (
      editForm.sale_price.trim() !==
      ""
    ) {
      salePrice = Number(
        editForm.sale_price
      );

      if (
        !Number.isFinite(
          salePrice
        ) ||
        salePrice < 0
      ) {
        setError(
          "Sale price is invalid."
        );

        return;
      }
    }

    const variantUpdates =
      editVariants.map(
        (variant) => ({
          id: variant.id,
          price: Number(
            variant.price
          ),
        })
      );

    for (const variant of
      variantUpdates) {
      if (
        !Number.isFinite(
          variant.price
        ) ||
        variant.price <= 0
      ) {
        setError(
          "Every variant price must be greater than zero."
        );

        return;
      }
    }

    setSavingId(productId);
    setError("");

    try {
      const existingProduct =
        products.find(
          (product) =>
            product.id ===
            productId
        );

      if (!existingProduct) {
        setError(
          "Product not found."
        );

        return;
      }

      const response =
        await fetch(
          `/api/admin/products/${productId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              name:
                editForm.name,
              slug:
                existingProduct.slug,
              description:
                editForm.description,
              brand:
                editForm.brand,
              base_price:
                basePrice,
              sale_price:
                salePrice,
              category_id:
                editForm.category_id ||
                null,
              main_image_url:
                editForm.main_image_url,
              is_featured:
                editForm.is_featured,
              is_active:
                editForm.is_active,
              variants:
                variantUpdates,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Unable to save product."
        );

        return;
      }

      setProducts(
        (current) =>
          current.map(
            (product) =>
              product.id ===
              productId
                ? {
                    ...product,
                    ...result.product,
                  }
                : product
          )
      );

      if (
        Array.isArray(
          result.variants
        )
      ) {
        setVariants(
          (current) =>
            current.map(
              (variant) => {
                const updated =
                  result.variants.find(
                    (
                      item: Variant
                    ) =>
                      item.id ===
                      variant.id
                  );

                return updated
                  ? {
                      ...variant,
                      ...updated,
                    }
                  : variant;
              }
            )
        );
      }

      setEditingId(null);
      setEditForm(null);
      setEditVariants([]);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to save product."
      );
    } finally {
      setSavingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold">
              Shop Preview
            </h1>

            <p className="mt-1 text-gray-500">
              Preview the customer shop and edit products directly.
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

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-gray-500">
            Loading shop...
          </div>
        ) : products.length ===
          0 ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
            No active products found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map(
              (product) => {
                const price =
                  getProductPrice(
                    product
                  );

                const availability =
                  getAvailability(
                    product.id
                  );

                const editing =
                  editingId ===
                  product.id;

                const saving =
                  savingId ===
                  product.id;

                const categoryName =
                  categories.find(
                    (category) =>
                      category.id ===
                      product.category_id
                  )?.name ||
                  "Uncategorized";

                const productVariants =
                  getProductVariants(
                    product.id
                  );
                function startDiscount(productId: string) {
  setDiscountId(productId);
  setDiscountPercent("");
  setError("");
}

function cancelDiscount() {
  setDiscountId(null);
  setDiscountPercent("");
}

async function saveDiscount(
  productId: string
) {
  const percent = Number(
    discountPercent
  );

  if (
    !Number.isFinite(percent) ||
    percent <= 0 ||
    percent >= 100
  ) {
    setError(
      "Discount must be between 1% and 99%."
    );
    return;
  }

  setSavingDiscountId(
    productId
  );
  setError("");

  try {
    const response =
      await fetch(
        `/api/admin/products/${productId}/discount`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            discount_percent:
              percent,
          }),
        }
      );

    const result =
      await response.json();

    if (!response.ok) {
      setError(
        result.error ||
          "Unable to apply discount."
      );
      return;
    }

    if (
      Array.isArray(
        result.variants
      )
    ) {
      setVariants(
        (current) =>
          current.map(
            (variant) => {
              const updated =
                result.variants.find(
                  (
                    item: Variant
                  ) =>
                    item.id ===
                    variant.id
                );

              return updated
                ? {
                    ...variant,
                    ...updated,
                  }
                : variant;
            }
          )
      );
    }

    setDiscountId(null);
    setDiscountPercent("");
  } catch (error) {
    console.error(error);

    setError(
      "Unable to apply discount."
    );
  } finally {
    setSavingDiscountId(
      null
    );
  }
}
                return (
                  <div
                    key={product.id}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
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
                          className="aspect-square w-full object-cover"
                        />
                      ) : (
                        <div className="flex aspect-square items-center justify-center text-sm text-gray-500">
                          No image
                        </div>
                      )}
                    </div>

                    {!editing ? (
                      <>
                        <div className="mt-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            {categoryName}
                          </p>

                          <h2 className="mt-1 font-semibold text-gray-900">
                            {product.name}
                          </h2>

                          {product.brand && (
                            <p className="mt-1 text-xs text-gray-500">
                              {product.brand}
                            </p>
                          )}

                          <div className="mt-3">
  {(() => {
    const discountedVariant =
      productVariants.find(
        (variant) =>
          Number(
            variant.discount_percent ?? 0
          ) > 0 &&
          variant.original_price != null
      );

    const discountPercent =
      Number(
        discountedVariant?.discount_percent ?? 0
      );

    const originalPrice =
      Number(
        discountedVariant?.original_price ?? price
      );

    const currentPrice =
      Number(
        discountedVariant?.price ?? price
      );

    if (
      discountPercent > 0 &&
      originalPrice > currentPrice
    ) {
      return (
        <>
          <p className="text-sm text-gray-500 line-through">
            ₹{originalPrice.toFixed(2)}
          </p>

          <p className="text-lg font-bold text-gray-900">
            ₹{currentPrice.toFixed(2)}
          </p>

          <p className="mt-1 text-sm font-bold text-green-600">
            {discountPercent}% OFF
          </p>
        </>
      );
    }

    return (
      <p className="text-lg font-bold text-gray-900">
        ₹{price.toFixed(2)}
      </p>
    );
  })()}
</div>

                          <p className="mt-1 text-sm font-medium text-gray-700">
                            {
                              availability
                            }
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {
                              productVariants.length
                            }{" "}
                            option
                            {productVariants.length ===
                            1
                              ? ""
                              : "s"}
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-4">
  <button
    type="button"
    onClick={() =>
      startEditing(product)
    }
    className="rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800"
  >
    Edit
  </button>

  <Link
    href={`http://localhost:3001/product/${product.slug}`}
    target="_blank"
    className="rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-900 hover:bg-gray-50"
  >
    View
  </Link>

  <button
    type="button"
    onClick={() =>
      startDiscount(product.id)
    }
    className="rounded-lg border border-green-600 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
  >
    Discount
  </button>
</div>

{discountId === product.id && (
  <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
    <label className="mb-2 block text-xs font-semibold text-gray-700">
      Discount percentage
    </label>

    <div className="flex items-center gap-2">
      <input
        type="number"
        min="1"
        max="99"
        step="1"
        value={discountPercent}
        onChange={(event) =>
          setDiscountPercent(
            event.target.value
          )
        }
        placeholder="10"
        className="w-20 rounded-lg border border-gray-300 bg-white p-2 text-sm"
      />

      <span className="text-sm text-gray-700">
        %
      </span>
    </div>

    <div className="mt-3 flex gap-2">
      <button
        type="button"
        disabled={
          savingDiscountId ===
          product.id
        }
        onClick={() =>
          saveDiscount(
            product.id
          )
        }
        className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:bg-gray-400"
      >
        {savingDiscountId ===
        product.id
          ? "Applying..."
          : "Apply"}
      </button>

      <button
        type="button"
        disabled={
          savingDiscountId ===
          product.id
        }
        onClick={
          cancelDiscount
        }
        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700"
      >
        Cancel
      </button>
    </div>
  </div>
)}
                      </>
                    ) : (
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-gray-600">
                            Name
                          </label>

                          <input
                            value={
                              editForm?.name ??
                              ""
                            }
                            onChange={(
                              event
                            ) =>
                              setEditForm(
                                (prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        name:
                                          event
                                            .target
                                            .value,
                                      }
                                    : prev
                              )
                            }
                            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-semibold text-gray-600">
                            Category
                          </label>

                          <select
                            value={
                              editForm?.category_id ??
                              ""
                            }
                            onChange={(
                              event
                            ) =>
                              setEditForm(
                                (prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        category_id:
                                          event
                                            .target
                                            .value,
                                      }
                                    : prev
                              )
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm"
                          >
                            <option value="">
                              Uncategorized
                            </option>

                            {categories.map(
                              (
                                category
                              ) => (
                                <option
                                  key={
                                    category.id
                                  }
                                  value={
                                    category.id
                                  }
                                >
                                  {
                                    category.name
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        {/* Variant prices */}
                        {editVariants.length >
                          0 && (
                          <div>
                            <label className="mb-2 block text-xs font-semibold text-gray-600">
                              Variant Prices
                            </label>

                            <div className="space-y-2">
                              {editVariants.map(
                                (
                                  variant
                                ) => (
                                  <div
                                    key={
                                      variant.id
                                    }
                                    className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                                  >
                                    <div className="mb-2 text-xs text-gray-500">
                                      {[
                                        variant.size,
                                        variant.color,
                                      ]
                                        .filter(
                                          Boolean
                                        )
                                        .join(
                                          " / "
                                        ) ||
                                        variant.sku}
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-700">
                                        ₹
                                      </span>

                                      <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={
                                          variant.price
                                        }
                                        onChange={(
                                          event
                                        ) =>
                                          updateEditVariantPrice(
                                            variant.id,
                                            event
                                              .target
                                              .value
                                          )
                                        }
                                        className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900"
                                      />
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="mb-1 block text-xs font-semibold text-gray-600">
                            Base Price
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              editForm?.base_price ??
                              ""
                            }
                            onChange={(
                              event
                            ) =>
                              setEditForm(
                                (prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        base_price:
                                          event
                                            .target
                                            .value,
                                      }
                                    : prev
                              )
                            }
                            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-semibold text-gray-600">
                            Sale Price
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              editForm?.sale_price ??
                              ""
                            }
                            onChange={(
                              event
                            ) =>
                              setEditForm(
                                (prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        sale_price:
                                          event
                                            .target
                                            .value,
                                      }
                                    : prev
                              )
                            }
                            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-semibold text-gray-600">
                            Brand
                          </label>

                          <input
                            value={
                              editForm?.brand ??
                              ""
                            }
                            onChange={(
                              event
                            ) =>
                              setEditForm(
                                (prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        brand:
                                          event
                                            .target
                                            .value,
                                      }
                                    : prev
                              )
                            }
                            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-semibold text-gray-600">
                            Description
                          </label>

                          <textarea
                            rows={3}
                            value={
                              editForm?.description ??
                              ""
                            }
                            onChange={(
                              event
                            ) =>
                              setEditForm(
                                (prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        description:
                                          event
                                            .target
                                            .value,
                                      }
                                    : prev
                              )
                            }
                            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-semibold text-gray-600">
                            Image URL
                          </label>

                          <input
                            type="url"
                            value={
                              editForm?.main_image_url ??
                              ""
                            }
                            onChange={(
                              event
                            ) =>
                              setEditForm(
                                (prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        main_image_url:
                                          event
                                            .target
                                            .value,
                                      }
                                    : prev
                              )
                            }
                            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                          />
                        </div>

                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={
                                editForm?.is_featured ??
                                false
                              }
                              onChange={(
                                event
                              ) =>
                                setEditForm(
                                  (prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          is_featured:
                                            event
                                              .target
                                              .checked,
                                        }
                                      : prev
                                )
                              }
                            />
                            Featured
                          </label>

                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={
                                editForm?.is_active ??
                                true
                              }
                              onChange={(
                                event
                              ) =>
                                setEditForm(
                                  (prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          is_active:
                                            event
                                              .target
                                              .checked,
                                        }
                                      : prev
                                )
                              }
                            />
                            Active
                          </label>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={
                              saving
                            }
                            onClick={() =>
                              saveProduct(
                                product.id
                              )
                            }
                            className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:bg-gray-400"
                          >
                            {saving
                              ? "Saving..."
                              : "Save"}
                          </button>

                          <button
                            type="button"
                            disabled={
                              saving
                            }
                            onClick={
                              cancelEditing
                            }
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}

        <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          Product details and variant prices can be edited here. Stock remains managed in Admin → Inventory.
        </div>
      </div>
    </main>
  );
}