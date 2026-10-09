"use client";

import { useEffect, useMemo, useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  category_id: string | null;
  category_name: string | null;

  base_price: number | null;
  selling_price: number | null;
  discounted_price: number | null;

  main_image_url: string | null;

  is_active: boolean;
  is_featured: boolean;
};

type Variant = {
  id: string;
  product_id: string;
  price: number | null;
  original_price: number | null;
  discount_percent: number | null;
  size: string | null;
  color: string | null;
  sku: string;
  is_active: boolean;
};

type Inventory = {
  id: string;
  variant_id: string;
  quantity: number | null;
};

type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
};

type EditVariant = {
  id: string;
  sku: string;
  size: string;
  color: string;
  is_active: boolean;
  stock: string;
};

type EditForm = {
  name: string;
  brand: string;
  description: string;
  category_id: string;

  base_price: string;
  selling_price: string;
  discounted_price: string;

  is_active: boolean;
  is_featured: boolean;
};

function money(value: number | null | undefined) {
  if (
    value == null ||
    !Number.isFinite(Number(value))
  ) {
    return "₹0.00";
  }

  return `₹${Number(value).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}

export default function ShopPreviewPage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [variants, setVariants] =
    useState<Variant[]>([]);

  const [inventory, setInventory] =
    useState<Inventory[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [images, setImages] =
    useState<ProductImage[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<
      "all" | "active" | "inactive"
    >("all");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [editForm, setEditForm] =
    useState<EditForm | null>(null);

  const [editVariants, setEditVariants] =
    useState<EditVariant[]>([]);

  const [discountEnabled, setDiscountEnabled] = useState(false);


  /*
   * -----------------------------
   * LOAD SHOP DATA
   * -----------------------------
   */

  async function loadShop() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/products",
        {
          cache: "no-store",
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Unable to load products."
        );
      }

      setProducts(
        Array.isArray(result.products)
          ? result.products
          : []
      );

      setVariants(
        Array.isArray(result.variants)
          ? result.variants
          : []
      );

      setInventory(
        Array.isArray(result.inventory)
          ? result.inventory
          : []
      );

      setImages(
        Array.isArray(result.images)
          ? result.images
          : []
      );

      setCategories(
        Array.isArray(result.categories)
          ? result.categories
          : []
      );
      return result;
    } catch (err) {
      console.error(err);

      setProducts([]);
      setVariants([]);
      setInventory([]);
      setImages([]);
      setCategories([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load shop preview."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadShop();
  }, []);

  /*
   * -----------------------------
   * PRODUCT HELPERS
   * -----------------------------
   */

  function getProductVariants(
    productId: string
  ) {
    return variants.filter(
      (variant) =>
        variant.product_id ===
        productId
    );
  }

  function getProductImages(
    productId: string
  ) {
    return images
      .filter(
        (image) =>
          image.product_id ===
          productId
      )
      .sort(
        (a, b) =>
          a.sort_order -
          b.sort_order
      );
  }

  function getProductStock(
    productId: string
  ) {
    const variantIds =
      getProductVariants(productId).map(
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
          Number(item.quantity ?? 0),
        0
      );
  }

  function getProductDiscount(
    product: Product
  ) {
    if (
      product.discounted_price ==
        null ||
      product.base_price == null ||
      Number(product.base_price) <= 0
    ) {
      return null;
    }

    const discount =
      ((Number(product.base_price) -
        Number(
          product.discounted_price
        )) /
        Number(product.base_price)) *
      100;

    return Math.round(discount);
  }

  function getCustomerPrice(
    product: Product
  ) {
    if (
      product.discounted_price !=
      null
    ) {
      return Number(
        product.discounted_price
      );
    }

    if (
      product.selling_price !=
      null
    ) {
      return Number(
        product.selling_price
      );
    }

    return Number(
      product.base_price ?? 0
    );
  }

  function getAvailability(
    productId: string
  ) {
    const stock =
      getProductStock(productId);

    if (stock <= 0) {
      return {
        label: "Out of Stock",
        className: "out",
      };
    }

    if (stock <= 5) {
      return {
        label: "Only a few left",
        className: "low",
      };
    }

    return {
      label: "In Stock",
      className: "in",
    };
  }

  /*
   * -----------------------------
   * EDITOR
   * -----------------------------
   */

  function openEditor(
  product: Product,
  sourceVariants: Variant[] = variants,
  sourceInventory: Inventory[] = inventory
) {
    setEditingId(product.id);
    setDiscountEnabled(
  product.discounted_price != null
);

    setEditForm({
      name: product.name ?? "",
      brand: product.brand ?? "",
      description:
        product.description ?? "",
      category_id:
        product.category_id ?? "",

      base_price:
        product.base_price != null
          ? String(product.base_price)
          : "",

      selling_price:
        product.selling_price != null
          ? String(
              product.selling_price
            )
          : product.base_price != null
          ? String(product.base_price)
          : "",

      discounted_price:
        product.discounted_price !=
        null
          ? String(
              product.discounted_price
            )
          : "",

      is_active:
        Boolean(product.is_active),

      is_featured:
        Boolean(product.is_featured),
    });

    const productVariants =
  sourceVariants.filter(
    (variant) =>
      variant.product_id === product.id
  );

    setEditVariants(
      productVariants.map(
        (variant) => ({
          id: variant.id,
          sku: variant.sku ?? "",
          size: variant.size ?? "",
          color: variant.color ?? "",
          is_active:
            Boolean(variant.is_active),

          stock: String(
            sourceInventory.find(
              (item) =>
                item.variant_id ===
                variant.id
            )?.quantity ?? 0
          ),
        })
      )
    );

    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeEditor() {
    setEditingId(null);
    setEditForm(null);
    setEditVariants([]);
    setError("");
    setMessage("");
  }

  /*
   * -----------------------------
   * DISCOUNT
   * -----------------------------
   */

  function hasDiscount() {
  return discountEnabled;
}

function enableDiscount() {
  setDiscountEnabled(true);
  setError("");
  setMessage("");
}

function removeDiscount() {
  if (!editForm) {
    return;
  }

  setDiscountEnabled(false);

  setEditForm({
    ...editForm,
    discounted_price: "",
  });

  setError("");
  setMessage("");
}

  function getLiveDiscount() {
  if (!editForm) {
    return null;
  }

  if (editForm.discounted_price.trim() === "") {
    return null;
  }

  const base = Number(editForm.base_price);
  const discounted = Number(editForm.discounted_price);

  if (
    !Number.isFinite(base) ||
    base <= 0 ||
    !Number.isFinite(discounted) ||
    discounted < 0 ||
    discounted >= base
  ) {
    return null;
  }

  return Math.round(
    ((base - discounted) / base) * 100
  );
}

  function getLiveCustomerPrice() {
    if (!editForm) {
      return 0;
    }

    if (
      editForm.discounted_price.trim() !==
      ""
    ) {
      return Number(
        editForm.discounted_price
      );
    }

    return Number(
      editForm.selling_price
    );
  }

  /*
   * -----------------------------
   * VARIANTS
   * -----------------------------
   */

  function updateVariant(
    variantId: string,
    field: keyof EditVariant,
    value: string | boolean
  ) {
    setEditVariants((current) =>
      current.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              [field]: value,
            }
          : variant
      )
    );
  }

  function addVariant() {
    setEditVariants((current) => [
      ...current,
      {
        id: "",
        sku: "",
        size: "",
        color: "",
        is_active: true,
        stock: "0",
      },
    ]);
  }

  function removeNewVariant(
    index: number
  ) {
    setEditVariants((current) =>
      current.filter(
        (_, currentIndex) =>
          currentIndex !== index
      )
    );
  }

  /*
   * -----------------------------
   * SAVE PRODUCT
   * -----------------------------
   */

  async function saveProduct() {
    if (!editingId || !editForm) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const basePrice = Number(
        editForm.base_price
      );

      const sellingPrice = Number(
        editForm.selling_price
      );

      const discountedPrice =
        editForm.discounted_price.trim() ===
        ""
          ? null
          : Number(
              editForm.discounted_price
            );

      /*
       * BASE PRICE
       */

      if (
        !Number.isFinite(basePrice) ||
        basePrice < 0
      ) {
        setError(
          "Base Price is invalid."
        );
        return;
      }

      /*
       * SELLING PRICE
       */

      if (
        !Number.isFinite(sellingPrice) ||
        sellingPrice < 0
      ) {
        setError(
          "Selling Price is invalid."
        );
        return;
      }

      /*
       * DISCOUNTED PRICE
       */

      if (
        discountedPrice !== null &&
        (!Number.isFinite(
          discountedPrice
        ) ||
          discountedPrice < 0 ||
          discountedPrice >=
            basePrice)
      ) {
        setError(
          "Discounted Price must be lower than Base Price."
        );
        return;
      }

      /*
       * VARIANTS
       */

      const variantsPayload =
        editVariants
          .filter(
            (variant) =>
              Boolean(variant.id)
          )
          .map((variant) => ({
            id: variant.id,

            sku: variant.sku.trim(),

            size:
              variant.size.trim() ||
              null,

            color:
              variant.color.trim() ||
              null,

            is_active:
              variant.is_active,
          }));

      /*
       * INVENTORY
       */

      const inventoryPayload =
        editVariants
          .filter(
            (variant) =>
              Boolean(variant.id)
          )
          .map((variant) => ({
            variant_id: variant.id,

            quantity: Math.max(
              0,
              Number(
                variant.stock
              ) || 0
            ),
          }));

      /*
       * PATCH
       */

      const response = await fetch(
        `/api/admin/products/${editingId}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name:
              editForm.name.trim(),

            description:
              editForm.description.trim() ||
              null,

            brand:
              editForm.brand.trim() ||
              null,

            category_id:
              editForm.category_id ||
              null,

            base_price:
              basePrice,

            selling_price:
              sellingPrice,

            discounted_price:
              discountedPrice,

            is_active:
              editForm.is_active,

            is_featured:
              editForm.is_featured,

            variants:
              variantsPayload,

            inventory:
              inventoryPayload,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Unable to save product."
        );
      }

      setMessage(
        discountedPrice !== null
          ? "Product saved with discount."
          : "Product saved without discount."
      );

      const refreshed = await loadShop();

