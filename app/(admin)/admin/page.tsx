"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  Package,
  Users,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { getAuthHeaders, getAdminUser } from "@/src/lib/api/auth-token";
import { formatPrice } from "@/src/lib/store/catalog";

type DashboardData = {
  stats: {
    grossSales?: number;
    formattedGrossSales?: string;
    grossSalesGrowth?: string;
    totalOrders?: number;
    ordersCount?: number;
    ordersGrowth?: string;
    totalCustomers?: number;
    customersCount?: number;
    customersGrowth?: string;
    lowStockCount?: number;
  };
  salesSeries: Array<{ label: string; amount: string; pct: number }>;
  recentOrders: Array<{
    id: string;
    reference: string;
    customerName?: string;
    customerEmail?: string;
    total: number;
    orderStatus?: string;
    formattedDate?: string;
    paymentMethod?: string;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
  }>;
};

const initialEmptyData: DashboardData = {
  stats: {
    grossSales: 0,
    formattedGrossSales: "Rs. 0",
    grossSalesGrowth: "",
    totalOrders: 0,
    ordersCount: 0,
    ordersGrowth: "",
    totalCustomers: 0,
    customersCount: 0,
    customersGrowth: "",
    lowStockCount: 0,
  },
  salesSeries: [],
  recentOrders: [],
  lowStockProducts: [],
};

const quickActions = [
  { label: "Manage homepage banners", href: "/admin/banners" },
  { label: "Manage products & stock", href: "/admin/products" },
  {
    label: "Manage masters (Category, Tag, Color, Size)",
    href: "/admin/master",
  },
  { label: "Manage blog posts", href: "/admin/blogs" },
  { label: "Review all orders", href: "/admin/orders" },
  { label: "Create festive discount", href: "/admin/discounts" },
] as const;

export default function AdminPage() {
  const [data, setData] = useState<DashboardData>(initialEmptyData);
  const [adminName, setAdminName] = useState("Aditi");
  const [loading, setLoading] = useState(true);

  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  useEffect(() => {
    const user = getAdminUser();
    if (user?.name) {
      setAdminName(user.name);
    }

    fetch("/api/admin/dashboard", {
      headers: getAuthHeaders(false),
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((payload) => {
        if (payload?.success && payload?.data) {
          setData(payload.data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch admin dashboard", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const totalOrdersVal = data.stats.totalOrders ?? data.stats.ordersCount ?? 0;
  const totalCustomersVal =
    data.stats.totalCustomers ?? data.stats.customersCount ?? 0;
  const grossSalesVal =
    data.stats.formattedGrossSales ||
    (data.stats.grossSales
      ? `Rs. ${Number(data.stats.grossSales).toLocaleString("en-IN")}`
      : "Rs. 0");
  const lowStockVal =
    data.stats.lowStockCount ?? data.lowStockProducts?.length ?? 0;

  const statsCards = [
    {
      label: "Gross sales",
      value: grossSalesVal,
      change: data.stats.grossSalesGrowth || "Verified order revenue",
      icon: TrendingUp,
    },
    {
      label: "Orders",
      value: String(totalOrdersVal),
      change: data.stats.ordersGrowth || "All orders recorded",
      icon: Package,
    },
    {
      label: "Customers",
      value: String(totalCustomersVal),
      change: data.stats.customersGrowth || "Registered customers",
      icon: Users,
    },
    {
      label: "Low stock",
      value: String(lowStockVal),
      change: "Under 5 units left",
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="container mx-auto px-6 py-8 lg:px-10 lg:py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
            {formattedDate}
          </p>
          <h1 className="mt-2 font-serif text-4xl text-primary">
            Good day, {adminName}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Atelier Management Suite · Rajasthan Heritage Studio
          </p>
        </div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 bg-accent px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-accent/90"
        >
          Manage catalog <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map(({ label, value, change, icon: Icon }) => (
          <div key={label} className="border border-border bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{label}</p>
              <Icon size={16} className="text-accent" />
            </div>
            <p className="mt-3 font-serif text-3xl text-primary">
              {loading ? "..." : value}
            </p>
            <p className="mt-3 text-xs text-accent">{change}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="border border-border bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-primary">Sales overview</h2>
            <span className="text-xs text-muted-foreground">
              Last 30 days (live)
            </span>
          </div>
          <div className="mt-8 flex h-48 items-end gap-2 border-b border-l border-border px-3 pt-4">
            {data.salesSeries.length > 0 ? (
              data.salesSeries.map((bar) => (
                <div
                  key={bar.label}
                  title={`${bar.label}: ${bar.amount}`}
                  className="group relative flex h-full flex-1 items-end"
                >
                  <div
                    className="w-full bg-accent opacity-80 transition group-hover:opacity-100"
                    style={{ height: `${bar.pct}%` }}
                  />
                </div>
              ))
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                Loading sales trend...
              </div>
            )}
          </div>
          <div className="mt-2 flex justify-between px-3 text-[10px] text-muted-foreground">
            <span>Day 1</span>
            <span>Day 15</span>
            <span>Day 30</span>
          </div>
        </section>

        <section className="border border-border bg-white p-6">
          <h2 className="font-serif text-2xl text-primary">Quick actions</h2>
          <div className="mt-5 flex flex-col gap-3">
            {quickActions.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between border border-border px-4 py-3 text-sm transition hover:border-accent hover:text-accent"
              >
                <span>{item.label}</span>
                <ArrowRight size={14} />
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Real Recent Orders Section */}
      <section className="mt-6 border border-border bg-white p-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-accent" />
            <h2 className="font-serif text-2xl text-primary">Recent Orders</h2>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs text-accent underline underline-offset-4"
          >
            View all {totalOrdersVal} orders
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          {data.recentOrders.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-2.5 pr-4 font-semibold">Reference</th>
                  <th className="py-2.5 px-4 font-semibold">Customer</th>
                  <th className="py-2.5 px-4 font-semibold">Date</th>
                  <th className="py-2.5 px-4 font-semibold">Total</th>
                  <th className="py-2.5 px-4 font-semibold">Payment</th>
                  <th className="py-2.5 pl-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-background transition">
                    <td className="py-3 pr-4 font-semibold text-accent">
                      {order.reference}
                    </td>
                    <td className="py-3 px-4 font-medium text-primary">
                      {order.customerName || "Customer"}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {order.formattedDate || "Recent"}
                    </td>
                    <td className="py-3 px-4 font-semibold text-primary">
                      Rs. {Number(order.total).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {order.paymentMethod || "UPI"}
                    </td>
                    <td className="py-3 pl-4">
                      <span className="inline-block bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success uppercase tracking-wider">
                        {order.orderStatus || "Processing"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No orders placed yet.
            </p>
          )}
        </div>
      </section>

      {/* Real Low Stock Attention Section */}
      <section className="mt-6 border border-border bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-primary">
            Low stock attention ({data.lowStockProducts.length})
          </h2>
          <Link
            href="/admin/products"
            className="text-xs text-accent underline underline-offset-4"
          >
            Manage catalog stock
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {data.lowStockProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between border border-border bg-background px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-primary">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {product.category} · {formatPrice(product.price)}
                </p>
              </div>
              <span className="font-medium text-accent">
                {product.stock} left
              </span>
            </div>
          ))}
          {!data.lowStockProducts.length && (
            <p className="text-xs text-muted-foreground col-span-2 py-4">
              All inventory levels are healthy (no items below 5 units).
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
