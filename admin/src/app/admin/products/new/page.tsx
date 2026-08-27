"use client";

import {
  DragEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type VariantForm = {
  color: string;
  size: string;
  sku: string;
  price: string;
  stock: string;
};

export default function NewProductPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    brand: "",
    base_price: "",
    sale_price: "",
    category_id: "",
    is_featured: false,
    is_active: true,
  });

  const [variants, setVariants] = useState<VariantForm[]>([
    {
      color: "",
      size: "",
      sku: "",
      price: "",
      stock: "",
    },
  ]);

  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function updateField(
    name: string,
    value: string | boolean
  ) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function updateVariant(
    index: number,
    name: keyof VariantForm,
    value: string
  ) {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === index
          ? { ...variant, [name]: value }
          : variant
      )
    );
  }

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      {
        color: "",
        size: "",
        sku: "",
        price: "",
        stock: "",
      },
    ]);
  }

  function removeVariant(index: number) {
    if (variants.length === 1) return;

    setVariants((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  function setSelectedImage(file: File | null) {
    if (!file) return;

    if (
      ![
        "image/jpeg",
        "image/png",
        "image/webp",
      ].includes(file.type)
    ) {
      setError("Only JPG, PNG, and WebP images are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5 MB or smaller.");
      return;
    }

    setError("");
    setImage(file);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    const file = event.dataTransfer.files?.[0];

    if (file) {
      setSelectedImage(file);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("slug", form.slug);
      formData.append("description", form.description);
      formData.append("brand", form.brand);
      formData.append("base_price", form.base_price);
      formData.append("sale_price", form.sale_price);
      formData.append("category_id", form.category_id);
      formData.append(
        "is_featured",
        String(form.is_featured)
      );
      formData.append(
        "is_active",
        String(form.is_active)
      );

      formData.append(
        "variants",
        JSON.stringify(variants)
      );

      if (image) {
        formData.append("image", image);
      }

      const response = await fetch(
        "/api/admin/products",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Unable to create product."
        );
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error(error);
      setError("Unable to create product.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Add Product
          </h1>

          <p className="mt-2 text-gray-600">
            Create a product with variants and stock.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* Product details */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Product Details
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Product name
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    updateField(
                      "name",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Slug
                </label>

                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) =>
                    updateField(
                      "slug",
                      e.target.value
                        .toLowerCase()
                        .trim()
                        .replace(/\s+/g, "-")
                        .replace(
                          /[^a-z0-9-]/g,
                          ""
                        )
                    )
                  }
                  placeholder="black-tshirt"
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                  required
                />

                <p className="mt-1 text-xs text-gray-500">
                  Example: black-tshirt
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    updateField(
                      "description",
                      e.target.value
                    )
                  }
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Brand
                </label>

                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) =>
                    updateField(
                      "brand",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Base price
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.base_price}
                    onChange={(e) =>
                      updateField(
                        "base_price",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Sale price
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.sale_price}
                    onChange={(e) =>
                      updateField(
                        "sale_price",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                  />
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Product image
                </label>

                <div
                  onDragOver={(event) =>
                    event.preventDefault()
                  }
                  onDrop={handleDrop}
                  className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center"
                >
                  {previewUrl ? (
                    <div>
                      <img
                        src={previewUrl}
                        alt="Product preview"
                        className="mx-auto max-h-72 rounded-lg object-contain"
                      />

                      <div className="mt-4 flex flex-wrap justify-center gap-3">
                        <label className="cursor-pointer rounded-lg bg-black px-4 py-2 font-semibold text-white">
                          Change image

                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) =>
                              setSelectedImage(
                                e.target.files?.[0] ||
                                  null
                              )
                            }
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            if (previewUrl) {
                              URL.revokeObjectURL(
                                previewUrl
                              );
                            }

                            setImage(null);
                            setPreviewUrl("");
                          }}
                          className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-900"
                        >
                          Remove
                        </button>
                      </div>

                      <p className="mt-3 text-sm text-gray-500">
                        {image?.name}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-gray-900">
                        Drag and drop an image here
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        JPG, PNG or WebP · Maximum 5 MB
                      </p>

                      <label className="mt-4 inline-block cursor-pointer rounded-lg bg-black px-5 py-3 font-semibold text-white">
                        Choose image

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) =>
                            setSelectedImage(
                              e.target.files?.[0] ||
                                null
                            )
                          }
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Category ID
                </label>

                <input
                  type="text"
                  value={form.category_id}
                  onChange={(e) =>
                    updateField(
                      "category_id",
                      e.target.value
                    )
                  }
                  placeholder="Optional"
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                />
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-3 text-gray-900">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) =>
                      updateField(
                        "is_featured",
                        e.target.checked
                      )
                    }
                  />
                  Featured product
                </label>

                <label className="flex items-center gap-3 text-gray-900">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) =>
                      updateField(
                        "is_active",
                        e.target.checked
                      )
                    }
                  />
                  Active product
                </label>
              </div>
            </div>
          </section>

          {/* Variants */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Variants
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Add size, color, code, price and stock.
                </p>
              </div>

              <button
                type="button"
                onClick={addVariant}
                className="rounded-lg bg-black px-4 py-2 font-semibold text-white hover:bg-gray-800"
              >
                + Add Variant
              </button>
            </div>

            <div className="mt-6 space-y-5">
              {variants.map(
                (variant, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">
                        Variant {index + 1}
                      </h3>

                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeVariant(index)
                          }
                          className="text-sm font-medium text-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-900">
                          Color
                        </label>

                        <input
                          type="text"
                          value={variant.color}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              "color",
                              e.target.value
                            )
                          }
                          placeholder="Black"
                          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-900">
                          Size
                        </label>

                        <input
                          type="text"
                          value={variant.size}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              "size",
                              e.target.value
                            )
                          }
                          placeholder="M"
                          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-900">
                          Code
                        </label>

                        <input
                          type="text"
                          value={variant.sku}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              "sku",
                              e.target.value
                            )
                          }
                          placeholder="BLK-M"
                          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-900">
                          Price
                        </label>

                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={variant.price}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              "price",
                              e.target.value
                            )
                          }
                          placeholder="799"
                          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-900">
                          Stock
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={variant.stock}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              "stock",
                              e.target.value
                            )
                          }
                          placeholder="10"
                          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:bg-gray-400"
            >
              {loading
                ? "Creating..."
                : "Create Product"}
            </button>

            <button
              type="button"
              onClick={() =>
                router.push("/admin/products")
              }
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-900"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}