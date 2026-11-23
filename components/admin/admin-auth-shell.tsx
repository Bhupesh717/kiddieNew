"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  getAdminToken,
  getAdminUser,
  removeAdminToken,
} from "@/src/lib/api/auth-token";

export function AdminAuthShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (isLogin) {
      setAuthorized(true);
      return;
    }

    const token = getAdminToken();
    if (!token) {
      router.replace("/admin/login");
    } else {
      setAuthorized(true);
    }
  }, [isLogin, pathname, router]);

  if (isLogin) return <>{children}</>;

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Checking authentication...
      </div>
    );
  }

  function handleLogout() {
    removeAdminToken();
    router.push("/admin/login");
  }

  const links = [
    ["Overview", "/admin"],
    ["Banners", "/admin/banners"],
    ["Products", "/admin/products"],
    ["Orders", "/admin/orders"],
    ["Customers", "/admin/customers"],
    ["Discounts", "/admin/discounts"],
    ["Blogs", "/admin/blogs"],
    ["Inquiries", "/admin/inquiries"],
    ["Master", "/admin/master"],
  ];

  const adminUser = getAdminUser();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="inline-flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="KiddieQuick"
              width={619}
              height={624}
              sizes="90px"
              className="h-9 w-auto object-contain"
            />
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
              KiddieQuick Admin
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs uppercase tracking-wider text-accent"
            >
              Store
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-muted-foreground hover:text-accent"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
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
                    ? "shrink-0 font-semibold text-accent"
                    : "shrink-0 text-muted-foreground"
                }
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </header>
      <AdminSidebar onLogout={handleLogout} adminUser={adminUser} />
      <main className="lg:pl-64">{children}</main>
    </div>
  );
}
