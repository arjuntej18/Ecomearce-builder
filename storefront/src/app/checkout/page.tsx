"use client";

// Handles checkout, OTP verification, order creation and Razorpay payment.

import {
  FormEvent,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

type Step = "details" | "otp";

type Pricing = {
  subtotal: number;
  discount: number;
  total: number;
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();

  const buyVariantId =
    searchParams.get("buyVariant");

  const buyQuantity = Math.max(
    1,
    Number(
      searchParams.get("quantity") ||
        "1"
    )
  );

  const isDirectBuy =
    Boolean(buyVariantId);

  const [step, setStep] =
    useState<Step>("details");

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

  const [otp, setOtp] = useState("");

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
          locationError
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

    try {
      const response = await fetch(
        "/api/auth/send-otp",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email: customer.email,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to send OTP."
        );
        return;
      }

      setMessage(
        "OTP sent. Check your email."
      );

      setStep("otp");
    } catch (err) {
      console.error(err);

      setError(
        "Unable to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const verificationResponse =
        await fetch(
          "/api/auth/verify-otp",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              email: customer.email,
              token: otp,
            }),
          }
        );

      const verificationData =
        await verificationResponse.json();

      if (
        !verificationResponse.ok
      ) {
        setError(
          verificationData.error ||
            "Invalid OTP."
        );
        return;
      }

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
        return;
      }

      setMessage(
        "Email verified. Creating your order..."
      );

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
          key:
            paymentData.keyId,

          amount:
            paymentData.amount,

          currency:
            paymentData.currency,

          name: "Your Store",

          description:
            `Order ${orderData.orderNumber}`,

          order_id:
            paymentData.razorpayOrderId,

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

              // Pass the actual order ID so
              // the confirmation page can load
              // expected_delivery_date from the database.
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
                "Unable to verify payment."
              );
            }
          },

          prefill: {
            name: customer.name,
            email: customer.email,
            contact:
              customer.phone,
          },

          theme: {
            color: "#000000",
          },
        };

        const Razorpay =
          (window as any).Razorpay;

        const razorpay =
          new Razorpay(options);

        razorpay.open();
      };

      script.onerror = () => {
        setError(
          "Unable to load Razorpay Checkout."
        );
      };

      document.body.appendChild(
        script
      );
    } catch (err) {
      console.error(err);

      setError(
        "Unable to complete checkout."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const {
      name,
      value,
    } = event.target;

    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Checkout
      </h1>

      {isDirectBuy && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
          Buying the selected product only.
        </div>
      )}

      {/* Coupon */}
      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-gray-900">
          Have a coupon?
        </h2>

        <div className="mt-3 flex gap-3">
          <input
            value={couponCode}
            onChange={(event) => {
              setCouponCode(
                event.target.value
                  .toUpperCase()
                  .replace(
                    /\s/g,
                    ""
                  )
              );

              setCouponMessage("");
              setCouponError("");
              setPricing(null);
            }}
            placeholder="Enter coupon code"
            className="min-w-0 flex-1 rounded-lg border border-gray-300 p-3 text-gray-900"
          />

          <button
            type="button"
            onClick={validateCoupon}
            disabled={couponLoading}
            className="rounded-lg border-2 border-green-600 bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:border-gray-400 disabled:bg-gray-400"
          >
            {couponLoading
              ? "Checking..."
              : "Apply"}
          </button>
        </div>

        {couponMessage && (
          <p className="mt-3 text-sm font-medium text-green-700">
            {couponMessage}
          </p>
        )}

        {couponError && (
          <p className="mt-3 text-sm text-red-600">
            {couponError}
          </p>
        )}

        {pricing && (
          <div className="mt-4 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <span>
                Subtotal
              </span>

              <span>
                ₹
                {pricing.subtotal.toFixed(
                  2
                )}
              </span>
            </div>

            <div className="flex justify-between text-green-700">
              <span>
                Discount
              </span>

              <span>
                -₹
                {pricing.discount.toFixed(
                  2
                )}
              </span>
            </div>

            <div className="flex justify-between border-t pt-2 text-base font-bold">
              <span>Total</span>

              <span>
                ₹
                {pricing.total.toFixed(
                  2
                )}
              </span>
            </div>
          </div>
        )}
      </section>

      {step === "details" && (
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
            className="w-full rounded border p-3"
            required
          />

          <input
            name="email"
            type="email"
            value={customer.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full rounded border p-3"
            required
          />

          <input
            name="phone"
            type="tel"
            value={customer.phone}
            onChange={handleChange}
            placeholder="Mobile number"
            className="w-full rounded border p-3"
            required
          />

          <button
            type="button"
            onClick={
              handleUseLocation
            }
            disabled={loading}
            className="w-full rounded border px-6 py-3"
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
            className="w-full rounded border p-3"
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
            className="w-full rounded border p-3"
          />

          <div className="grid gap-4 md:grid-cols-3">
            <input
              name="city"
              type="text"
              value={customer.city}
              onChange={handleChange}
              placeholder="City"
              className="w-full rounded border p-3"
              required
            />

            <input
              name="state"
              type="text"
              value={customer.state}
              onChange={handleChange}
              placeholder="State"
              className="w-full rounded border p-3"
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
              className="w-full rounded border p-3"
              inputMode="numeric"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border-2 border-green-600 bg-green-600 px-6 py-4 text-base font-semibold text-white shadow-sm hover:bg-green-700 disabled:border-gray-400 disabled:bg-gray-400"
          >
            {loading
              ? "Sending OTP..."
              : "Continue"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form
          onSubmit={handleOtpSubmit}
          className="mt-8 space-y-4"
        >
          <p>
            Enter the OTP sent to{" "}
            <strong>
              {customer.email}
            </strong>
            .
          </p>

          <input
            value={otp}
            onChange={(event) =>
              setOtp(
                event.target.value
              )
            }
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="Enter OTP"
            className="w-full rounded border p-3"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border-2 border-green-600 bg-green-600 px-6 py-4 text-base font-semibold text-white shadow-sm hover:bg-green-700 disabled:border-gray-400 disabled:bg-gray-400"
          >
            {loading
              ? "Verifying..."
              : "Verify Email"}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep("details");
              setOtp("");
              setError("");
              setMessage("");
            }}
            className="w-full rounded border px-6 py-3"
          >
            Back
          </button>
        </form>
      )}

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