const updatedProduct =
  Array.isArray(refreshed?.products)
    ? refreshed.products.find(
        (product: Product) =>
          product.id === editingId
      )
    : null;

if (updatedProduct) {
  openEditor(
    updatedProduct,
    Array.isArray(refreshed?.variants)
      ? refreshed.variants
      : [],
    Array.isArray(refreshed?.inventory)
      ? refreshed.inventory
      : []
  );
}
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * -----------------------------
   * FILTERING
   * -----------------------------
   */

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
            (product.brand ?? "")
              .toLowerCase()
              .includes(query);

          const matchesFilter =
            filter === "all" ||
            (filter === "active" &&
              product.is_active) ||
            (filter === "inactive" &&
              !product.is_active);

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

  /*
   * -----------------------------
   * UI
   * -----------------------------
   */

  return (
    <main className="shop-page">
      <style jsx>{`
        .shop-page {
          min-height: 100vh;
          background: #050807;
          color: #f4f7f5;
          padding: 32px;
        }

        .shell {
          max-width: 1500px;
          margin: 0 auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          margin-bottom: 28px;
        }

        .eyebrow {
          color: #63d99b;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        h1 {
          margin: 0;
          font-size: 34px;
          letter-spacing: -0.04em;
        }

        .sub {
          margin-top: 8px;
          color: #89948e;
          font-size: 14px;
        }

        .toolbar {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 22px;
        }

        input,
        textarea,
        select {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #202a25;
          background: #0b100e;
          color: #f4f7f5;
          border-radius: 14px;
          outline: none;
          padding: 12px 14px;
          font: inherit;
        }

        input:focus,
        textarea:focus,
        select:focus {
          border-color: #3c8e68;
          box-shadow:
            0 0 0 3px
            rgba(
              76,
              207,
              141,
              0.08
            );
        }

        textarea {
          min-height: 110px;
          resize: vertical;
        }

        .search {
          max-width: 420px;
        }

        .filter {
          width: auto;
          min-width: 130px;
        }

        .editor {
          background: #090d0b;
          border: 1px solid #1d2822;
          border-radius: 28px;
          padding: 28px;
          margin-bottom: 28px;
          box-shadow:
            0 20px 70px
            rgba(0, 0, 0, 0.25);
        }

        .editor-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 28px;
        }

        .editor-title {
          font-size: 24px;
          font-weight: 700;
        }

        .editor-sub {
          margin-top: 6px;
          color: #7f8c85;
          font-size: 13px;
        }

        .grid {
          display: grid;
          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );
          gap: 18px;
        }

        .full {
          grid-column: 1 / -1;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .label {
          color: #aeb8b3;
          font-size: 12px;
          font-weight: 700;
        }

        /*
         * PRICING
         */

        .pricing {
          display: grid;
          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );
          gap: 14px;
          margin-top: 24px;
        }

        .price-box {
          border: 1px solid #202a25;
          background: #0b100e;
          border-radius: 20px;
          padding: 18px;
        }

        .price-box.discount-active {
          border-color: #376f52;
          background:
            linear-gradient(
              145deg,
              #0d1712,
              #0a100d
            );
        }

        .price-label {
          color: #8c9892;
          font-size: 12px;
          margin-bottom: 9px;
        }

        .price-description {
          color: #5f6b65;
          font-size: 11px;
          margin-top: 7px;
          line-height: 1.4;
        }

        .discount-control {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          min-height: 46px;
        }

        .discount-status {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .discount-status strong {
          font-size: 14px;
          color: #dce7e1;
        }

        .discount-status span {
          font-size: 11px;
          color: #68756e;
        }

        .discount-badge {
          display: inline-flex;
          width: fit-content;
          margin-top: 10px;
          padding: 5px 9px;
          border-radius: 999px;
          background:
            rgba(
              65,
              190,
              123,
              0.12
            );
          color: #6ee0a3;
          font-size: 11px;
          font-weight: 800;
        }

        .live-preview {
          margin-top: 18px;
          padding: 16px 18px;
          border: 1px solid #1f2b25;
          background: #080c0a;
          border-radius: 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
        }

        .live-preview-label {
          color: #77847d;
          font-size: 12px;
        }

        .live-price {
          display: flex;
          align-items: baseline;
          gap: 9px;
        }

        .live-price strong {
          font-size: 24px;
        }

        .live-old {
          color: #606c65;
          text-decoration: line-through;
          font-size: 12px;
        }

        .variants {
          margin-top: 28px;
        }

        .section-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 750;
        }

        .variant-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .variant {
          border: 1px solid #202a25;
          background: #0b100e;
          border-radius: 20px;
          padding: 16px;
        }

        .variant-grid {
          display: grid;
          grid-template-columns:
            1.4fr 1fr 1fr 1fr auto;
          gap: 12px;
          align-items: end;
        }

        .toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 44px;
          color: #b9c2bd;
          font-size: 13px;
        }

        .toggle input {
          width: auto;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 26px;
          padding-top: 20px;
          border-top: 1px solid #1c2521;
        }

        button {
          border: 0;
          border-radius: 14px;
          padding: 11px 16px;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
          transition:
            transform 0.15s ease,
            opacity 0.15s ease;
        }

        button:hover {
          transform: translateY(-1px);
        }

        button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
          transform: none;
        }

        .primary {
          background: #54d38d;
          color: #06100a;
        }

        .secondary {
          background: #121a16;
          color: #dce5df;
          border: 1px solid #26332c;
        }

        .danger {
          background: #321414;
          color: #ff8d8d;
          border: 1px solid #542020;
        }

        .message {
          margin-bottom: 18px;
          padding: 13px 15px;
          border-radius: 14px;
          font-size: 13px;
        }

        .error {
          background: #251111;
          border: 1px solid #4b2222;
          color: #ff9999;
        }

        .success {
          background: #0d2117;
          border: 1px solid #214d35;
          color: #75dda2;
        }

        .products {
          display: grid;
          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );
          gap: 18px;
        }

        .card {
          overflow: hidden;
          background: #090d0b;
          border: 1px solid #1d2822;
          border-radius: 24px;
          transition:
            border-color 0.15s ease,
            transform 0.15s ease;
        }

        .card:hover {
          border-color: #30483b;
          transform: translateY(-2px);
        }

        .image {
          height: 260px;
          background: #0e1411;
          position: relative;
          overflow: hidden;
        }

        .image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .no-image {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #59645e;
          font-size: 13px;
        }

        .featured {
          position: absolute;
          top: 12px;
          left: 12px;
          background: #54d38d;
          color: #06100a;
          border-radius: 999px;
          padding: 6px 9px;
          font-size: 10px;
          font-weight: 800;
        }

        .card-body {
          padding: 18px;
        }

        .category {
          color: #6edca0;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .name {
          font-size: 17px;
          font-weight: 750;
          margin-top: 7px;
        }

        .brand {
          color: #707c75;
          font-size: 12px;
          margin-top: 4px;
        }

        .card-price {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-top: 16px;
        }

        .card-price-main {
          font-size: 20px;
          font-weight: 800;
        }

        .card-price-old {
          color: #5e6963;
          font-size: 12px;
          text-decoration: line-through;
        }

        .stock-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid #1b241f;
        }

        .stock {
          font-size: 12px;
        }

        .stock.in {
          color: #6edca0;
        }

        .stock.low {
          color: #e8c66b;
        }

        .stock.out {
          color: #ed7f7f;
        }

        .card-actions {
          display: flex;
          gap: 8px;
          margin-top: 15px;
        }

        .card-actions button {
          flex: 1;
        }

        .empty {
          border: 1px dashed #26332c;
          border-radius: 20px;
          padding: 50px;
          text-align: center;
          color: #727e77;
          grid-column: 1 / -1;
        }

        .images-preview {
          margin-top: 28px;
        }

        .image-grid {
          display: grid;
          grid-template-columns:
            repeat(
              5,
              minmax(0, 1fr)
            );
          gap: 10px;
        }

        .image-thumb {
          aspect-ratio: 1;
          overflow: hidden;
          border-radius: 14px;
          background: #111713;
          border: 1px solid #202a25;
        }

        .image-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .primary-image {
          border-color: #54d38d;
        }

        @media (max-width: 1100px) {
          .products {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }

          .variant-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }
        }

        @media (max-width: 760px) {
          .shop-page {
            padding: 18px;
          }

          .header {
            flex-direction: column;
            align-items: flex-start;
          }

          .grid,
          .pricing,
          .products {
            grid-template-columns: 1fr;
          }

          .full {
            grid-column: auto;
          }

          .image-grid {
            grid-template-columns:
              repeat(
                3,
                minmax(0, 1fr)
              );
          }

          .live-preview {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="shell">
        <header className="header">
          <div>
            <div className="eyebrow">
              Store Management
            </div>

            <h1>
              Shop Preview
            </h1>

            <div className="sub">
              Manage products, pricing,
              variants and inventory.
            </div>
          </div>
        </header>

        {error && (
          <div className="message error">
            {error}
          </div>
        )}

        {message && (
          <div className="message success">
            {message}
          </div>
        )}

        {editingId &&
          editForm && (
            <section className="editor">
              <div className="editor-head">
                <div>
                  <div className="eyebrow">
                    Product Editor
                  </div>

                  <div className="editor-title">
                    {editForm.name ||
                      "Edit Product"}
                  </div>

                  <div className="editor-sub">
                    Changes are saved to the
                    local PostgreSQL database.
                  </div>
                </div>

                <button
                  className="secondary"
                  onClick={closeEditor}
                  disabled={saving}
                >
                  Close
                </button>
              </div>

              <div className="grid">
                <div className="field">
                  <label className="label">
                    Product Name
                  </label>

                  <input
                    value={
                      editForm.name
                    }
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        name:
                          event.target.value,
                      })
                    }
                  />
                </div>

                <div className="field">
                  <label className="label">
                    Brand
                  </label>

                  <input
                    value={
                      editForm.brand
                    }
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        brand:
                          event.target.value,
                      })
                    }
                  />
                </div>

                <div className="field">
                  <label className="label">
                    Category
                  </label>

                  <select
                    value={
                      editForm.category_id
                    }
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        category_id:
                          event.target.value,
                      })
                    }
                  >
                    <option value="">
                      No category
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="field">
                  <label className="label">
                    Status
                  </label>

                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={
                        editForm.is_active
                      }
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          is_active:
                            event.target
                              .checked,
                        })
                      }
                    />

                    Active product
                  </label>

                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={
                        editForm.is_featured
                      }
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          is_featured:
                            event.target
                              .checked,
                        })
                      }
                    />

                    Featured product
                  </label>
                </div>

                <div className="field full">
                  <label className="label">
                    Description
                  </label>

                  <textarea
                    value={
                      editForm.description
                    }
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        description:
                          event.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/*
               * -----------------------
               * PRICING SECTION
               * -----------------------
               */}

              <div className="pricing">
                <div className="price-box">
                  <div className="price-label">
                    Base Price
                  </div>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      editForm.base_price
                    }
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        base_price:
                          event.target.value,
                      })
                    }
                  />

                  <div className="price-description">
                    Reference / market price.
                  </div>
                </div>

                <div className="price-box">
                  <div className="price-label">
                    Selling Price
                  </div>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      editForm.selling_price
                    }
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        selling_price:
                          event.target.value,
                      })
                    }
                  />

                  <div className="price-description">
                    Normal customer price.
                  </div>
                </div>

                <div
                  className={`price-box ${
                    hasDiscount()
                      ? "discount-active"
                      : ""
                  }`}
                >
                  <div className="price-label">
                    Discount
                  </div>

                  {!hasDiscount() ? (
                    <div className="discount-control">
                      <div className="discount-status">
                        <strong>
                          No discount
                        </strong>

                        <span>
                          Selling price applies.
                        </span>
                      </div>

                      <button
                        type="button"
                        className="primary"
                        onClick={
                          enableDiscount
                        }
                        disabled={saving}
                      >
                        Add Discount
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="discount-control">
                        <div className="discount-status">
                          <strong>
                            Discount active
                          </strong>

                          <span>
                            Enter the final offer
                            price below.
                          </span>
                        </div>

                        <button
                          type="button"
                          className="danger"
                          onClick={
                            removeDiscount
                          }
                          disabled={saving}
                        >
                          Remove Discount
                        </button>
                      </div>

                      <div
                        style={{
                          marginTop: 14,
                        }}
                      >
                        <label className="label">
                          Discounted Price
                        </label>

                        <input
                          style={{
                            marginTop: 8,
                          }}
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="699"
                          value={
                            editForm.discounted_price
                          }
                          onChange={(event) =>
                            setEditForm({
                              ...editForm,
                              discounted_price:
                                event.target
                                  .value,
                            })
                          }
                        />

                        {getLiveDiscount() !==
                          null && (
                          <span className="discount-badge">
                            {getLiveDiscount()}%
                            OFF
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="live-preview">
                <div>
                  <div className="live-preview-label">
                    Customer pays
                  </div>

                  <div className="live-price">
                    <strong>
                      {money(
                        getLiveCustomerPrice()
                      )}
                    </strong>

                    {hasDiscount() &&
                      editForm.base_price && (
                        <span className="live-old">
                          {money(
                            Number(
                              editForm.base_price
                            )
                          )}
                        </span>
                      )}
                  </div>
                </div>

                {getLiveDiscount() !==
                  null && (
                  <span className="discount-badge">
                    {getLiveDiscount()}%
                    OFF
                  </span>
                )}
              </div>

              {/*
               * -----------------------
               * VARIANTS
               * -----------------------
               */}

              <section className="variants">
                <div className="section-head">
                  <div className="section-title">
                    Variants
                  </div>

                  <button
                    className="secondary"
                    onClick={addVariant}
                    disabled={saving}
                  >
                    Add Variant
                  </button>
                </div>

                <div className="variant-list">
                  {editVariants.length ===
                    0 && (
                    <div className="empty">
                      No variants found.
                    </div>
                  )}

                  {editVariants.map(
                    (
                      variant,
                      index
                    ) => (
                      <div
                        className="variant"
                        key={
                          variant.id ||
                          `new-${index}`
                        }
                      >
                        <div className="variant-grid">
                          <div className="field">
                            <label className="label">
                              SKU
                            </label>

                            <input
                              value={
                                variant.sku
                              }
                              onChange={(
                                event
                              ) => {
                                if (
                                  !variant.id
                                ) {
                                  setEditVariants(
                                    (
                                      current
                                    ) =>
                                      current.map(
                                        (
                                          item,
                                          itemIndex
                                        ) =>
                                          itemIndex ===
                                          index
                                            ? {
                                                ...item,
                                                sku: event
                                                  .target
                                                  .value,
                                              }
                                            : item
                                      )
                                  );

                                  return;
                                }

                                updateVariant(
                                  variant.id,
                                  "sku",
                                  event.target
                                    .value
                                );
                              }}
                            />
                          </div>

                          <div className="field">
                            <label className="label">
                              Size
                            </label>

                            <input
                              value={
                                variant.size
                              }
                              onChange={(
                                event
                              ) => {
                                if (
                                  !variant.id
                                ) {
                                  setEditVariants(
                                    (
                                      current
                                    ) =>
                                      current.map(
                                        (
                                          item,
                                          itemIndex
                                        ) =>
                                          itemIndex ===
                                          index
                                            ? {
                                                ...item,
                                                size: event
                                                  .target
                                                  .value,
                                              }
                                            : item
                                      )
                                  );

                                  return;
                                }

                                updateVariant(
                                  variant.id,
                                  "size",
                                  event.target
                                    .value
                                );
                              }}
                            />
                          </div>

                          <div className="field">
                            <label className="label">
                              Color
                            </label>

                            <input
                              value={
                                variant.color
                              }
                              onChange={(
                                event
                              ) => {
                                if (
                                  !variant.id
                                ) {
                                  setEditVariants(
                                    (
                                      current
                                    ) =>
                                      current.map(
                                        (
                                          item,
                                          itemIndex
                                        ) =>
                                          itemIndex ===
                                          index
                                            ? {
                                                ...item,
                                                color: event
                                                  .target
                                                  .value,
                                              }
                                            : item
                                      )
                                  );

                                  return;
                                }

                                updateVariant(
                                  variant.id,
                                  "color",
                                  event.target
                                    .value
                                );
                              }}
                            />
                          </div>

                          <div className="field">
                            <label className="label">
                              Stock
                            </label>

                            <input
                              type="number"
                              min="0"
                              value={
                                variant.stock
                              }
                              onChange={(
                                event
                              ) => {
                                if (
                                  !variant.id
                                ) {
                                  setEditVariants(
                                    (
                                      current
                                    ) =>
                                      current.map(
                                        (
                                          item,
                                          itemIndex
                                        ) =>
                                          itemIndex ===
                                          index
                                            ? {
                                                ...item,
                                                stock: event
                                                  .target
                                                  .value,
                                              }
                                            : item
                                      )
                                  );

                                  return;
                                }

                                updateVariant(
                                  variant.id,
                                  "stock",
                                  event.target
                                    .value
                                );
                              }}
                            />
                          </div>

                          <div>
                            <label className="toggle">
                              <input
                                type="checkbox"
                                checked={
                                  variant.is_active
                                }
                                onChange={(
                                  event
                                ) => {
                                  if (
                                    !variant.id
                                  ) {
                                    setEditVariants(
                                      (
                                        current
                                      ) =>
                                        current.map(
                                          (
                                            item,
                                            itemIndex
                                          ) =>
                                            itemIndex ===
                                            index
                                              ? {
                                                  ...item,
                                                  is_active:
                                                    event
                                                      .target
                                                      .checked,
                                                }
                                              : item
                                        )
                                    );

                                    return;
                                  }

                                  updateVariant(
                                    variant.id,
                                    "is_active",
                                    event.target
                                      .checked
                                  );
                                }}
                              />

                              Active
                            </label>

                            {!variant.id && (
                              <button
                                className="danger"
                                onClick={() =>
                                  removeNewVariant(
                                    index
                                  )
                                }
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </section>

              {/*
               * -----------------------
               * IMAGES
               * -----------------------
               */}

              {editingId && (
                <section className="images-preview">
                  <div className="section-head">
                    <div className="section-title">
                      Product Images
                    </div>
                  </div>

                  <div className="image-grid">
                    {getProductImages(
                      editingId
                    ).map(
                      (
                        image,
                        index
                      ) => (
                        <div
                          className={
                            index === 0
                              ? "image-thumb primary-image"
                              : "image-thumb"
                          }
                          key={image.id}
                        >
                          <img
                            src={
                              image.image_url
                            }
                            alt=""
                          />
                        </div>
                      )
                    )}

                    {getProductImages(
                      editingId
                    ).length === 0 && (
                      <div className="empty">
                        No product images.
                      </div>
                    )}
                  </div>
                </section>
              )}

              <div className="actions">
                <button
                  className="secondary"
                  onClick={closeEditor}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  className="primary"
                  onClick={saveProduct}
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Product"}
                </button>
              </div>
            </section>
          )}

        <div className="toolbar">
          <input
            className="search"
            placeholder="Search products..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          <select
            className="filter"
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target.value as
                  | "all"
                  | "active"
                  | "inactive"
              )
            }
          >
            <option value="all">
              All Products
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>
        </div>

        {loading ? (
          <div className="empty">
            Loading products...
          </div>
        ) : (
          <section className="products">
            {filteredProducts.length ===
              0 && (
              <div className="empty">
                No products found.
              </div>
            )}

            {filteredProducts.map(
              (product) => {
                const stock =
                  getProductStock(
                    product.id
                  );

                const availability =
                  getAvailability(
                    product.id
                  );

                const discount =
                  getProductDiscount(
                    product
                  );

                const customerPrice =
                  getCustomerPrice(
                    product
                  );

                const productImages =
                  getProductImages(
                    product.id
                  );

                const image =
                  productImages[0]
                    ?.image_url ??
                  product.main_image_url;

                return (
                  <article
                    className="card"
                    key={product.id}
                  >
                    <div className="image">
                      {image ? (
                        <img
                          src={image}
                          alt={
                            product.name
                          }
                        />
                      ) : (
                        <div className="no-image">
                          No image
                        </div>
                      )}

                      {product.is_featured && (
                        <span className="featured">
                          FEATURED
                        </span>
                      )}
                    </div>

                    <div className="card-body">
                      <div className="category">
                        {product.category_name ??
                          "Uncategorized"}
                      </div>

                      <div className="name">
                        {product.name}
                      </div>

                      {product.brand && (
                        <div className="brand">
                          {product.brand}
                        </div>
                      )}

                      <div className="card-price">
                        <span className="card-price-main">
                          {money(
                            customerPrice
                          )}
                        </span>

                        {discount !==
                          null && (
                          <span className="card-price-old">
                            {money(
                              product.base_price
                            )}
                          </span>
                        )}
                      </div>

                      {discount !==
                        null && (
                        <span className="discount-badge">
                          {discount}% OFF
                        </span>
                      )}

                      <div className="stock-row">
                        <span
                          className={`stock ${availability.className}`}
                        >
                          {
                            availability.label
                          }
                        </span>

                        <span className="stock">
                          {stock} in stock
                        </span>
                      </div>

                      <div className="card-actions">
                        <button
                          className="primary"
                          onClick={() =>
                            openEditor(
                              product
                            )
                          }
                        >
                          View / Edit
                        </button>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </section>
        )}
      </div>
    </main>
  );
}