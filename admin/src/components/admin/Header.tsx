"use client";

import { useEffect, useState } from "react";

type OrderNotification = {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  created_at: string;
};

const STORAGE_KEY = "seetha-vastram-last-order-check";

export default function Header({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    let firstCheck = true;

    async function checkOrders() {
      try {
        const storedSince = localStorage.getItem(STORAGE_KEY);

        const url = storedSince
          ? `/api/admin/order-notifications?since=${encodeURIComponent(
              storedSince
            )}`
          : "/api/admin/order-notifications";

        const response = await fetch(url, {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data: { orders: OrderNotification[] } =
          await response.json();

        if (!data.orders?.length) return;

        const latestOrder =
          data.orders[data.orders.length - 1];

        // First load: establish a baseline.
        if (firstCheck && !storedSince) {
          localStorage.setItem(
            STORAGE_KEY,
            latestOrder.created_at
          );
          firstCheck = false;
          return;
        }

        firstCheck = false;

        for (const order of data.orders) {
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            const notification = new Notification(
              "New Order — Seetha Vastram",
              {
                body: `${order.order_number}\n${order.customer_name} • ₹${order.total_amount.toLocaleString(
                  "en-IN"
                )}`,
              }
            );

            notification.onclick = () => {
              window.focus();
              window.location.href = "/admin/orders";
            };
          }
        }

        localStorage.setItem(
          STORAGE_KEY,
          latestOrder.created_at
        );
      } catch (error) {
        console.error(
          "Order notification check failed:",
          error
        );
      }
    }

    checkOrders();

    const interval = setInterval(
      checkOrders,
      5000
    );

    return () => clearInterval(interval);
  }, []);

  async function enableNotifications() {
    if (!("Notification" in window)) {
      alert("Browser notifications are not supported.");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  }

  return (
    <header className="sticky top-0 z-20 border-b bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Admin Dashboard
          </h2>
        </div>

        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 md:hidden"
        >
          Menu
        </button>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={enableNotifications}
            title={
              notificationPermission === "granted"
                ? "Browser notifications enabled"
                : "Enable browser notifications"
            }
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 0 1-5.714 0M18 8.25a6 6 0 0 0-12 0c0 7-3 7.5-3 9h18c0-1.5-3-2-3-9Zm-7.5 13.5h3"
              />
            </svg>
          </button>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
            A
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">
              Administrator
            </p>
            <p className="text-xs text-gray-500">
              Store Manager
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}