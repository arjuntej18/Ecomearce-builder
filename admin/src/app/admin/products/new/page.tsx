"use client";

// Creates a product with a reviewable storefront-style preview before publishing.

import {
  DragEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type VariantForm = {
  color: string;
  size: string;
  sku: string;
  price: string;
  stock: string;
};

type PreviewMode = "edit" | "preview";

export default function NewProductPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] =
    useState(true);
  const [error, setError] = useState("");

  const [categories, setCategories] =
    useState<Category[]>([]);

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

  const [variants, setVariants] =
    useState<VariantForm[]>([
      {
        color: "",
        size: "",
        sku: "",
        price: "",
        stock: "",
      },
    ]);

  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] =
    useState<string[]>([]);

  const [mode, setMode] =
    useState<PreviewMode>("edit");

  const [previewImageIndex, setPreviewImageIndex] =
    useState(0);

  const [previewVariantIndex, setPreviewVariantIndex] =
    useState(0);

  useEffect(() => {
    async function loadCategories() {
      setCategoriesLoading(true);

      try {
        const response = await fetch(
          "/api/admin/categories",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          setError(
            result.error ||
              "Unable to load categories."
          );
          return;
        }

        setCategories(
          result.categories ?? []
        );
      } catch (error) {
        console.error(error);

        setError(
          "Unable to load categories."
        );
      } finally {
        setCategoriesLoading(false);
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) =>
        URL.revokeObjectURL(url)
      );
    };

    // Preview URLs are intentionally cleaned up on unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          ? {
              ...variant,
              [name]: value,
            }
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
    if (variants.length === 1) {
      return;
    }

    setVariants((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setPreviewVariantIndex((current) => {
      if (current === index) {
        return 0;
      }

      if (current > index) {
        return current - 1;
      }

      return current;
    });
  }

  function setSelectedImages(files: File[]) {
    if (files.length === 0) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const validFiles: File[] = [];
    const validationErrors: string[] = [];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        validationErrors.push(
          `${file.name}: only JPG, PNG, and WebP images are allowed.`
        );
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        validationErrors.push(
          `${file.name}: image must be 5 MB or smaller.`
        );
        continue;
      }

      validFiles.push(file);
    }

    if (validationErrors.length > 0) {
      setError(
        validationErrors.join(" ")
      );
    } else {
      setError("");
    }

    if (validFiles.length === 0) {
      return;
    }

    const existingKeys = new Set(
      images.map(
        (file) =>
          `${file.name}-${file.size}-${file.lastModified}`
      )
    );

    const newUniqueFiles =
      validFiles.filter((file) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;

        if (existingKeys.has(key)) {
          return false;
        }

        existingKeys.add(key);
        return true;
      });

    const remainingSlots = Math.max(
      0,
      5 - images.length
    );

    const filesToAdd =
      newUniqueFiles.slice(
        0,
        remainingSlots
      );

    if (filesToAdd.length === 0) {
      setError(
        "You can upload a maximum of 5 unique images."
      );
      return;
    }

    if (
      filesToAdd.length <
      newUniqueFiles.length
    ) {
      setError(
        "You can upload a maximum of 5 images."
      );
    }

    setImages((prev) => [
      ...prev,
      ...filesToAdd,
    ]);

    setPreviewUrls((prev) => [
      ...prev,
      ...filesToAdd.map((file) =>
        URL.createObjectURL(file)
      ),
    ]);

    setPreviewImageIndex((current) => {
      if (images.length === 0) {
        return 0;
      }

      return current;
    });
  }

  function removeImage(index: number) {
    const url = previewUrls[index];

    if (url) {
      URL.revokeObjectURL(url);
    }

    setPreviewUrls((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setImages((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setPreviewImageIndex((current) => {
      if (current === index) {
        return Math.max(
          0,
          Math.min(
            current,
            previewUrls.length - 2
          )
        );
      }

      if (current > index) {
        return current - 1;
      }

      return current;
    });
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    const files = Array.from(
      event.dataTransfer.files
    );

    setSelectedImages(files);
  }

  function validateBeforePreview() {
    setError("");

    if (!form.name.trim()) {
      setError(
        "Please enter a product name."
      );
      return false;
    }

    if (!form.slug.trim()) {
      setError(
        "Please enter a product slug."
      );
      return false;
    }

    if (!form.base_price.trim()) {
      setError(
        "Please enter a base price."
      );
      return false;
    }

    if (!form.category_id) {
      setError(
        "Please select a category."
      );
      return false;
    }

    if (!variants.length) {
      setError(
        "Add at least one variant."
      );
      return false;
    }

    for (
      let index = 0;
      index < variants.length;
      index++
    ) {
      const variant =
        variants[index];

      if (
        !variant.color.trim() ||
        !variant.size.trim() ||
        !variant.sku.trim() ||
        Number(variant.price) <= 0 ||
        Number(variant.stock) < 0
      ) {
        setError(
          `Variant ${index + 1} needs color, size, code, valid price and valid stock.`
        );
        return false;
      }
    }

    return true;
  }

  function handlePreview() {
    if (!validateBeforePreview()) {
      return;
    }

    setPreviewImageIndex(0);
    setPreviewVariantIndex(0);
    setMode("preview");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleBackToEdit() {
    setMode("edit");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handlePublish(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    if (!validateBeforePreview()) {
      setLoading(false);
      return;
    }

    try {
      const formData =
        new FormData();

      formData.append(
        "name",
        form.name
      );

      formData.append(
        "slug",
        form.slug
      );

      formData.append(
        "description",
        form.description
      );

      formData.append(
        "brand",
        form.brand
      );

      formData.append(
        "base_price",
        form.base_price
      );

      formData.append(
        "sale_price",
        form.sale_price
      );

      formData.append(
        "category_id",
        form.category_id
      );

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

      if (images.length > 0) {
        formData.append(
          "image",
          images[0]
        );

        images.forEach((file) => {
          formData.append(
            "images",
            file
          );
        });
      }

      const response =
        await fetch(
          "/api/admin/products",
          {
            method: "POST",
            body: formData,
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Unable to create product."
        );
        return;
      }

      router.push(
        "/admin/products"
      );

      router.refresh();
    } catch (error) {
      console.error(error);

      setError(
        "Unable to create product."
      );
    } finally {
      setLoading(false);
    }
  }

  const selectedPreviewVariant =
    variants[
      previewVariantIndex
    ] ?? variants[0] ?? null;

  const selectedCategory =
    categories.find(
      (category) =>
        category.id ===
        form.category_id
    );

  const previewImage =
    previewUrls[
      previewImageIndex
    ] ?? previewUrls[0] ?? null;

  const basePriceNumber =
    Number(form.base_price || 0);

  const salePriceNumber =
    Number(form.sale_price || 0);

  const hasSale =
    salePriceNumber > 0 &&
    basePriceNumber > 0 &&
    salePriceNumber <
      basePriceNumber;

  const discountPercent =
    hasSale
      ? Math.round(
          ((basePriceNumber -
            salePriceNumber) /
            basePriceNumber) *
            100
        )
      : 0;

  if (mode === "preview") {
    return (
      <main className="min-h-screen bg-[#f7f2ed] p-4 text-[#4a2925] sm:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-4 rounded-xl border border-[#dccfc4] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a6f45]">
                Product Review
              </p>

              <h1 className="mt-1 text-2xl font-semibold">
                Preview before publishing
              </h1>

              <p className="mt-1 text-sm text-[#76645b]">
                This product is not live yet.
                Review everything before publishing.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleBackToEdit}
                className="rounded-lg border border-[#d6c8bc] bg-white px-5 py-3 font-semibold text-[#4a2925] transition hover:bg-[#faf6f1]"
              >
                ← Back to Edit
              </button>

              <button
                type="button"
                onClick={() => {
                  const formElement =
                    document.getElementById(
                      "publish-product-form"
                    ) as HTMLFormElement | null;

                  formElement?.requestSubmit();
                }}
                disabled={loading}
                className="rounded-lg bg-[#701c30] px-5 py-3 font-semibold text-white transition hover:bg-[#5d1728] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Publishing..."
                  : "Publish Product"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mb-5 rounded-lg border border-[#d8c6b3] bg-[#fbf1e7] px-4 py-3 text-sm font-medium text-[#6e4c3f]">
            PREVIEW ONLY — customers cannot see
            this product until you publish it.
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e1d6cd] bg-[#fffaf5] shadow-sm">
            <div className="grid gap-0 lg:grid-cols-2">
              {/* GALLERY */}
              <div className="bg-[#fffaf5] p-4 sm:p-7">
                <div className="relative overflow-hidden rounded-2xl border border-[#e4d9d0] bg-[#f7f0e9]">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt={
                        form.name ||
                        "Product preview"
                      }
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square items-center justify-center text-[#8d7a70]">
                      No product image
                    </div>
                  )}

                  {previewUrls.length > 1 && (
                    <>
                      <button
                        type="button"
                        aria-label="Previous preview image"
                        onClick={() =>
                          setPreviewImageIndex(
                            (current) =>
                              current <= 0
                                ? previewUrls.length - 1
                                : current - 1
                          )
                        }
                        className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/45 px-3 py-2 text-lg text-white backdrop-blur-sm transition hover:bg-black/65 md:block"
                      >
                        ‹
                      </button>

                      <button
                        type="button"
                        aria-label="Next preview image"
                        onClick={() =>
                          setPreviewImageIndex(
                            (current) =>
                              current >=
                              previewUrls.length - 1
                                ? 0
                                : current + 1
                          )
                        }
                        className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/45 px-3 py-2 text-lg text-white backdrop-blur-sm transition hover:bg-black/65 md:block"
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>

                {previewUrls.length > 1 && (
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                    {previewUrls.map(
                      (url, index) => (
                        <button
                          key={url}
                          type="button"
                          onClick={() =>
                            setPreviewImageIndex(
                              index
                            )
                          }
                          className={`w-20 min-w-20 overflow-hidden rounded-lg border-2 bg-white transition ${
                            previewImageIndex ===
                            index
                              ? "border-[#701c30]"
                              : "border-[#e1d6cd] hover:border-[#b59670]"
                          }`}
                          aria-label={`Preview image ${
                            index + 1
                          }`}
                        >
                          <img
                            src={url}
                            alt={`${form.name} ${
                              index + 1
                            }`}
                            className="aspect-square w-full object-cover"
                          />
                        </button>
                      )
                    )}
                  </div>
                )}

                {previewUrls.length > 1 && (
                  <p className="mt-2 text-center text-xs text-[#8b776a]">
                    Image{" "}
                    {previewImageIndex + 1}{" "}
                    of{" "}
                    {previewUrls.length}
                  </p>
                )}
              </div>

              {/* DETAILS */}
              <div className="p-5 sm:p-8 lg:p-10">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#a17b4f]">
                  Setetha Vastram
                </p>

                <h2 className="text-3xl font-semibold tracking-tight text-[#4a2925] sm:text-4xl">
                  {form.name ||
                    "Product name"}
                </h2>

                {form.brand && (
                  <p className="mt-2 text-sm font-medium text-[#7b665c]">
                    {form.brand}
                  </p>
                )}

                {selectedCategory && (
                  <p className="mt-2 text-sm text-[#7b665c]">
                    Category:{" "}
                    {selectedCategory.name}
                  </p>
                )}

                <div className="mt-5">
                  {hasSale ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-base text-[#9a8b82] line-through">
                        ₹
                        {basePriceNumber.toFixed(
                          2
                        )}
                      </span>

                      <span className="text-2xl font-bold text-[#701c30]">
                        ₹
                        {salePriceNumber.toFixed(
                          2
                        )}
                      </span>

                      <span className="rounded-md bg-[#eadfcf] px-2 py-1 text-sm font-bold text-[#9b7548]">
                        {discountPercent}% OFF
                      </span>
                    </div>
                  ) : selectedPreviewVariant ? (
                    <p className="text-2xl font-bold text-[#701c30]">
                      ₹
                      {Number(
                        selectedPreviewVariant.price ||
                          0
                      ).toFixed(2)}
                    </p>
                  ) : (
                    <p className="text-2xl font-bold text-[#701c30]">
                      Select an option
                    </p>
                  )}
                </div>

                {form.description && (
                  <p className="mt-6 leading-7 text-[#6d574e]">
                    {form.description}
                  </p>
                )}

                {/* OPTIONS */}
                {variants.length > 0 && (
                  <section className="mt-8">
                    <h3 className="mb-4 text-lg font-semibold text-[#4a2925]">
                      Choose your option
                    </h3>

                    <div className="flex flex-wrap gap-3">
                      {variants.map(
                        (
                          variant,
                          index
                        ) => {
                          const stock =
                            Number(
                              variant.stock || 0
                            );

                          const outOfStock =
                            stock <= 0;

                          const isSelected =
                            previewVariantIndex ===
                            index;

                          const label = [
                            variant.size,
                            variant.color,
                          ]
                            .filter(Boolean)
                            .join(
                              " / "
                            );

                          return (
                            <button
                              key={`${variant.sku}-${index}`}
                              type="button"
                              disabled={
                                outOfStock
                              }
                              onClick={() =>
                                setPreviewVariantIndex(
                                  index
                                )
                              }
                              className={`min-w-[120px] rounded-lg border-2 px-4 py-3 text-left transition ${
                                isSelected
                                  ? "border-[#701c30] bg-[#701c30] text-white"
                                  : outOfStock
                                  ? "border-[#e4ddd5] bg-[#f2ece5] text-[#aaa099]"
                                  : "border-[#d8cabb] bg-[#fffaf2] text-[#4a2925] hover:border-[#701c30]"
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
                                  variant.price ||
                                    0
                                ).toFixed(2)}
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
                                {outOfStock
                                  ? "Out of Stock"
                                  : stock <= 5
                                  ? "Only a few left"
                                  : "In Stock"}
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
                  <h3 className="text-base font-semibold text-[#4a2925]">
                    Your selection
                  </h3>

                  {selectedPreviewVariant ? (
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-[#7b665c]">
                          Product
                        </span>

                        <span className="font-medium text-[#4a2925]">
                          {form.name ||
                            "Product"}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-[#7b665c]">
                          Option
                        </span>

                        <span className="font-medium text-[#4a2925]">
                          {[
                            selectedPreviewVariant.size,
                            selectedPreviewVariant.color,
                          ]
                            .filter(Boolean)
                            .join(
                              " / "
                            ) ||
                            selectedPreviewVariant.sku}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-[#7b665c]">
                          Code
                        </span>

                        <span className="font-medium text-[#4a2925]">
                          {
                            selectedPreviewVariant.sku
                          }
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-[#7b665c]">
                          Availability
                        </span>

                        <span className="font-semibold text-[#701c30]">
                          {Number(
                            selectedPreviewVariant.stock ||
                              0
                          ) <= 0
                            ? "Out of Stock"
                            : Number(
                                selectedPreviewVariant.stock ||
                                  0
                              ) <= 5
                            ? "Only a few left"
                            : "In Stock"}
                        </span>
                      </div>

                      <div className="flex justify-between border-t border-[#e5d9cc] pt-3">
                        <span className="font-semibold text-[#4a2925]">
                          Price
                        </span>

                        <span className="font-bold text-[#701c30]">
                          {hasSale
                            ? `₹${salePriceNumber.toFixed(
                                2
                              )}`
                            : `₹${Number(
                                selectedPreviewVariant.price ||
                                  0
                              ).toFixed(2)}`}
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

                {/* DISABLED BUY BUTTON */}
                <button
                  type="button"
                  disabled
                  className="mt-6 w-full cursor-not-allowed rounded-xl bg-[#701c30]/70 px-6 py-4 text-base font-semibold text-white"
                >
                  Preview Only — Buy Now
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleBackToEdit}
              className="rounded-lg border border-[#d6c8bc] bg-white px-5 py-3 font-semibold text-[#4a2925] transition hover:bg-[#faf6f1]"
            >
              ← Edit Product
            </button>
          </div>

          <form
            id="publish-product-form"
            className="hidden"
            onSubmit={handlePublish}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a6f45]">
              Product Management
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Add Product
            </h1>

            <p className="mt-2 text-gray-600">
              Create the product, review the
              storefront preview, then publish it.
            </p>
          </div>

          <div className="rounded-lg border border-[#dccfc4] bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
            Step 1 of 2 · Product details
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 rounded-lg border border-[#d8c6b3] bg-[#fbf1e7] p-4 text-sm text-[#6e4c3f]">
          Nothing will be published while you are
          filling this form. Click{" "}
          <strong>Preview Product</strong> when
          you are ready to review it.
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            handlePreview();
          }}
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
                        .replace(
                          /\s+/g,
                          "-"
                        )
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

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Category
                </label>

                <select
                  value={form.category_id}
                  onChange={(e) =>
                    updateField(
                      "category_id",
                      e.target.value
                    )
                  }
                  disabled={
                    categoriesLoading
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
                  required
                >
                  <option value="">
                    {categoriesLoading
                      ? "Loading categories..."
                      : "Select a category"}
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

                {!categoriesLoading &&
                  categories.length ===
                    0 && (
                    <p className="mt-2 text-sm text-red-600">
                      No categories found.
                      Create one in Admin →
                      Categories first.
                    </p>
                  )}
              </div>

              {/* Images */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Product images
                </label>

                <div
                  onDragOver={(event) =>
                    event.preventDefault()
                  }
                  onDrop={handleDrop}
                  className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center"
                >
                  {previewUrls.length > 0 ? (
                    <div>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                        {previewUrls.map(
                          (
                            preview,
                            index
                          ) => (
                            <div
                              key={preview}
                              className="relative overflow-hidden rounded-lg border border-gray-200 bg-white"
                            >
                              <img
                                src={preview}
                                alt={`Product image ${
                                  index + 1
                                }`}
                                className="aspect-square w-full object-cover"
                              />

                              {index === 0 && (
                                <span className="absolute left-2 top-2 rounded-md bg-green-600 px-2 py-1 text-xs font-bold text-white">
                                  Main image
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  removeImage(
                                    index
                                  )
                                }
                                className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-xs font-semibold text-white hover:bg-black"
                              >
                                Remove
                              </button>
                            </div>
                          )
                        )}
                      </div>

                      <div className="mt-5 flex flex-wrap justify-center gap-3">
                        {images.length <
                          5 && (
                          <label className="cursor-pointer rounded-lg bg-black px-4 py-2 font-semibold text-white hover:bg-gray-800">
                            Add more images

                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                setSelectedImages(
                                  Array.from(
                                    e.target
                                      .files ??
                                      []
                                  )
                                );

                                e.currentTarget.value =
                                  "";
                              }}
                            />
                          </label>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            previewUrls.forEach(
                              (url) =>
                                URL.revokeObjectURL(
                                  url
                                )
                            );

                            setImages([]);
                            setPreviewUrls([]);
                            setPreviewImageIndex(0);
                            setError("");
                          }}
                          className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-900"
                        >
                          Remove all
                        </button>
                      </div>

                      <p className="mt-3 text-sm text-gray-500">
                        {images.length}/5
                        images selected.
                        The first image is
                        the main product image.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-gray-900">
                        Drag and drop product
                        images here
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        JPG, PNG or WebP ·
                        Maximum 5 MB each ·
                        Up to 5 images
                      </p>

                      <label className="mt-4 inline-block cursor-pointer rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800">
                        Choose images

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            setSelectedImages(
                              Array.from(
                                e.target.files ??
                                  []
                              )
                            );

                            e.currentTarget.value =
                              "";
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-3 text-gray-900">
                  <input
                    type="checkbox"
                    checked={
                      form.is_featured
                    }
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
                    checked={
                      form.is_active
                    }
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
                  Add size, color, code, price
                  and stock.
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
                (
                  variant,
                  index
                ) => (
                  <div
                    key={index}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">
                        Variant{" "}
                        {index + 1}
                      </h3>

                      {variants.length >
                        1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeVariant(
                              index
                            )
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
                          value={
                            variant.color
                          }
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
                          value={
                            variant.size
                          }
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
                          value={
                            variant.sku
                          }
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
                          value={
                            variant.price
                          }
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
                          value={
                            variant.stock
                          }
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

          {/* Actions */}
          <div className="sticky bottom-4 z-20 flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur">
            <button
              type="submit"
              disabled={
                categoriesLoading
              }
              className="rounded-lg bg-[#701c30] px-6 py-3 font-semibold text-white transition hover:bg-[#5d1728] disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              Preview Product
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/products"
                )
              }
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-900"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Hidden publish form data is managed by React state.
            Actual publishing happens only from preview. */}
      </div>
    </main>
  );
}