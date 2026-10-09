"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "@/components/GoogleSignInButton";

type SessionUser = {
  authenticated: boolean;
  userId: string;
  role: string;
  name: string | null;
  email: string;
  picture: string | null;
};

type Order = {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  product_names: string;
  payment_status: string;
  created_at: string;
};

export default function AccountPage() {
  const router = useRouter();

  const [session, setSession] =
    useState<SessionUser | null>(null);

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [checkingSession, setCheckingSession] =
    useState(true);

  const [loadingOrders, setLoadingOrders] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    try {
      const response = await fetch(
        "/api/auth/session",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        setSession(null);
        setCheckingSession(false);
        return;
      }

      const data =
        await response.json();

      if (!data.authenticated) {
        setSession(null);
        setCheckingSession(false);
        return;
      }

      setSession(data);

      await loadOrders();
    } catch (error) {
      console.error(error);
      setSession(null);
    } finally {
      setCheckingSession(false);
    }
  }

  async function loadOrders() {
    setLoadingOrders(true);

    try {
      const response = await fetch(
        "/api/account/orders",
        {
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (response.ok) {
        setOrders(data.orders ?? []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error(error);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }

  async function logout() {
    setLoggingOut(true);
    setError("");

    try {
      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Logout failed."
        );
      }

      setSession(null);
      setOrders([]);
      setMessage(
        "You have been signed out."
      );

      router.refresh();
    } catch (error) {
      console.error(error);

      setError(
        "Unable to logout. Please try again."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  function handleGoogleSuccess() {
    setMessage(
      "You're signed in successfully."
    );

    setError("");

    setTimeout(() => {
      loadSession();
    }, 300);
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 pt-32 pb-12 text-gray-900">
        <div className="mx-auto max-w-4xl">
          <p className="text-gray-500">
            Loading account...
          </p>
        </div>
      </main>
    );
  }

  /*
   * NOT LOGGED IN
   */

  if (!session) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 pt-32 pb-12 text-gray-900">
        <div className="mx-auto max-w-lg">
          <div className="rounded-2xl bg-white p-8 shadow-sm">

            <h1 className="text-3xl font-bold">
              My Account
            </h1>

            <p className="mt-2 text-gray-500">
              Sign in securely with Google.
            </p>

            <div className="mt-8 flex justify-center">
              <GoogleSignInButton
                onSuccess={
                  handleGoogleSuccess
                }
              />
            </div>

            {message && (
              <p className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                {message}
              </p>
            )}

            {error && (
              <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="mt-8 border-t pt-6 text-sm text-gray-500">
              You can continue shopping and
              checkout without an account.
              Account login is completely
              optional.
            </div>

          </div>
        </div>
      </main>
    );
  }

  /*
   * LOGGED IN
   */

  return (
    <main className="min-h-screen bg-gray-50 px-4 pt-32 pb-12 text-gray-900">
      <div className="mx-auto max-w-4xl">

        {/* Account header */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-4">

              {session.picture ? (
                <img
                  src={session.picture}
                  alt={session.name ?? "Account"}
                  referrerPolicy="no-referrer"
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-xl font-semibold text-gray-600">
                  {(session.name ??
                    session.email ??
                    "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500">
                  Signed in as
                </p>

                <h1 className="text-2xl font-bold">
                  {session.name ||
                    "Google Account"}
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  {session.email}
                </p>
              </div>

            </div>

            {/* LOGOUT BUTTON */}

            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loggingOut
                ? "Logging out..."
                : "Logout"}
            </button>

          </div>

        </section>

        {/* Orders */}

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <h2 className="text-xl font-semibold">
              My Orders
            </h2>

            {loadingOrders && (
              <span className="text-sm text-gray-500">
                Loading...
              </span>
            )}

          </div>

          {orders.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-8 text-center">

              <p className="font-medium text-gray-700">
                No orders found for this account.
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Orders placed using this Google
                account will appear here.
              </p>

            </div>
          ) : (
            <div className="mt-6 divide-y">

              {orders.map((order) => (
                <button
  type="button"
  key={order.id}
  onClick={() =>
    router.push(`/account/orders/${order.id}`)
  }
  className="flex w-full flex-col justify-between gap-3 py-5 text-left transition hover:bg-gray-50 sm:flex-row sm:items-center"
>

                  <div>
                    <p className="font-semibold">
  {order.product_names}
</p>

<p className="mt-1 text-xs text-gray-400">
  {order.order_number}
</p>

                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(
                        order.created_at
                      ).toLocaleDateString(
                        "en-IN"
                      )}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">

                    <p className="font-bold">
                      ₹
                      {Number(
                        order.total_amount
                      ).toFixed(2)}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {order.payment_status}
                      {" · "}
                      {order.status}
                    </p>

                  </div>

                </button>
              ))}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}