// app/admin/page.tsx

import { redirect } from "next/navigation";
import { verifyAdmin } from "@/lib/verifyAdmin";

const IST_TIME_ZONE = "Asia/Kolkata";
const IST_OFFSET_MS =
  5 * 60 * 60 * 1000 + 30 * 60 * 1000;

type CalendarDate = {
  year: number;
  month: number;
  day: number;
};

type CalendarMonth = {
  year: number;
  month: number;
};

type OrderChartRow = {
  id: string;
  created_at: string;
  total_amount: number | null;
  payment_status: string | null;
  status: string | null;
};

type DashboardData = {
  products: number;
  orders: number;
  paidOrders: number;
  customers: number;
  inventoryItems: number;
  pendingOrders: number;
  chartOrders: OrderChartRow[];
};

function getISTCalendarDate(
  date: Date
): CalendarDate {
  const parts = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: IST_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter(
        (part) =>
          part.type !== "literal"
      )
      .map((part) => [
        part.type,
        Number(part.value),
      ])
  ) as {
    year: number;
    month: number;
    day: number;
  };

  return values;
}

function addCalendarDays(
  date: CalendarDate,
  days: number
): CalendarDate {
  const value = new Date(
    Date.UTC(
      date.year,
      date.month - 1,
      date.day
    )
  );

  value.setUTCDate(
    value.getUTCDate() + days
  );

  return {
    year: value.getUTCFullYear(),
    month: value.getUTCMonth() + 1,
    day: value.getUTCDate(),
  };
}

function addCalendarMonths(
  date: CalendarMonth,
  months: number
): CalendarMonth {
  const value = new Date(
    Date.UTC(
      date.year,
      date.month - 1 + months,
      1
    )
  );

  return {
    year: value.getUTCFullYear(),
    month: value.getUTCMonth() + 1,
  };
}

function istMidnightToUTC(
  date: CalendarDate
): Date {
  return new Date(
    Date.UTC(
      date.year,
      date.month - 1,
      date.day
    ) - IST_OFFSET_MS
  );
}

function isCancelled(
  status: string | null | undefined
): boolean {
  return (
    String(status ?? "")
      .trim()
      .toLowerCase() === "cancelled"
  );
}

