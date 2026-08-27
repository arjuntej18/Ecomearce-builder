"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  base_price: number;
  sale_price: number | null;
  main_image_url: string | null;
  is_featured: boolean;
  is_active: boolean;
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId = String(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    brand: "",
    base_price: "",
    sale_price: "",
    main_image_url: "",
    is_featured: false,
    is_active: true,
  });

  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await fetch(
          `/api/admin/products/${productId}`
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Unable to load product.");
          return;
        }

        const product: Product = data.product;

        setForm({
          name: product.name || "",
          slug: product.slug || "",
          description: product.description || "",
          brand: product.brand || "",
          base_price: String(product.base_price ?? ""),
          sale_price:
            product.sale_price == null
              ? ""
              : String(product.sale_price),
          main_image_url: product.main_image_url || "",
          is_featured: Boolean(product.is_featured),
          is_active: Boolean(product.is_active),
        });
      } catch (error) {
        console.error(error);
        setError("Unable to load product.");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/products/${productId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            slug: form.slug,
            description: form.description,
            brand: form.brand,
            base_price: form.base_price,
            sale_price: form.sale_price,
            main_image_url: form.main_image_url,
            is_featured: form.is_featured,
            is_active: form.is_active,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Unable to update product."
        );
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error(error);
      setError("Unable to update product.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="p-6">
        <p className="text-gray-500">
          Loading product...
        </p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900">
          Edit Product
        </h1>

        <p className="mt-2 text-gray-500">
          Update the product information.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-xl border bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">
              Product name
            </label>

            <input
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              className="w-full rounded-lg border p-3"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Slug
            </label>

            <input
              value={form.slug}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  slug: e.target.value
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, ""),
                }))
              }
              className="w-full rounded-lg border p-3"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={4}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Brand
            </label>

            <input
              value={form.brand}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  brand: e.target.value,
                }))
              }
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Base price
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.base_price}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    base_price: e.target.value,
                  }))
                }
                className="w-full rounded-lg border p-3"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Sale price
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.sale_price}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    sale_price: e.target.value,
                  }))
                }
                className="w-full rounded-lg border p-3"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Main image URL
            </label>

            <input
              type="url"
              value={form.main_image_url}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  main_image_url: e.target.value,
                }))
              }
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    is_featured: e.target.checked,
                  }))
                }
              />
              <span>Featured product</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    is_active: e.target.checked,
                  }))
                }
              />
              <span>Active product</span>
            </label>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-black px-6 py-3 font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() =>
                router.push("/admin/products")
              }
              className="rounded-lg border px-6 py-3 font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}