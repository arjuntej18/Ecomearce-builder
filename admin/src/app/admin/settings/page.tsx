"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [deliveryDays, setDeliveryDays] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function loadSettings() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/settings",
        {
          cache: "no-store",
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Unable to load settings."
        );
        return;
      }

      setDeliveryDays(
        String(
          result.settings
            ?.delivery_days ?? 7
        )
      );
    } catch (error) {
      console.error(error);
      setError(
        "Unable to load settings."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function saveSettings() {
    const days = Number(
      deliveryDays
    );

    if (
      !Number.isInteger(days) ||
      days < 1 ||
      days > 365
    ) {
      setError(
        "Enter a whole number between 1 and 365."
      );
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/settings",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            delivery_days: days,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Unable to save settings."
        );
        return;
      }

      setDeliveryDays(
        String(
          result.settings
            ?.delivery_days ?? days
        )
      );

      setMessage(
        "Delivery time updated successfully."
      );
    } catch (error) {
      console.error(error);
      setError(
        "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Settings
          </h1>

          <p className="mt-1 text-gray-500">
            Manage store delivery settings.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        <section className="max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Expected Delivery Time
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            New orders will use this number of days to calculate the expected delivery date.
          </p>

          {loading ? (
            <div className="mt-6 text-sm text-gray-500">
              Loading settings...
            </div>
          ) : (
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Delivery time
              </label>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="365"
                  step="1"
                  value={deliveryDays}
                  onChange={(event) =>
                    setDeliveryDays(
                      event.target.value
                    )
                  }
                  className="w-32 rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
                />

                <span className="text-gray-700">
                  days
                </span>
              </div>

              <button
                type="button"
                onClick={saveSettings}
                disabled={saving}
                className="mt-5 rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:bg-gray-400"
              >
                {saving
                  ? "Saving..."
                  : "Save"}
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}