export default async function AdminDashboard() {
  // --------------------------------------------------
  // AUTHENTICATION
  // --------------------------------------------------

  const admin = await verifyAdmin();

if (!admin) {
  redirect("/login");
}
  // --------------------------------------------------
  // FETCH LOCAL POSTGRESQL DASHBOARD DATA
  // --------------------------------------------------

  const BACKEND_URL =
    process.env.BACKEND_URL ??
    "http://backend:4000";

  const response = await fetch(
    `${BACKEND_URL}/api/admin/dashboard`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Unable to load dashboard data."
    );
  }

  const dashboard =
    (await response.json()) as DashboardData;

  const {
    products,
    orders,
    paidOrders,
    customers,
    inventoryItems,
    pendingOrders,
    chartOrders,
  } = dashboard;

  // --------------------------------------------------
  // DATE HELPERS
  // --------------------------------------------------

  const now = new Date();

  const today = getISTCalendarDate(
    now
  );

  const startOfToday =
    istMidnightToUTC(today);

  const startOfTomorrow =
    istMidnightToUTC(
      addCalendarDays(today, 1)
    );

  // --------------------------------------------------
  // TODAY'S ORDERS / REVENUE
  // --------------------------------------------------

  const todayOrders =
    chartOrders.filter((order) => {
      const orderDate =
        new Date(order.created_at);

      return (
        orderDate >= startOfToday &&
        orderDate < startOfTomorrow
      );
    });

  const todayRevenue =
    todayOrders.reduce(
      (total, order) => {
        const paid =
          String(
            order.payment_status ?? ""
          )
            .trim()
            .toLowerCase() === "paid";

        if (
          !paid ||
          isCancelled(order.status)
        ) {
          return total;
        }

        return (
          total +
          Number(
            order.total_amount ?? 0
          )
        );
      },
      0
    );

  // --------------------------------------------------
  // CHART RANGE
  // --------------------------------------------------

  const currentMonth: CalendarMonth = {
    year: today.year,
    month: today.month,
  };

  const chartStartMonth =
    addCalendarMonths(
      currentMonth,
      -11
    );

  const chartStart =
    istMidnightToUTC({
      year: chartStartMonth.year,
      month: chartStartMonth.month,
      day: 1,
    });

  const nextMonth =
    addCalendarMonths(
      currentMonth,
      1
    );

  const chartEnd =
    istMidnightToUTC({
      year: nextMonth.year,
      month: nextMonth.month,
      day: 1,
    });

  const chartRangeOrders =
    chartOrders.filter((order) => {
      const orderDate =
        new Date(order.created_at);

      return (
        orderDate >= chartStart &&
        orderDate < chartEnd
      );
    });

  const nonCancelledChartOrders =
    chartRangeOrders.filter(
      (order) =>
        !isCancelled(order.status)
    );

  // --------------------------------------------------
  // LAST 5 WEEKS
  // --------------------------------------------------

  const weeklyData: {
    label: string;
    count: number;
  }[] = [];

  const weeklyLabelFormatter =
    new Intl.DateTimeFormat(
      "en-IN",
      {
        timeZone: IST_TIME_ZONE,
        day: "2-digit",
        month: "short",
      }
    );

  for (
    let i = 4;
    i >= 0;
    i--
  ) {
    const endDate =
      addCalendarDays(
        today,
        -i * 7
      );

    const startDate =
      addCalendarDays(
        endDate,
        -6
      );

    const start =
      istMidnightToUTC(
        startDate
      );

    const endExclusive =
      istMidnightToUTC(
        addCalendarDays(
          endDate,
          1
        )
      );

    const count =
      nonCancelledChartOrders.filter(
        (order) => {
          const orderDate =
            new Date(
              order.created_at
            );

          return (
            orderDate >= start &&
            orderDate < endExclusive
          );
        }
      ).length;

    weeklyData.push({
      label: `${weeklyLabelFormatter.format(
        start
      )} – ${weeklyLabelFormatter.format(
        istMidnightToUTC(endDate)
      )}`,
      count,
    });
  }

  const maxWeeklyOrders =
    Math.max(
      ...weeklyData.map(
        (week) => week.count
      ),
      1
    );

  // --------------------------------------------------
  // LAST 12 MONTHS
  // --------------------------------------------------

  const monthlyData: {
    label: string;
    count: number;
  }[] = [];

  const monthlyLabelFormatter =
    new Intl.DateTimeFormat(
      "en-IN",
      {
        timeZone: IST_TIME_ZONE,
        month: "short",
        year: "numeric",
      }
    );

  for (
    let i = 11;
    i >= 0;
    i--
  ) {
    const month =
      addCalendarMonths(
        currentMonth,
        -i
      );

    const nextMonthForPeriod =
      addCalendarMonths(
        month,
        1
      );

    const start =
      istMidnightToUTC({
        year: month.year,
        month: month.month,
        day: 1,
      });

    const endExclusive =
      istMidnightToUTC({
        year:
          nextMonthForPeriod.year,
        month:
          nextMonthForPeriod.month,
        day: 1,
      });

    const count =
      nonCancelledChartOrders.filter(
        (order) => {
          const orderDate =
            new Date(
              order.created_at
            );

          return (
            orderDate >= start &&
            orderDate < endExclusive
          );
        }
      ).length;

    monthlyData.push({
      label:
        monthlyLabelFormatter.format(
          start
        ),
      count,
    });
  }

  const maxMonthlyOrders =
    Math.max(
      ...monthlyData.map(
        (month) =>
          month.count
      ),
      1
    );

  // --------------------------------------------------
  // RETURN DASHBOARD
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>

          <p className="mt-2 text-gray-600">
            Store overview and performance
          </p>
        </div>

        {/* STATISTICS */}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Today's Orders */}

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Today's Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {todayOrders.length}
            </p>
          </div>

          {/* Today's Revenue */}

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Today's Revenue
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              ₹{todayRevenue.toFixed(2)}
            </p>
          </div>

          {/* Pending Orders */}

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Pending Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {pendingOrders}
            </p>
          </div>

          {/* Total Orders */}

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {orders}
            </p>
          </div>

          {/* Paid Orders */}

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Paid Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {paidOrders}
            </p>
          </div>

          {/* Customers */}

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Customers
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {customers}
            </p>
          </div>

          {/* Products */}

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Products
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {products}
            </p>
          </div>

          {/* Inventory Items */}

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Inventory Items
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {inventoryItems}
            </p>
          </div>
        </div>

        {/* 5 WEEK ORDERS GRAPH */}

        <section className="mt-10 rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900">
              Orders — Last 5 Weeks
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Non-cancelled orders by 7-day period
            </p>
          </div>

          <div className="flex h-72 items-end gap-4 border-b border-gray-200 px-2">
            {weeklyData.map(
              (week) => {
                const height =
                  (week.count /
                    maxWeeklyOrders) *
                  100;

                return (
                  <div
                    key={week.label}
                    className="flex h-full flex-1 flex-col justify-end"
                  >
                    <div className="mb-2 text-center text-sm font-semibold text-gray-700">
                      {week.count}
                    </div>

                    <div
                      className="w-full rounded-t-lg bg-gray-900 transition-all"
                      style={{
                        height: `${Math.max(
                          height,
                          3
                        )}%`,
                      }}
                    />

                    <div className="mt-3 text-center text-xs text-gray-500">
                      {week.label}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </section>

        {/* 12 MONTH ORDERS GRAPH */}

        <section className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900">
              Orders — Last 12 Months
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Non-cancelled orders by calendar month
            </p>
          </div>

          <div className="flex h-72 items-end gap-2 border-b border-gray-200 px-2 sm:gap-4">
            {monthlyData.map(
              (month) => {
                const height =
                  (month.count /
                    maxMonthlyOrders) *
                  100;

                return (
                  <div
                    key={month.label}
                    className="flex h-full flex-1 flex-col justify-end"
                  >
                    <div className="mb-2 text-center text-xs font-semibold text-gray-700">
                      {month.count}
                    </div>

                    <div
                      className="w-full rounded-t-lg bg-gray-700 transition-all"
                      style={{
                        height: `${Math.max(
                          height,
                          3
                        )}%`,
                      }}
                    />

                    <div className="mt-3 text-center text-xs text-gray-500">
                      {month.label}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </section>
      </div>
    </main>
  );
}