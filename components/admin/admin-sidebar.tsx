"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FolderKanban,
  FolderTree,
  Gem,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  Palette,
  Receipt,
  Ruler,
  ShoppingBag,
  Sparkles,
  Tag,
  Users,
} from "lucide-react";
import type { AdminUser } from "@/src/lib/api/auth-token";

const sections = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Banners", href: "/admin/banners", icon: ImageIcon },
  { label: "Products", href: "/admin/products", icon: ShoppingBag },
  { label: "Orders", href: "/admin/orders", icon: ClipboardList },
  { label: "Transactions", href: "/admin/transactions", icon: Receipt },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Discounts", href: "/admin/discounts", icon: Tag },
  { label: "Blogs", href: "/admin/blogs", icon: BookOpen },
  { label: "Inquiries & Leads", href: "/admin/inquiries", icon: Mail },
];

const masterSections = [
  { label: "Category", href: "/admin/master/category", icon: Layers },
  {
    label: "Sub Category",
    href: "/admin/master/subcategory",
    icon: FolderTree,
  },
  { label: "Color", href: "/admin/master/color", icon: Palette },
  { label: "Size", href: "/admin/master/size", icon: Ruler },
  { label: "Tag", href: "/admin/master/tag", icon: Tag },
];

export function AdminSidebar({
  onLogout,
  adminUser,
}: {
  onLogout?: () => void;
  adminUser?: AdminUser | null;
}) {
  const pathname = usePathname();
  const isMasterRoute = pathname.startsWith("/admin/master");
  const [masterOpen, setMasterOpen] = useState(true);

  useEffect(() => {
    if (isMasterRoute) setMasterOpen(true);
  }, [isMasterRoute]);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-white lg:flex lg:flex-col">
      <div className="border-b border-border px-5 py-5">
        <Link href="/" className="flex items-center gap-3" aria-label="KiddieQuick Admin">
          <Image
            src="/logo.png"
            alt="KiddieQuick Admin Logo"
            width={619}
            height={624}
            priority
            className="size-11 object-contain shrink-0"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-lg font-bold tracking-tight text-primary">
                KiddieQuick
              </span>
              <span className="rounded bg-accent/10 px-1 py-0.2 text-[8px] font-bold uppercase tracking-wider text-accent">
                LLP
              </span>
            </div>
            <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Admin Portal
            </p>
          </div>
        </Link>
        <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2 text-[10px] text-muted-foreground">
          <span>Logged in as</span>
          {adminUser && (
            <span className="text-accent font-medium truncate max-w-[120px]">
              {adminUser.email.split("@")[0]}
            </span>
          )}
        </div>
      </div>
      <nav className="flex-1 px-3 py-6 overflow-y-auto">
        <p className="px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Manage store
        </p>
        <div className="mt-3 flex flex-col gap-1">
          {sections.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-3 text-sm transition ${active ? "bg-accent/10 font-medium text-accent" : "text-muted-foreground hover:bg-background"}`}
              >
                <Icon size={16} />
                <span>{label}</span>
                {active && <ChevronRight className="ml-auto" size={14} />}
              </Link>
            );
          })}

          <div className="pt-1">
            <div
              className={`flex items-center justify-between px-3 py-3 text-sm transition ${
                isMasterRoute
                  ? "bg-accent/10 font-medium text-accent"
                  : "text-muted-foreground hover:bg-background"
              }`}
            >
              <Link
                href="/admin/master"
                className="flex flex-1 items-center gap-3"
              >
                <FolderKanban size={16} />
                <span>Master</span>
              </Link>
              <button
                type="button"
                onClick={() => setMasterOpen((open) => !open)}
                aria-expanded={masterOpen}
                aria-label={
                  masterOpen ? "Collapse Master folder" : "Expand Master folder"
                }
                className="p-0.5"
              >
                {masterOpen ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
            </div>

            {masterOpen && (
              <div className="ml-5 mt-1 flex flex-col gap-0.5 border-l border-border pl-3">
                {masterSections.map(({ label, href, icon: Icon }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-2.5 px-3 py-2 text-xs transition ${
                        active
                          ? "bg-accent/10 font-semibold text-accent"
                          : "text-muted-foreground hover:bg-background hover:text-primary"
                      }`}
                    >
                      <Icon size={14} />
                      <span>{label}</span>
                      {active && <ChevronRight className="ml-auto" size={13} />}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </nav>
      <div className="border-t border-border p-3 flex flex-col gap-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 text-xs text-muted-foreground hover:text-primary"
        >
          <Gem size={15} /> View storefront
        </Link>
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-3 px-3 py-2.5 text-xs text-accent hover:bg-accent/10 transition text-left"
          >
            <LogOut size={15} /> Sign out
          </button>
        )}
      </div>
    </aside>
  );
}
