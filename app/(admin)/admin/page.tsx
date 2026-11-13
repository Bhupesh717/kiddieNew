import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatPrice, products } from "@/src/lib/store/catalog";

export const metadata: Metadata = {
  title: "Admin Overview",
  description: "Majisavesh atelier administration dashboard.",
};

const lowStockProducts = products.filter((product) => product.stock < 5);

const stats = [
  ["Gross sales", "Rs. 4,82,650", "+18.4% vs last month"],
  ["Orders", "128", "+12.6% vs last month"],
  ["Customers", "1,842", "+8.1% vs last month"],
  ["Low stock", String(lowStockProducts.length), "Under 5 units left"],
] as const;

const salesSeries = [
  { label: "D1", amount: "Rs. 24,200", pct: 42 },
  { label: "D4", amount: "Rs. 33,400", pct: 58 },
  { label: "D7", amount: "Rs. 26,000", pct: 45 },
  { label: "D10", amount: "Rs. 41,800", pct: 72 },
  { label: "D13", amount: "Rs. 35,600", pct: 62 },
  { label: "D16", amount: "Rs. 49,400", pct: 86 },
  { label: "D19", amount: "Rs. 42,900", pct: 74 },
  { label: "D22", amount: "Rs. 55,200", pct: 96 },
  { label: "D25", amount: "Rs. 39,100", pct: 68 },
  { label: "D27", amount: "Rs. 47,300", pct: 82 },
  { label: "D29", amount: "Rs. 52,500", pct: 91 },
  { label: "D30", amount: "Rs. 57,800", pct: 100 },
];

const quickActions = [
  { label: "Manage homepage banners", href: "/admin/banners" },
  { label: "Manage products & stock", href: "/admin/products" },
  { label: "Manage masters (Category, Fabric, Tag)", href: "/admin/master" },
  { label: "Manage blog posts", href: "/admin/blogs" },
  { label: "Review recent orders", href: "/admin/orders" },
  { label: "Create festive discount", href: "/admin/discounts" },
] as const;

export default function AdminPage() {
  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="container mx-auto px-6 py-8 lg:px-10 lg:py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[#dfd8cf] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a44436]">
            {formattedDate}
          </p>
          <h1 className="mt-2 font-serif text-4xl text-[#39231e]">
            Good day, Aditi
          </h1>
          <p className="mt-2 text-sm text-[#776f68]">
            Here is what is happening across your Majisavesh storefront today.
          </p>
        </div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 bg-[#8d3428] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#70281f]"
        >
          Manage catalog <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, change]) => (
          <div key={label} className="border border-[#dfd8cf] bg-white p-5">
            <p className="text-xs text-[#776f68]">{label}</p>
            <p className="mt-3 font-serif text-3xl text-[#39231e]">{value}</p>
            <p className="mt-3 text-xs text-[#a44436]">{change}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="border border-[#dfd8cf] bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-[#39231e]">
              Sales overview
            </h2>
            <span className="text-xs text-[#776f68]">Last 30 days (demo)</span>
          </div>
          <div className="mt-8 flex h-48 items-end gap-2 border-b border-l border-[#dfd8cf] px-3 pt-4">
            {salesSeries.map((bar) => (
              <div
                key={bar.label}
                title={`${bar.label}: ${bar.amount}`}
                className="group relative flex h-full flex-1 items-end"
              >
                <div
                  className="w-full bg-[#a44436] opacity-80 transition group-hover:opacity-100"
                  style={{ height: `${bar.pct}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between px-3 text-[10px] text-[#9b8d80]">
            <span>Day 1</span>
            <span>Day 15</span>
            <span>Day 30</span>
          </div>
        </section>

        <section className="border border-[#dfd8cf] bg-white p-6">
          <h2 className="font-serif text-2xl text-[#39231e]">Quick actions</h2>
          <div className="mt-5 flex flex-col gap-3">
            {quickActions.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between border border-[#dfd8cf] px-4 py-3 text-sm transition hover:border-[#a44436] hover:text-[#a44436]"
              >
                <span>{item.label}</span>
                <ArrowRight size={14} />
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 border border-[#dfd8cf] bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-[#39231e]">
            Low stock attention
          </h2>
          <Link
            href="/admin/products"
            className="text-xs text-[#8d3428] underline"
          >
            Manage products
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {lowStockProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between border border-[#eee8e0] bg-[#faf7f3] px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-[#39231e]">{product.name}</p>
                <p className="text-xs text-[#776f68]">
                  {product.category} · {formatPrice(product.price)}
                </p>
              </div>
              <span className="font-medium text-[#a44436]">
                {product.stock} left
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
