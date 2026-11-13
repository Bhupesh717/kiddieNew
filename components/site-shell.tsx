"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  Camera,
  Heart,
  Mail,
  MapPin,
  Menu,
  Phone,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { categories } from "@/src/lib/store/catalog";
import { useCart } from "@/components/storefront/cart-provider";
import subHeaderBg from "@/public/sub-header.png";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { count, wishlistCount, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    setSearchOpen(false);
    router.push(
      trimmed ? `/collection?q=${encodeURIComponent(trimmed)}` : "/collection",
    );
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#e8ded2] bg-[#fbf8f3]/95 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="p-2 lg:hidden"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link
          href="/"
          className="inline-flex shrink-0 items-center"
          aria-label="Majisavesh home"
        >
          <Image
            src="/logo.png"
            alt="Majisavesh — The Royal Attire of Rajasthan"
            width={1563}
            height={680}
            loading="eager"
            sizes="(max-width: 640px) 105px, 150px"
            className="h-11 w-auto object-contain sm:h-16"
          />
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-6 text-[10px] font-medium uppercase tracking-[0.16em] lg:flex"
        >
          <Link
            href="/collection"
            className={
              pathname === "/collection"
                ? "font-semibold text-[#a44436]"
                : "hover:text-[#a44436]"
            }
          >
            Collection
          </Link>
          <Link
            href="/about"
            className={
              pathname === "/about"
                ? "font-semibold text-[#a44436]"
                : "hover:text-[#a44436]"
            }
          >
            Our story
          </Link>
          <Link
            href="/blog"
            className={
              pathname === "/blog" || pathname.startsWith("/blog/")
                ? "font-semibold text-[#a44436]"
                : "hover:text-[#a44436]"
            }
          >
            Blog
          </Link>
          <Link
            href="/contact"
            className={
              pathname === "/contact"
                ? "font-semibold text-[#a44436]"
                : "hover:text-[#a44436]"
            }
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            aria-label={searchOpen ? "Close search" : "Search collection"}
            aria-expanded={searchOpen}
            className="p-1 text-[#33251f] transition hover:text-[#a44436]"
          >
            <Search size={18} />
          </button>

          <Link
            href="/collection?wishlist=1"
            aria-label={`View wishlist, ${wishlistCount} saved items`}
            className="relative hidden p-1 text-[#33251f] transition hover:text-[#a44436] sm:block"
          >
            <Heart size={18} />
            {wishlistCount > 0 && (
              <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-[#39231e] text-[9px] text-white">
                {wishlistCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={openCart}
            aria-label={`Open shopping bag, ${count} items`}
            className="relative p-1"
          >
            <ShoppingBag size={19} />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-[#a44436] text-[9px] text-white">
                {count}
              </span>
            )}
          </button>
          <Link
            href="/login"
            aria-label="Account sign in"
            title="Sign in"
            className="p-1 text-[#33251f] transition hover:text-[#a44436]"
          >
            <User size={19} />
          </Link>
        </div>
      </div>

      <nav
        aria-label="Product categories"
        className="hidden border-t border-[#e8ded2]/80 bg-[#fbf8f3] lg:block"
      >
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-7 gap-y-2 px-6 py-2.5 text-[10px] font-medium uppercase tracking-[0.17em] text-[#4b3c33]">
          {categories.map((category) => {
            const href = `/categories/${category.slug}`;
            return (
              <Link
                key={category.slug}
                href={href}
                className={
                  pathname === href
                    ? "font-semibold text-[#a44436] underline decoration-[#a44436] underline-offset-4"
                    : "transition hover:text-[#a44436]"
                }
              >
                {category.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {searchOpen && (
        <div className="border-t border-[#e8ded2] bg-[#fffdf9] px-4 py-3 sm:px-6">
          <form
            onSubmit={handleSearchSubmit}
            className="container mx-auto flex items-center gap-3"
          >
            <Search size={16} className="shrink-0 text-[#8b796b]" />
            <input
              type="search"
              autoFocus
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search poshak, kurti, silk, kundan..."
              aria-label="Search collection"
              className="w-full bg-transparent py-1 text-sm text-[#33251f] outline-none placeholder:text-[#a49a90]"
            />
            <button
              type="submit"
              className="bg-[#39231e] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label="Close search bar"
              className="p-1 text-[#8b796b] hover:text-[#39231e]"
            >
              <X size={16} />
            </button>
          </form>
        </div>
      )}

      {menuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="absolute inset-x-0 top-full flex max-h-[75vh] flex-col gap-4 overflow-auto border-b border-[#e8ded2] bg-[#fbf8f3] p-5 text-[10px] uppercase tracking-[0.16em] shadow-lg lg:hidden"
        >
          <Link href="/collection" onClick={() => setMenuOpen(false)}>
            Shop all
          </Link>
          <Link
            href="/collection?wishlist=1"
            onClick={() => setMenuOpen(false)}
          >
            Wishlist ({wishlistCount})
          </Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              onClick={() => setMenuOpen(false)}
            >
              {category.name}
            </Link>
          ))}
          <Link href="/about" onClick={() => setMenuOpen(false)}>
            Our story
          </Link>
          <Link href="/blog" onClick={() => setMenuOpen(false)}>
            Blog
          </Link>
          <Link href="/shipping" onClick={() => setMenuOpen(false)}>
            Shipping & returns
          </Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)}>
            Contact
          </Link>
          <Link href="/login" onClick={() => setMenuOpen(false)}>
            Customer sign in
          </Link>
          <Link href="/admin/login" onClick={() => setMenuOpen(false)}>
            Admin portal
          </Link>
        </nav>
      )}
    </header>
  );
}

export function PageIntro({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-[#e8ded2] bg-[#f3ece2] px-4 py-14 text-center sm:py-20">
      <Image
        src={subHeaderBg}
        alt=""
        fill
        preload
        placeholder="blur"
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#fbf8f3]/55 via-[#fbf8f3]/40 to-[#fbf8f3]/65 sm:bg-[radial-gradient(ellipse_at_center,rgba(251,248,243,0.45)_0%,rgba(251,248,243,0.12)_65%,transparent_100%)]"
      />
      <div className="container mx-auto">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a44436]">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-serif text-4xl text-[#39231e] sm:text-6xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#5c4d44]">
          {copy}
        </p>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[#e8ded2] px-4 py-10 sm:px-6 sm:py-12">
      <div className="container mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="inline-block" aria-label="Majisavesh home">
            <Image
              src="/logo.png"
              alt="Majisavesh — The Royal Attire of Rajasthan"
              width={1563}
              height={680}
              sizes="(max-width: 640px) 115px, 150px"
              className="h-12 w-auto object-contain sm:h-16"
            />
          </Link>
          <p className="mt-3 max-w-xs text-xs leading-6 text-[#77675d]">
            Modern heirlooms, rooted in the royal craft traditions of Rajasthan.
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em]">
            Categories
          </p>
          <div className="mt-4 flex flex-col gap-2 text-xs text-[#77675d]">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="hover:text-[#39231e]"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em]">
            Explore
          </p>
          <div className="mt-4 flex flex-col gap-2 text-xs text-[#77675d]">
            <Link href="/collection" className="hover:text-[#39231e]">
              All collection
            </Link>
            <Link href="/about" className="hover:text-[#39231e]">
              Our story
            </Link>
            <Link href="/blog" className="hover:text-[#39231e]">
              Blog
            </Link>
            <Link href="/shipping" className="hover:text-[#39231e]">
              Shipping & returns
            </Link>
            <Link href="/contact" className="hover:text-[#39231e]">
              Contact the atelier
            </Link>
            <Link href="/admin/login" className="hover:text-[#39231e]">
              Admin sign in
            </Link>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em]">
            Visit the atelier
          </p>
          <div className="mt-4 flex flex-col gap-3 text-xs text-[#77675d]">
            <span className="flex items-center gap-2">
              <MapPin size={14} /> C-Scheme, Jaipur
            </span>
            <span className="flex items-center gap-2">
              <Phone size={14} /> +91 141 400 2424
            </span>
            <span className="flex items-center gap-2">
              <Mail size={14} /> hello@majisavesh.com
            </span>
          </div>
        </div>
      </div>
      <div className="container mx-auto mt-8 flex items-center justify-between border-t border-[#e8ded2] pt-5 text-[10px] text-[#a48668]">
        <span>© 2026 Majisavesh</span>
        <Link
          href="/contact"
          aria-label="Connect with Majisavesh atelier"
          className="hover:text-[#8d3428]"
        >
          <Camera size={15} />
        </Link>
      </div>
    </footer>
  );
}
