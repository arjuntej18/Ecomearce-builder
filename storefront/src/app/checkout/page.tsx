"use client";

// Handles checkout, order creation and Razorpay payment.

import {
  ChangeEvent,
  FormEvent,
  Suspense,
  useEffect,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import GoogleSignInButton from "@/components/GoogleSignInButton";
type Pricing = {
  subtotal: number;
  discount: number;
  total: number;
};

function CheckoutPageContent() {
  const searchParams = useSearchParams();

  const [customerLocation, setCustomerLocation] =
    useState<{
      latitude: number;
      longitude: number;
      accuracy: number;
    } | null>(null);

  const buyVariantId =
    searchParams.get("buyVariant") ?? "";

  const initialQuantity = Math.max(
  1,
  Number(searchParams.get("quantity") || "1")
);

const [buyQuantity, setBuyQuantity] =
  useState(initialQuantity);
const [availableStock, setAvailableStock] =
  useState<number | null>(null);

useEffect(() => {
  if (!buyVariantId) return;

  async function loadStock() {
    try {
      const response = await fetch(
  `/api/inventory/${encodeURIComponent(
    buyVariantId
  )}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load stock");
      }

      const data = await response.json();

      setAvailableStock(
        Number(data.quantity ?? 0)
      );
    } catch (error) {
      console.error(
        "Failed to load checkout stock:",
        error
      );

      setAvailableStock(null);
    }
  }

  loadStock();
}, [buyVariantId]);


  const isDirectBuy =
    Boolean(buyVariantId);



  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [customer, setCustomer] =
    useState({
      name: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
    });

const [isAuthenticated, setIsAuthenticated] =
  useState(false);

const [authLoading, setAuthLoading] =
  useState(true);

useEffect(() => {
  async function loadSession() {
    try {
      const response = await fetch(
        "/api/auth/session",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        setIsAuthenticated(false);
        return;
      }

      const session =
        await response.json();

      if (
        session?.authenticated === true &&
        session?.role === "customer"
      ) {
        setIsAuthenticated(true);

        setCustomer((prev) => ({
          ...prev,
          name:
            session.name ??
            prev.name,
          email:
            session.email ??
            prev.email,
        }));
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error(
        "Session loading error:",
        error
      );

      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  }

  loadSession();
}, []);


  const [couponCode, setCouponCode] =
    useState("");

  const [couponLoading, setCouponLoading] =
    useState(false);

  const [couponMessage, setCouponMessage] =
    useState("");

  const [couponError, setCouponError] =
    useState("");

  const [pricing, setPricing] =
    useState<Pricing | null>(null);

  async function validateCoupon() {
    const code = couponCode
      .trim()
      .toUpperCase();

    if (!code) {
      setCouponError(
        "Enter a coupon code."
      );
      return;
    }

    setCouponLoading(true);
    setCouponError("");
    setCouponMessage("");
    setPricing(null);

    try {
      const sessionId =
        localStorage.getItem(
          "guest_cart_session_id"
        );
      const sessionResponse = await fetch(
  "/api/auth/session",
  {
    method: "GET",
    cache: "no-store",
  }
);

if (!sessionResponse.ok) {
  setError(
    "Please sign in with Google before placing your order."
  );
  setLoading(false);
  return;
}

const sessionData =
  await sessionResponse.json();

if (
  !sessionData?.authenticated ||
  sessionData.role !== "customer"
){
  setError(
    "Please sign in with Google before placing your order."
  );
  setLoading(false);
  return;
}
      const response = await fetch(
        "/api/coupons/validate",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            code,
            sessionId: isDirectBuy
              ? null
              : sessionId,
            variantId: isDirectBuy
              ? buyVariantId
              : null,
            quantity: isDirectBuy
              ? buyQuantity
              : 1,
              location: customerLocation,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setCouponError(
          data.error ||
            "Invalid coupon."
        );
        return;
      }

      setPricing({
        subtotal: Number(
          data.subtotal
        ),
        discount: Number(
          data.discount
        ),
        total: Number(
          data.total
        ),
      });

      setCouponMessage(
        `Coupon ${data.code} applied.`
      );
    } catch (err) {
      console.error(err);

      setCouponError(
        "Unable to apply coupon."
      );
    } finally {
      setCouponLoading(false);
    }
  }

  async function handleUseLocation() {
    if (!navigator.geolocation) {
      setError(
        "Location is not supported by this browser."
      );
      return;
    }

    setLoading(true);
    setError("");
    setMessage(
      "Getting your location..."
    );

    navigator.geolocation.getCurrentPosition(
      async (position) => {

        const {
          latitude,
          longitude,
        } = position.coords;
        setCustomerLocation({
  latitude,
  longitude,
  accuracy: position.coords.accuracy,
});

        try {
          const response =
            await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
              {
                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          if (!response.ok) {
            throw new Error(
              "Unable to find address."
            );
          }

          const data =
            await response.json();

          const address =
            data.address ?? {};

          setCustomer((prev) => ({
            ...prev,

            addressLine1:
              address.road ||
              address.neighbourhood ||
              address.suburb ||
              "",

            city:
              address.city ||
              address.town ||
              address.village ||
              address.municipality ||
              "",

            state:
              address.state || "",

            postalCode:
              address.postcode || "",

            country: "India",
          }));

          setMessage(
            "Location found. Please review your address."
          );
        } catch (err) {
          console.error(err);

          setError(
            "Could not convert your location into an address."
          );

          setMessage("");
        } finally {
          setLoading(false);
        }
      },
      (locationError) => {
  console.error(
    "Geolocation error:",
    locationError.code,
    locationError.message
  );
        setLoading(false);
        setMessage("");

        if (
          locationError.code ===
          locationError.PERMISSION_DENIED
        ) {
          setError(
            "Location permission was denied."
          );
        } else {
          setError(
            "Unable to get your current location."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }

  async function handleDetailsSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");
    if (!isAuthenticated) {
  setError(
    "Please sign in with Google before placing your order."
  );
  setLoading(false);
  return;
}
if (
  isDirectBuy &&
  availableStock !== null &&
  (availableStock <= 0 ||
    buyQuantity > availableStock)
) {
  setError(
    availableStock <= 0
      ? "This product is out of stock."
      : `Only ${availableStock} item${
          availableStock === 1 ? "" : "s"
        } available.`
  );
  setLoading(false);
  return;
}
    try {
      const sessionId =
        localStorage.getItem(
          "guest_cart_session_id"
        );

      if (
        !isDirectBuy &&
        !sessionId
      ) {
        setError(
          "Cart session not found."
        );
        setLoading(false);
        return;
      }

      setMessage(
        "Creating your order..."
      );


      console.log("ORDER LOCATION:", customerLocation);
      const orderResponse =
        await fetch(
          "/api/orders",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              sessionId: isDirectBuy
                ? null
                : sessionId,

              variantId: isDirectBuy
                ? buyVariantId
                : null,

              quantity: isDirectBuy
                ? buyQuantity
                : undefined,
              location: customerLocation,
              couponCode:
                couponCode
                  .trim()
                  .toUpperCase() ||
                null,

              customerName:
                customer.name,

              customerEmail:
                customer.email,

              customerPhone:
                customer.phone,

              addressLine1:
                customer.addressLine1,

              addressLine2:
                customer.addressLine2 ||
                null,

              city: customer.city,
              state: customer.state,

              postalCode:
                customer.postalCode,

              country:
                customer.country,
            }),
          }
        );

      const orderData =
        await orderResponse.json();
        console.log("ORDER RESPONSE:", {
  status: orderResponse.status,
  data: orderData,
});
      if (!orderResponse.ok) {
        setError(
          orderData.error ||
            "Unable to create order."
        );
        return;
      }

      setMessage(
        "Order created. Starting payment..."
      );

      const paymentResponse =
        await fetch(
          "/api/payments/create-order",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              orderId:
                orderData.orderId,
            }),
          }
        );

      const paymentData =
        await paymentResponse.json();

      if (!paymentResponse.ok) {
        setError(
          paymentData.error ||
            "Unable to start payment."
        );
        return;
      }

      const script =
        document.createElement(
          "script"
        );

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.async = true;

      script.onload = () => {
        const options = {
          key: paymentData.keyId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          name: "Your Store",
          description: `Order ${orderData.orderNumber}`,
          order_id: paymentData.razorpayOrderId,
          handler: async (
            response: {
              razorpay_payment_id: string;
              razorpay_order_id: string;
              razorpay_signature: string;
            }
          ) => {
            setMessage(
              "Payment completed. Verifying payment..."
            );

            setError("");

            try {
              const verifyResponse =
                await fetch(
                  "/api/payments/verify",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type":
                        "application/json",
                    },
                    body: JSON.stringify({
                      orderId:
                        orderData.orderId,

                      razorpayOrderId:
                        response.razorpay_order_id,

                      razorpayPaymentId:
                        response.razorpay_payment_id,

                      razorpaySignature:
                        response.razorpay_signature,
                    }),
                  }
                );

              const verifyData =
                await verifyResponse.json();

              if (!verifyResponse.ok) {
                setError(
                  verifyData.error ||
                    "Payment verification failed."
                );
                return;
              }

              const invoiceResponse =
                await fetch(
                  "/api/orders/invoice",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type":
                        "application/json",
                    },
                    body: JSON.stringify({
                      orderId:
                        orderData.orderId,
                    }),
                  }
                );

              const invoiceData =
                await invoiceResponse.json();

              if (!invoiceResponse.ok) {
                setError(
                  invoiceData.error ||
                    "Payment succeeded, but invoice creation failed."
                );
                return;
              }

              if (
                !isDirectBuy &&
                sessionId
              ) {
                await fetch(
                  "/api/cart",
                  {
                    method: "DELETE",
                    headers: {
                      "Content-Type":
                        "application/json",
                    },
                    body: JSON.stringify({
                      sessionId,
                    }),
                  }
                );
              }

              window.location.href =
                `/order-confirmation?orderId=${encodeURIComponent(
                  orderData.orderId
                )}&order=${encodeURIComponent(
                  orderData.orderNumber
                )}&invoice=${encodeURIComponent(
                  invoiceData.invoiceNumber
                )}`;
            } catch (err) {
              console.error(err);

              setError(
                "Unable to complete checkout."
              );
            } finally {
              setLoading(false);
            }
          },
        };

        const razorpay = new (
          window as unknown as {
            Razorpay: new (options: unknown) => {
              open: () => void;
            };
          }
        ).Razorpay(options);
        razorpay.open();
      };

      document.body.appendChild(script);
    } catch (err) {
      console.error(err);

      setError("Unable to complete checkout.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const {
      name,
      value,
    } = event.currentTarget;

    setCustomer((prev: typeof customer) => ({
      ...prev,
      [name]: value,
    }));
  }

  return (
<main className="min-h-screen bg-[#0b0b0b] px-4 pb-28 pt-[100px] text-white sm:px-6 sm:pb-12 sm:pt-8">
        <h1 className="font-serif text-5xl font-medium tracking-tight text-black sm:text-6xl">
  Checkout
</h1>

    {isDirectBuy && (
  <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-white/70">
          Selected product
        </p>

        <p className="mt-1 text-base font-semibold text-white">
          Quantity
        </p>
      </div>

      <div className="flex items-center overflow-hidden rounded-xl border border-white/15 bg-white/[0.08]">
        <button
          type="button"
          onClick={() =>
            setBuyQuantity((prev) =>
              Math.max(1, prev - 1)
            )
          }
          disabled={buyQuantity <= 1}
          className="flex h-11 w-11 items-center justify-center text-xl text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          −
        </button>

        <span className="flex h-11 min-w-12 items-center justify-center border-x border-white/10 text-base font-semibold text-white">
          {buyQuantity}
        </span>

        <button
          type="button"
          onClick={() =>
            setBuyQuantity((prev) =>
              Math.min(
                availableStock ?? prev,
                prev + 1
              )
            )
          }
          disabled={
            availableStock !== null &&
            buyQuantity >= availableStock
          }
          className="flex h-11 w-11 items-center justify-center text-xl text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>

    <div className="mt-3 flex items-center justify-between text-sm">
      <span className="text-white/50">
        Available stock
      </span>

      <span
        className={
          availableStock === 0
            ? "font-medium text-red-400"
            : "font-medium text-green-400"
        }
      >
        {availableStock === null
          ? "Checking..."
          : availableStock === 0
          ? "Out of stock"
          : `${availableStock} available`}
      </span>
    </div>
  </section>
)}


{/* Coupon */}
<section className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
  <h2 className="font-medium tracking-wide text-white">
    Have a coupon?
  </h2>

  <div className="mt-4 flex gap-3">
    <input
      value={couponCode}
      onChange={(event) => {
        setCouponCode(
          event.target.value
            .toUpperCase()
            .replace(/\s/g, "")
        );

        setCouponMessage("");
        setCouponError("");
        setPricing(null);
      }}
      placeholder="Enter coupon code"
      className="min-w-0 flex-1 rounded-[18px] border border-white/15 bg-white/[0.08] px-4 py-3.5 text-white placeholder:text-white/40 outline-none backdrop-blur-xl transition focus:border-white/35 focus:bg-white/[0.12]"
    />

    <button
      type="button"
      onClick={validateCoupon}
      disabled={couponLoading}
      className="rounded-[999px] border border-white/20 bg-white/[0.10] px-7 py-3.5 font-semibold text-white backdrop-blur-xl transition hover:bg-white/[0.16] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {couponLoading
        ? "Checking..."
        : "Apply"}
    </button>
  </div>

  {couponMessage && (
    <p className="mt-3 text-sm font-medium text-green-400">
      {couponMessage}
    </p>
  )}

  {couponError && (
    <p className="mt-3 text-sm text-red-400">
      {couponError}
    </p>
  )}

  {pricing && (
    <div className="mt-5 space-y-3 border-t border-white/10 pt-4 text-sm text-white/75">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>
          ₹{pricing.subtotal.toFixed(2)}
        </span>
      </div>

      <div className="flex justify-between text-green-400">
  <span>Discount</span>
  <span>
    -₹{pricing.discount.toFixed(2)}
  </span>
</div>

<div className="flex justify-between text-sm text-green-300">
  <span>You saved</span>
  <span>
    {pricing.subtotal > 0
      ? `${((pricing.discount / pricing.subtotal) * 100).toFixed(0)}% OFF`
      : "0% OFF"}
  </span>
</div>

      <div className="flex justify-between border-t border-white/10 pt-3 text-base font-semibold text-white">
        <span>Total</span>
        <span>
          ₹{pricing.total.toFixed(2)}
        </span>
      </div>
    </div>
  )}
</section>


{!authLoading && !isAuthenticated && (
  <div className="mb-6 rounded-xl border border-green-400/20 bg-green-500/5 p-5">
    <p className="mb-4 text-sm text-neutral-300">
      Sign in with Google to continue checkout.
    </p>

    <GoogleSignInButton
      onSuccess={() => {
        window.location.reload();
      }}
    />
  </div>
)}



      <form
          onSubmit={
            handleDetailsSubmit
          }
          className="mt-8 space-y-4"
        >
          <input
            name="name"
            type="text"
            value={customer.name}
            onChange={handleChange}
            placeholder="Full name"
            className="w-full rounded-[18px] border border-white/15 bg-white/10 p-4 text-white placeholder:text-white/45 backdrop-blur-xl outline-none transition focus:border-white/35 focus:bg-white/15"
            required
          />

          <input
  name="email"
  type="email"
  value={customer.email}
  onChange={
    isAuthenticated
      ? undefined
      : handleChange
  }
  placeholder="Email"
  readOnly={isAuthenticated}
  className={`w-full rounded-[18px] border border-white/15 p-4 text-white placeholder:text-white/45 backdrop-blur-xl outline-none transition ${
    isAuthenticated
      ? "cursor-not-allowed bg-white/[0.04] opacity-80"
      : "bg-white/10 backdrop-blur-xl focus:border-white/35 focus:bg-white/15"
  }`}
  required
/>

          <input
            name="phone"
            type="tel"
            value={customer.phone}
            onChange={handleChange}
            placeholder="Mobile number"
            className="w-full rounded-[18px] border border-white/15 bg-white/10 p-4 text-white placeholder:text-white/45 backdrop-blur-xl outline-none transition focus:border-white/35 focus:bg-white/15"
            required
          />

          <button
            type="button"
            onClick={
              handleUseLocation
            }
            disabled={loading}
            className="w-full rounded-[18px] border border-white/15 bg-white/10 p-4 text-white backdrop-blur-xl outline-none transition focus:border-white/35 focus:bg-white/15"
          >
            {loading
              ? "Getting location..."
              : "Use my current location"}
          </button>

          <input
            name="addressLine1"
            type="text"
            value={
              customer.addressLine1
            }
            onChange={handleChange}
            placeholder="Address line 1"
            className="w-full rounded-[18px] border border-white/15 bg-white/10 p-4 text-white placeholder:text-white/45 backdrop-blur-xl outline-none transition focus:border-white/35 focus:bg-white/15"
            required
          />

          <input
            name="addressLine2"
            type="text"
            value={
              customer.addressLine2
            }
            onChange={handleChange}
            placeholder="Address line 2 (optional)"
            className="w-full rounded-[18px] border border-white/15 bg-white/10 p-4 text-white placeholder:text-white/45 backdrop-blur-xl outline-none transition focus:border-white/35 focus:bg-white/15"
          />

          <div className="grid gap-4 md:grid-cols-3">
            <input
              name="city"
              type="text"
              value={customer.city}
              onChange={handleChange}
              placeholder="City"
              className="w-full rounded-[18px] border border-white/15 bg-white/10 p-4 text-white placeholder:text-white/45 backdrop-blur-xl outline-none transition focus:border-white/35 focus:bg-white/15"
              required
            />

            <input
              name="state"
              type="text"
              value={customer.state}
              onChange={handleChange}
              placeholder="State"
              className="w-full rounded-[18px] border border-white/15 bg-white/10 p-4 text-white placeholder:text-white/45 backdrop-blur-xl outline-none transition focus:border-white/35 focus:bg-white/15"
              required
            />

            <input
              name="postalCode"
              type="text"
              value={
                customer.postalCode
              }
              onChange={handleChange}
              placeholder="Postal code"
              className="w-full rounded-[18px] border border-white/15 bg-white/10 p-4 text-white placeholder:text-white/45 backdrop-blur-xl outline-none transition focus:border-white/35 focus:bg-white/15"
              inputMode="numeric"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
className="w-full rounded-[999px] border border-green-400/30 bg-green-500/80 px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-[0_8px_30px_rgba(34,197,94,0.22)] backdrop-blur-xl transition hover:bg-green-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-neutral-600">
            {loading
              ? "Processing..."
              : "Continue"}
          </button>
        </form>

      {message && (
        <p className="mt-4 rounded border p-3">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-4 rounded border border-red-300 p-3 text-red-600">
          {error}
        </p>
      )}
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl p-6">
          Loading checkout...
        </main>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
