"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export function AdminAuthShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) return <>{children}</>;

  const links = [
    ["Overview", "/admin"],
    ["Banners", "/admin/banners"],
    ["Products", "/admin/products"],
    ["Orders", "/admin/orders"],
    ["Customers", "/admin/customers"],
    ["Discounts", "/admin/discounts"],
    ["Blogs", "/admin/blogs"],
    ["Master", "/admin/master"],
  ];
  return (
    <div className="min-h-screen bg-[#f7f4ef] text-[#2f2924]">
      <header className="border-b border-[#e8ded2] bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="inline-flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Majisavesh"
              width={1563}
              height={680}
              sizes="90px"
              className="h-9 w-auto object-contain"
            />
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8d3428]">
              Admin
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs uppercase tracking-wider text-[#8d3428]"
          >
            Back to store
          </Link>
        </div>
        <nav
          aria-label="Admin sections"
          className="mt-3 flex gap-4 overflow-x-auto pb-1 text-[10px] uppercase tracking-[0.12em]"
        >
          {links.map(([label, href]) => {
            const active =
              href === "/admin/master"
                ? pathname.startsWith("/admin/master")
                : pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "shrink-0 font-semibold text-[#8d3428]"
                    : "shrink-0 text-[#76675d]"
                }
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </header>
      <AdminSidebar />
      <main className="lg:pl-64">{children}</main>
    </div>
  );
}
