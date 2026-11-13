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
  Gem,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  ShoppingBag,
  Sparkles,
  Tag,
  Users,
} from "lucide-react";

const sections = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Banners", href: "/admin/banners", icon: ImageIcon },
  { label: "Products", href: "/admin/products", icon: ShoppingBag },
  { label: "Orders", href: "/admin/orders", icon: ClipboardList },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Discounts", href: "/admin/discounts", icon: Tag },
  { label: "Blogs", href: "/admin/blogs", icon: BookOpen },
];

const masterSections = [
  { label: "Category", href: "/admin/master/category", icon: Layers },
  { label: "Fabric", href: "/admin/master/fabric", icon: Sparkles },
  { label: "Tag", href: "/admin/master/tag", icon: Tag },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const isMasterRoute = pathname.startsWith("/admin/master");
  const [masterOpen, setMasterOpen] = useState(true);

  useEffect(() => {
    if (isMasterRoute) setMasterOpen(true);
  }, [isMasterRoute]);
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#dfd8cf] bg-white lg:flex lg:flex-col">
      <div className="border-b border-[#eee8e0] px-6 py-5">
        <Link
          href="/"
          className="inline-block"
          aria-label="Majisavesh storefront"
        >
          <Image
            src="/logo.png"
            alt="Majisavesh — The Royal Attire of Rajasthan"
            width={1563}
            height={680}
            sizes="115px"
            className="h-12 w-auto object-contain"
          />
        </Link>
        <p className="mt-2 text-[9px] uppercase tracking-[0.2em] text-[#a48668]">
          Atelier admin
        </p>
      </div>
      <nav className="flex-1 px-3 py-6">
        <p className="px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a48668]">
          Manage store
        </p>
        <div className="mt-3 flex flex-col gap-1">
          {sections.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-3 text-sm transition ${active ? "bg-[#f7eee9] font-medium text-[#8d3428]" : "text-[#776f68] hover:bg-[#faf7f3]"}`}
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
                  ? "bg-[#f7eee9] font-medium text-[#8d3428]"
                  : "text-[#776f68] hover:bg-[#faf7f3]"
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
                aria-label={masterOpen ? "Collapse Master folder" : "Expand Master folder"}
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
              <div className="ml-5 mt-1 flex flex-col gap-0.5 border-l border-[#e8ded2] pl-3">
                {masterSections.map(({ label, href, icon: Icon }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-2.5 px-3 py-2 text-xs transition ${
                        active
                          ? "bg-[#f7eee9] font-semibold text-[#8d3428]"
                          : "text-[#776f68] hover:bg-[#faf7f3] hover:text-[#39231e]"
                      }`}
                    >
                      <Icon size={14} />
                      <span>{label}</span>
                      {active && (
                        <ChevronRight className="ml-auto" size={13} />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </nav>
      <div className="border-t border-[#eee8e0] p-3">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-3 text-sm text-[#776f68] hover:text-[#39231e]"
        >
          <Gem size={16} /> View storefront
        </Link>
      </div>
    </aside>
  );
}
