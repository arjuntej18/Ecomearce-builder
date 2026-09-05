"use client";

// Customer account with optional Supabase email OTP login and order history.

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

type Order = {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
};

type Step = "email" | "otp";

export default function AccountPage() {
  const router = useRouter();
  const supabase =
    createSupabaseBrowserClient();

  const [email, setEmail] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [step, setStep] =
    useState<Step>("email");

  const [loading, setLoading] =
    useState(false);

  const [checkingSession, setCheckingSession] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [userEmail, setUserEmail] =
    useState("");

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loadingOrders, setLoadingOrders] =
    useState(false);

  useEffect(() => {
    async function loadSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserEmail(
          user.email ?? ""
        );

        await syncCustomer();

        await loadOrders();
      }

      setCheckingSession(false);
    }

    loadSession();
  }, []);

  async function syncCustomer() {
    try {
      await fetch(
        "/api/account/sync",
        {
          method: "POST",
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function loadOrders() {
    setLoadingOrders(true);

    try {
      const response =
        await fetch(
          "/api/account/orders",
          {
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      if (response.ok) {
        setOrders(
          data.orders ?? []
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingOrders(false);
    }
  }

  async function sendOtp(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const {
        error: otpError,
      } =
        await supabase.auth.signInWithOtp({
          email: email
            .trim()
            .toLowerCase(),
          options: {
            shouldCreateUser: true,
          },
        });

      if (otpError) {
        setError(
          otpError.message
        );
        return;
      }

      setStep("otp");

      setMessage(
        "OTP sent. Check your email."
      );
    } catch (error) {
      console.error(error);

      setError(
        "Unable to send OTP."
      );
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const {
        data,
        error: verifyError,
      } =
        await supabase.auth.verifyOtp({
          email: email
            .trim()
            .toLowerCase(),
          token: otp.trim(),
          type: "email",
        });

      if (
        verifyError ||
        !data.user
      ) {
        setError(
          verifyError?.message ||
            "Invalid OTP."
        );
        return;
      }

      setUserEmail(
        data.user.email ?? ""
      );

      await syncCustomer();

      await loadOrders();

      setMessage(
        "You're signed in."
      );

      setOtp("");
    } catch (error) {
      console.error(error);

      setError(
        "Unable to verify OTP."
      );
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);

    await supabase.auth.signOut();

    setUserEmail("");
    setOrders([]);
    setStep("email");
    setEmail("");
    setOtp("");
    setMessage("");

    setLoading(false);

    router.refresh();
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          Loading account...
        </div>
      </main>
    );
  }

  if (!userEmail) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-12 text-gray-900">
        <div className="mx-auto max-w-lg">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold">
              My Account
            </h1>

            <p className="mt-2 text-gray-500">
              Sign in with your email. No password required.
            </p>

            {step === "email" ? (
              <form
                onSubmit={sendOtp}
                className="mt-8 space-y-4"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="Email address"
                  className="w-full rounded-lg border border-gray-300 p-3"
                  required
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-black px-4 py-3 font-semibold text-white disabled:opacity-50"
                >
                  {loading
                    ? "Sending OTP..."
                    : "Continue"}
                </button>
              </form>
            ) : (
              <form
                onSubmit={verifyOtp}
                className="mt-8 space-y-4"
              >
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(event) =>
                    setOtp(
                      event.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  placeholder="Enter OTP"
                  className="w-full rounded-lg border border-gray-300 p-3 text-center text-xl tracking-[0.4em]"
                  required
                />

                <button
                  type="submit"
                  disabled={
                    loading ||
                    otp.length !== 6
                  }
                  className="w-full rounded-lg bg-black px-4 py-3 font-semibold text-white disabled:opacity-50"
                >
                  {loading
                    ? "Verifying..."
                    : "Verify OTP"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                    setError("");
                    setMessage("");
                  }}
                  className="w-full text-sm text-gray-500 hover:text-black"
                >
                  Change email
                </button>
              </form>
            )}

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
              You can continue shopping and checkout without an account.
              Account login is completely optional.
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 text-gray-900">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-gray-500">
              Signed in as
            </p>

            <h1 className="text-3xl font-bold">
              My Account
            </h1>

            <p className="mt-1 text-gray-600">
              {userEmail}
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-100"
          >
            Logout
          </button>
        </div>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">
            My Orders
          </h2>

          {loadingOrders ? (
            <p className="mt-6 text-gray-500">
              Loading orders...
            </p>
          ) : orders.length === 0 ? (
            <p className="mt-6 text-gray-500">
              No orders found for this account.
            </p>
          ) : (
            <div className="mt-6 divide-y">
              {orders.map(
                (order) => (
                  <div
                    key={order.id}
                    className="flex flex-col justify-between gap-3 py-5 sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="font-semibold">
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
                        {order.payment_status} ·{" "}
                        {order.status}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}