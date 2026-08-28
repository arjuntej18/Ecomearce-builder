"use client";

import { useEffect, useMemo, useState } from "react";

type Customer = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string | null;
  last_login_at: string | null;
};

export default function CustomersPage() {
  const [customers, setCustomers] =
    useState<Customer[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [search, setSearch] =
    useState("");

  async function loadCustomers() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/customers",
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Unable to load customers."
        );
        setCustomers([]);
        return;
      }

      setCustomers(
        result.customers ?? []
      );
    } catch (error) {
      console.error(error);
      setError(
        "Unable to load customers."
      );
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return customers;
      }

      return customers.filter(
        (customer) =>
          (
            customer.full_name ?? ""
          )
            .toLowerCase()
            .includes(query) ||
          (
            customer.email ?? ""
          )
            .toLowerCase()
            .includes(query) ||
          (
            customer.phone ?? ""
          )
            .toLowerCase()
            .includes(query)
      );
    }, [customers, search]);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Customers
          </h1>

          <p className="mt-1 text-gray-500">
            View registered store customers.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Customers
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {customers.length}
            </p>
          </div>

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search name, email or phone..."
            className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black"
          />
        </div>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-gray-500">
              Loading customers...
            </div>
          ) : filteredCustomers.length ===
            0 ? (
            <div className="p-8 text-center text-gray-500">
              {customers.length === 0
                ? "No customers found."
                : "No matching customers."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Joined
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Customer ID
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map(
                    (customer) => (
                      <tr
                        key={customer.id}
                        className="border-b last:border-b-0"
                      >
                        <td className="px-6 py-5">
                          <div className="font-semibold text-gray-900">
                            {customer.full_name ||
                              "Unnamed customer"}
                          </div>
                        </td>

                        <td className="px-6 py-5 text-gray-700">
                          {customer.email ||
                            "—"}
                        </td>

                        <td className="px-6 py-5 text-gray-700">
                          {customer.phone ||
                            "—"}
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-500">
                          {customer.created_at
                            ? new Date(
                                customer.created_at
                              ).toLocaleDateString()
                            : "—"}
                        </td>

                        <td className="px-6 py-5">
                          <span className="font-mono text-xs text-gray-500">
                            {customer.id}
                          </span>
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