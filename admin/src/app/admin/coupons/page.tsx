"use client";

import { FormEvent, useEffect, useState } from "react";

type Coupon = {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean | null;
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    expires_at: "",
    usage_limit: "",
    is_active: true,
  });

  async function loadCoupons() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/coupons",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Unable to load coupons."
        );
        setCoupons([]);
        return;
      }

      setCoupons(result.coupons ?? []);
    } catch (error) {
      console.error(error);
      setError("Unable to load coupons.");
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  async function handleCreate(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    const code = form.code
      .trim()
      .toUpperCase();

    const discountValue = Number(
      form.discount_value
    );

    if (!code) {
      setError(
        "Coupon code is required."
      );
      setSaving(false);
      return;
    }

    if (
      !Number.isFinite(discountValue) ||
      discountValue <= 0
    ) {
      setError(
        "Enter a valid discount."
      );
      setSaving(false);
      return;
    }

    if (
      form.discount_type ===
        "percentage" &&
      discountValue > 100
    ) {
      setError(
        "Percentage discount cannot exceed 100%."
      );
      setSaving(false);
      return;
    }

    const usageLimit =
      form.usage_limit === ""
        ? null
        : Number(
            form.usage_limit
          );

    if (
      usageLimit !== null &&
      (!Number.isInteger(
        usageLimit
      ) ||
        usageLimit <= 0)
    ) {
      setError(
        "Usage limit must be a positive whole number."
      );
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(
        "/api/admin/coupons",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            code,
            discount_type:
              form.discount_type,
            discount_value:
              discountValue,
            expires_at:
              form.expires_at || null,
            usage_limit:
              usageLimit,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Unable to create coupon."
        );
        return;
      }

      setForm({
        code: "",
        discount_type:
          "percentage",
        discount_value: "",
        expires_at: "",
        usage_limit: "",
        is_active: true,
      });

      await loadCoupons();
    } catch (error) {
      console.error(error);

      setError(
        "Unable to create coupon."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleCoupon(
    coupon: Coupon
  ) {
    setError("");

    try {
      const response = await fetch(
        "/api/admin/coupons",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: coupon.id,
            is_active:
              !coupon.is_active,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Unable to update coupon."
        );
        return;
      }

      await loadCoupons();
    } catch (error) {
      console.error(error);

      setError(
        "Unable to update coupon."
      );
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Coupons
          </h1>

          <p className="mt-1 text-gray-500">
            Create and manage discount coupons.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Create Coupon
          </h2>

          <form
            onSubmit={handleCreate}
            className="mt-6 grid gap-5 md:grid-cols-2"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Code
              </label>

              <input
                value={form.code}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    code: event.target.value
                      .toUpperCase()
                      .replace(/\s/g, ""),
                  }))
                }
                placeholder="SAVE20"
                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Discount type
              </label>

              <select
                value={form.discount_type}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    discount_type:
                      event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
              >
                <option value="percentage">
                  Percentage
                </option>

                <option value="fixed">
                  Fixed amount
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Discount
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.discount_value}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    discount_value:
                      event.target.value,
                  }))
                }
                placeholder={
                  form.discount_type ===
                  "percentage"
                    ? "20"
                    : "200"
                }
                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Expiry date
              </label>

              <input
                type="datetime-local"
                value={form.expires_at}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    expires_at:
                      event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Usage limit
              </label>

              <input
                type="number"
                min="1"
                step="1"
                value={form.usage_limit}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    usage_limit:
                      event.target.value,
                  }))
                }
                placeholder="Optional"
                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    is_active:
                      event.target.checked,
                  }))
                }
              />

              <span className="text-sm font-medium text-gray-900">
                Active
              </span>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg border-2 border-green-600 bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:border-gray-400 disabled:bg-gray-400"
              >
                {saving
                  ? "Creating..."
                  : "Create Coupon"}
              </button>
            </div>
          </form>
        </section>

        <section className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-gray-500">
              Loading coupons...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Code
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Discount
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Expiry
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Usage
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {coupons.map((coupon) => (
                    <tr
                      key={coupon.id}
                      className="border-b last:border-b-0"
                    >
                      <td className="px-6 py-5 font-semibold text-gray-900">
                        {coupon.code}
                      </td>

                      <td className="px-6 py-5 font-semibold text-gray-900">
                        {coupon.discount_type ===
                        "percentage"
                          ? `${coupon.discount_value}%`
                          : `₹${Number(
                              coupon.discount_value
                            ).toFixed(2)}`}
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-700">
                        {coupon.expires_at
                          ? new Date(
                              coupon.expires_at
                            ).toLocaleString()
                          : "No expiry"}
                      </td>

                      <td className="px-6 py-5 text-gray-700">
                        {coupon.used_count}
                        {coupon.usage_limit !==
                        null
                          ? ` / ${coupon.usage_limit}`
                          : " / ∞"}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            coupon.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {coupon.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <button
                          type="button"
                          onClick={() =>
                            toggleCoupon(
                              coupon
                            )
                          }
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:border-black"
                        >
                          {coupon.is_active
                            ? "Disable"
                            : "Enable"}
                        </button>
                      </td>
                    </tr>
                  ))}

                  {!coupons.length && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No coupons found.
                      </td>
                    </tr>
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