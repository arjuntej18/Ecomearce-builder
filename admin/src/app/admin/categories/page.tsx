"use client";

import { FormEvent, useEffect, useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string | null;
};

export default function CategoriesPage() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
  });

  async function loadCategories() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/categories",
        {
          cache: "no-store",
        }
      );

      const result =
        await response.json();

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
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function createSlug(name: string) {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function handleCreate(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    const name =
      form.name.trim();

    const slug =
      form.slug.trim() ||
      createSlug(name);

    if (!name) {
      setError(
        "Category name is required."
      );
      setSaving(false);
      return;
    }

    if (!slug) {
      setError(
        "A valid category slug is required."
      );
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(
        "/api/admin/categories",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name,
            slug,
            description:
              form.description.trim() ||
              null,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Unable to create category."
        );
        return;
      }

      setForm({
        name: "",
        slug: "",
        description: "",
      });

      await loadCategories();
    } catch (error) {
      console.error(error);

      setError(
        "Unable to create category."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(
    category: Category
  ) {
    if (deletingId) {
      return;
    }

    const firstConfirm =
      window.confirm(
        `Delete the category "${category.name}"?`
      );

    if (!firstConfirm) {
      return;
    }

    const secondConfirm =
      window.confirm(
        `FINAL CONFIRMATION\n\nDelete "${category.name}" permanently? This cannot be undone.`
      );

    if (!secondConfirm) {
      return;
    }

    setDeletingId(category.id);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/categories",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: category.id,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Unable to delete category."
        );
        return;
      }

      await loadCategories();
    } catch (error) {
      console.error(error);

      setError(
        "Unable to delete category."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Categories
          </h1>

          <p className="mt-1 text-gray-500">
            Create and manage product categories.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Create Category
          </h2>

          <form
            onSubmit={handleCreate}
            className="mt-6 space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Name
              </label>

              <input
                value={form.name}
                onChange={(event) => {
                  const name =
                    event.target.value;

                  setForm((prev) => ({
                    ...prev,
                    name,
                    slug:
                      !prev.slug ||
                      prev.slug ===
                        createSlug(
                          prev.name
                        )
                        ? createSlug(
                            name
                          )
                        : prev.slug,
                  }));
                }}
                placeholder="Men's"
                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Slug
              </label>

              <input
                value={form.slug}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    slug: event.target.value
                      .toLowerCase()
                      .replace(
                        /\s+/g,
                        "-"
                      )
                      .replace(
                        /[^a-z0-9-]/g,
                        ""
                      ),
                  }))
                }
                placeholder="mens"
                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Description
              </label>

              <textarea
                value={
                  form.description
                }
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    description:
                      event.target.value,
                  }))
                }
                placeholder="Men's clothing"
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg border-2 border-green-600 bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:border-gray-400 disabled:bg-gray-400"
            >
              {saving
                ? "Creating..."
                : "Create Category"}
            </button>
          </form>
        </section>

        <section className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-gray-500">
              Loading categories...
            </div>
          ) : categories.length ===
            0 ? (
            <div className="p-8 text-center text-gray-500">
              No categories found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Name
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Slug
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Description
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map(
                    (category) => (
                      <tr
                        key={category.id}
                        className="border-b last:border-b-0"
                      >
                        <td className="px-6 py-5 font-semibold text-gray-900">
                          {category.name}
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-500">
                          {category.slug}
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-700">
                          {category.description ||
                            "—"}
                        </td>

                        <td className="px-6 py-5">
                          <button
                            type="button"
                            disabled={
                              deletingId ===
                              category.id
                            }
                            onClick={() =>
                              deleteCategory(
                                category
                              )
                            }
                            className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingId ===
                            category.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}