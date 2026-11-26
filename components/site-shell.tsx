"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef, useMemo, type FormEvent } from "react";
import {
  ArrowRight,
  Camera,
  ChevronDown,
  Heart,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Package,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
  X,
} from "lucide-react";
import type { StoreCategory } from "@/src/lib/store/catalog";
import { useCart } from "@/components/storefront/cart-provider";
import {
  getCustomerToken,
  getCustomerUser,
  setCustomerUser,
  customerLogout,
  type CustomerUser,
} from "@/src/lib/api/customer-auth";
import subHeaderBg from "@/public/sub-header.png";

type SubCategoryNav = {
  name: string;
  slug: string;
  categorySlug: string;
  description?: string;
};

type NavGroup = {
  title: string;
  categorySlug: string;
  path: string;
  subcategories: SubCategoryNav[];
};

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { count, wishlistCount, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryList, setCategoryList] = useState<StoreCategory[]>([]);
  const [subCategoryList, setSubCategoryList] = useState<SubCategoryNav[]>([]);
  const [collectionMenuOpen, setCollectionMenuOpen] = useState(false);
  const [mobileCollectionOpen, setMobileCollectionOpen] = useState(false);
  const [mobileActiveCategory, setMobileActiveCategory] = useState<
    string | null
  >(null);
  const [bannerVisible, setBannerVisible] = useState(true);
  const flyoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Customer Authentication & Dropdown State
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [customerLoggedIn, setCustomerLoggedIn] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const userMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let active = true;
    let isFetching = false;

    function syncCustomer() {
      const token = getCustomerToken();
      if (!token) {
        setCustomer(null);
        setCustomerLoggedIn(false);
        return;
      }
      setCustomerLoggedIn(true);
      const cached = getCustomerUser();
      if (cached && active) setCustomer(cached);

      if (isFetching) return;
      isFetching = true;

      // Verify and refresh from server
      fetch("/api/users/me", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((r) => r.json())
        .then((res) => {
          if (!active) return;
          if (res?.success && res.data) {
            setCustomer(res.data);
            setCustomerUser(res.data, false);
          } else if (res?.status === 401 || res?.error === "UNAUTHENTICATED") {
            setCustomer(null);
            setCustomerLoggedIn(false);
          }
        })
        .catch(() => { })
        .finally(() => {
          isFetching = false;
        });
    }

    syncCustomer();

    window.addEventListener("kiddiequick_customer_auth_changed", syncCustomer);
    window.addEventListener("storage", syncCustomer);

    return () => {
      active = false;
      window.removeEventListener(
        "kiddiequick_customer_auth_changed",
        syncCustomer,
      );
      window.removeEventListener("storage", syncCustomer);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setUserDropdownOpen(false);
    await customerLogout();
    setCustomer(null);
    setCustomerLoggedIn(false);
    if (pathname.startsWith("/account")) {
      router.push("/");
    }
  }

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setCategoryList(res.data);
        }
      })
      .catch(() => { });

    fetch("/api/masters/subcategory")
      .then((r) => r.json())
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setSubCategoryList(res.data);
        }
      })
      .catch(() => { });
  }, []);

  // 100% Dynamic Navigation Groups generated from live Categories & Sub Categories in Database
  const navGroups = useMemo<NavGroup[]>(() => {
    return categoryList.map((category) => {
      const childSubs = subCategoryList.filter(
        (sub) => sub.categorySlug === category.slug,
      );
      return {
        title: category.name,
        categorySlug: category.slug,
        path: `/categories/${category.slug}`,
        subcategories: childSubs,
      };
    });
  }, [categoryList, subCategoryList]);

  useEffect(() => {
    setMenuOpen(false);
    setCollectionMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
        setCollectionMenuOpen(false);
        setUserDropdownOpen(false);
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

  const handleMouseEnter = () => {
    if (flyoutTimerRef.current) clearTimeout(flyoutTimerRef.current);
    setCollectionMenuOpen(true);
  };

  const handleMouseLeave = () => {
    flyoutTimerRef.current = setTimeout(() => {
      setCollectionMenuOpen(false);
    }, 200);
  };

  return (
    <>
      {/* Top Announcement Banner (Scrolls away with page, not sticky; dismissible) */}
      {bannerVisible && (
        <div className="relative bg-primary px-8 py-1.5 text-center text-[10px] font-medium tracking-[0.16em] text-primary-foreground">
          <span>
            KiddieQuick · Smart Kids, Men &amp; Women Fashion · Free
            Shipping above ₹2,000
          </span>
          <button
            type="button"
            onClick={() => setBannerVisible(false)}
            aria-label="Dismiss announcement"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-primary-foreground/75 transition hover:text-primary-foreground cursor-pointer"
          >
            <X size={13} />
          </button>
        </div>
      )}

      <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-2.5 sm:px-6 sm:py-3">
          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="p-2 lg:hidden text-foreground"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Brand Logo */}
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-2.5 sm:gap-3"
            aria-label="KiddieQuick home"
          >
            <Image
              src="/logo.png"
              alt="KiddieQuick Logo"
              width={619}
              height={624}
              priority
              className="size-9 sm:size-10 object-contain shrink-0"
            />
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Image
                  src="/KiddieQuick-Logo.svg"
                  alt="KiddieQuick"
                  width={704}
                  height={121}
                  priority
                  className="h-6 sm:h-[30px] w-auto object-contain"
                />
              </div>
              <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-muted-foreground leading-none">
                Kids · Men · Women Wear
              </span>
            </div>
          </Link>

          {/* Desktop Responsive Navigation (Collection Mega Menu + Core Links) */}
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-6 text-[11px] font-medium uppercase tracking-[0.16em] lg:flex"
          >
            {/* Collection Link with Mega Menu Trigger */}
            <div
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href="/collection"
                className={`inline-flex items-center gap-1.5 py-2 text-foreground/90 transition hover:text-accent ${collectionMenuOpen ||
                  pathname === "/collection" ||
                  pathname.startsWith("/categories/")
                  ? "font-semibold text-accent"
                  : ""
                  }`}
              >
                <span>Collection</span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${collectionMenuOpen
                    ? "rotate-180 text-accent"
                    : "text-muted-foreground"
                    }`}
                />
              </Link>
            </div>

            <Link
              href="/about"
              className={
                pathname === "/about"
                  ? "py-2 font-semibold text-accent"
                  : "py-2 text-foreground/90 transition hover:text-accent"
              }
            >
              Our Story
            </Link>
            <Link
              href="/blog"
              className={
                pathname === "/blog" || pathname.startsWith("/blog/")
                  ? "py-2 font-semibold text-accent"
                  : "py-2 text-foreground/90 transition hover:text-accent"
              }
            >
              Blog
            </Link>
            <Link
              href="/contact"
              className={
                pathname === "/contact"
                  ? "py-2 font-semibold text-accent"
                  : "py-2 text-foreground/90 transition hover:text-accent"
              }
            >
              Contact
            </Link>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              aria-label={searchOpen ? "Close search" : "Search collection"}
              aria-expanded={searchOpen}
              className="p-1 text-foreground transition hover:text-accent"
            >
              <Search size={18} />
            </button>

            <Link
              href="/collection?wishlist=1"
              aria-label={`View wishlist, ${wishlistCount} saved items`}
              className="relative hidden p-1 text-foreground transition hover:text-accent sm:block"
            >
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={openCart}
              aria-label={`Open shopping bag, ${count} items`}
              className="relative p-1 text-foreground transition hover:text-accent"
            >
              <ShoppingBag size={19} />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-accent text-[9px] text-white">
                  {count}
                </span>
              )}
            </button>

            {customerLoggedIn ? (
              <div
                ref={userMenuRef}
                className="relative"
                onMouseEnter={() => {
                  if (userMenuTimeoutRef.current) {
                    clearTimeout(userMenuTimeoutRef.current);
                  }
                  setUserDropdownOpen(true);
                }}
                onMouseLeave={() => {
                  userMenuTimeoutRef.current = setTimeout(() => {
                    setUserDropdownOpen(false);
                  }, 220);
                }}
              >
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="menu"
                  title={
                    customer?.name ? `${customer.name} (Account)` : "My Account"
                  }
                  className="relative flex size-8 items-center justify-center rounded-full border border-border bg-secondary/80 text-foreground transition hover:border-accent hover:text-accent focus:outline-none"
                >
                  {customer?.name ? (
                    <span className="text-xs font-bold uppercase text-accent">
                      {customer.name.trim().charAt(0)}
                    </span>
                  ) : (
                    <User size={17} />
                  )}
                  {/* Active green indicator badge */}
                  <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background bg-emerald-500" />
                </button>

                {userDropdownOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-2xl animate-in fade-in slide-in-from-top-1 z-50"
                  >
                    {/* Customer Info Header */}
                    <div className="flex items-center gap-3 border-b border-border/80 px-3 py-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white shadow-sm">
                        {customer?.name
                          ? customer.name.trim().charAt(0).toUpperCase()
                          : "K"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-primary">
                          {customer?.name || "Customer Account"}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {customer?.email || "Signed In"}
                        </p>
                        <span className="mt-1 inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">
                          <span className="size-1.5 rounded-full bg-emerald-500" />{" "}
                          Verified Customer
                        </span>
                      </div>
                    </div>

                    {/* Menu Links */}
                    <div className="py-1.5 space-y-0.5">
                      <Link
                        href="/account?tab=profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-foreground transition hover:bg-secondary hover:text-accent"
                      >
                        <User
                          size={15}
                          className="text-muted-foreground shrink-0"
                        />
                        <div className="flex flex-col text-left">
                          <span className="font-semibold text-primary">
                            My Profile
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Personal info &amp; addresses
                          </span>
                        </div>
                      </Link>

                      <Link
                        href="/account?tab=orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-foreground transition hover:bg-secondary hover:text-accent"
                      >
                        <ShoppingBag
                          size={15}
                          className="text-muted-foreground shrink-0"
                        />
                        <div className="flex flex-col text-left">
                          <span className="font-semibold text-primary">
                            My Orders
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Order history &amp; receipts
                          </span>
                        </div>
                      </Link>

                      <Link
                        href="/account?tab=track"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-foreground transition hover:bg-secondary hover:text-accent"
                      >
                        <Truck
                          size={15}
                          className="text-muted-foreground shrink-0"
                        />
                        <div className="flex flex-col text-left">
                          <span className="font-semibold text-primary">
                            Track Order
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Live shipment timeline
                          </span>
                        </div>
                      </Link>
                    </div>

                    {/* Logout Action */}
                    <div className="border-t border-border/80 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700"
                      >
                        <LogOut size={15} className="shrink-0" />
                        <span className="font-semibold">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                aria-label="Account sign in"
                title="Sign in"
                className="p-1 text-foreground transition hover:text-accent"
              >
                <User size={19} />
              </Link>
            )}
          </div>
        </div>

        {/* Mega Menu Dropdown Panel (100% width of header, no horizontal scroll) */}
        {collectionMenuOpen && (
          <div
            role="menu"
            className="absolute inset-x-0 top-full w-full max-w-full overflow-hidden border-b border-border bg-popover shadow-2xl animate-in fade-in slide-in-from-top-1"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="container mx-auto px-4 py-7 sm:px-6">
              {/* Mega Menu Top Header */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
                    Explore by Category &amp; Style
                  </p>
                  <h3 className="font-serif text-lg text-primary">
                    KiddieQuick Collections
                  </h3>
                </div>
                <Link
                  href="/collection"
                  onClick={() => setCollectionMenuOpen(false)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground transition hover:bg-accent/90"
                >
                  <span>Shop All Products</span>
                  <ArrowRight size={12} />
                </Link>
              </div>

              {/* Mega Menu Categories & Subcategories Columns */}
              <div className="mt-6 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
                {navGroups.map((group) => (
                  <div key={group.categorySlug} className="space-y-3">
                    <Link
                      href={group.path}
                      onClick={() => setCollectionMenuOpen(false)}
                      className="group block border-b border-border pb-1.5"
                    >
                      <span className="font-serif text-sm font-bold uppercase tracking-wider text-primary group-hover:text-accent">
                        {group.title}
                      </span>
                    </Link>

                    {group.subcategories.length > 0 ? (
                      <ul className="space-y-2">
                        {group.subcategories.map((sub) => (
                          <li key={sub.slug}>
                            <Link
                              href={`/collection?category=${sub.categorySlug}&subcategory=${sub.slug}`}
                              onClick={() => setCollectionMenuOpen(false)}
                              className="text-xs text-foreground/80 transition-all hover:translate-x-0.5 hover:font-medium hover:text-accent"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] text-muted-foreground">
                        Explore all items
                      </p>
                    )}

                    <div>
                      <Link
                        href={group.path}
                        onClick={() => setCollectionMenuOpen(false)}
                        className="inline-block text-[10px] font-semibold uppercase tracking-wider text-accent hover:underline"
                      >
                        All {group.title} →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mega Menu Footer Highlights */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-accent" />
                  Bio-washed, Skin-friendly Cotton &amp; Linens
                </span>
                <span className="flex items-center gap-1.5">
                  <Truck size={14} className="text-accent" />
                  Free shipping across India on orders over Rs. 2,000
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-accent" />
                  100% Genuine KiddieQuick Brand Quality
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Search Overlay */}
        {searchOpen && (
          <div className="border-t border-border bg-popover px-4 py-3 sm:px-6">
            <form
              onSubmit={handleSearchSubmit}
              className="container mx-auto flex items-center gap-3"
            >
              <Search size={16} className="shrink-0 text-muted-foreground" />
              <input
                type="search"
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search kids t-shirts, dresses, shirts, kurtis, tops..."
                aria-label="Search collection"
                className="w-full bg-transparent py-1 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
              />
              <button
                type="submit"
                className="bg-primary px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-foreground transition hover:opacity-90"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search bar"
                className="p-1 text-muted-foreground hover:text-primary"
              >
                <X size={16} />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Drawer Navigation with Structured Accordions */}
        {menuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="absolute inset-x-0 top-full flex max-h-[85vh] flex-col gap-1 overflow-auto border-b border-border bg-background p-5 text-xs uppercase tracking-[0.14em] shadow-xl lg:hidden"
          >
            {/* Customer Profile / Sign In Section for Mobile */}
            <div className="border-b border-border pb-3.5 mb-1 normal-case">
              {customerLoggedIn ? (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 rounded-lg bg-secondary/70 p-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white shadow-sm">
                      {customer?.name
                        ? customer.name.trim().charAt(0).toUpperCase()
                        : "K"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-primary">
                        {customer?.name || "Customer Account"}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {customer?.email}
                      </p>
                      <span className="mt-0.5 inline-block text-[9px] font-semibold text-emerald-700">
                        ● Active Customer
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                    <Link
                      href="/account?tab=profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-card p-2 text-center text-xs font-medium text-foreground transition hover:border-accent hover:text-accent"
                    >
                      <User size={16} className="text-accent" />
                      <span className="text-[11px]">Profile</span>
                    </Link>

                    <Link
                      href="/account?tab=orders"
                      onClick={() => setMenuOpen(false)}
                      className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-card p-2 text-center text-xs font-medium text-foreground transition hover:border-accent hover:text-accent"
                    >
                      <ShoppingBag size={16} className="text-accent" />
                      <span className="text-[11px]">Orders</span>
                    </Link>

                    <Link
                      href="/account?tab=track"
                      onClick={() => setMenuOpen(false)}
                      className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-card p-2 text-center text-xs font-medium text-foreground transition hover:border-accent hover:text-accent"
                    >
                      <Truck size={16} className="text-accent" />
                      <span className="text-[11px]">Track</span>
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50/50 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg bg-accent/10 px-3 py-2.5 text-xs font-bold text-accent"
                >
                  <span className="flex items-center gap-2">
                    <User size={16} /> Sign In to KiddieQuick
                  </span>
                  <ArrowRight size={14} />
                </Link>
              )}
            </div>

            {/* Collection Accordion */}
            <div className="border-b border-border pb-2">
              <button
                type="button"
                onClick={() => setMobileCollectionOpen((open) => !open)}
                className="flex w-full items-center justify-between py-2.5 font-bold text-accent"
              >
                <span>Collection / Categories</span>
                <ChevronDown
                  size={15}
                  className={`transition-transform duration-200 ${mobileCollectionOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {mobileCollectionOpen && (
                <div className="ml-2 mt-1 space-y-3 border-l-2 border-accent/30 pl-3 pt-1">
                  <Link
                    href="/collection"
                    onClick={() => setMenuOpen(false)}
                    className="block text-xs font-semibold text-accent"
                  >
                    Shop All Products →
                  </Link>

                  {navGroups.map((group) => {
                    const isCatOpen =
                      mobileActiveCategory === group.categorySlug;
                    return (
                      <div key={group.categorySlug} className="space-y-1">
                        <div className="flex items-center justify-between py-1">
                          <Link
                            href={group.path}
                            onClick={() => setMenuOpen(false)}
                            className="font-medium text-primary hover:text-accent"
                          >
                            {group.title}
                          </Link>
                          {group.subcategories.length > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setMobileActiveCategory(
                                  isCatOpen ? null : group.categorySlug,
                                )
                              }
                              className="p-1 text-muted-foreground"
                            >
                              <ChevronDown
                                size={12}
                                className={`transition-transform ${isCatOpen ? "rotate-180 text-accent" : ""
                                  }`}
                              />
                            </button>
                          )}
                        </div>

                        {isCatOpen && group.subcategories.length > 0 && (
                          <div className="ml-3 space-y-1.5 border-l border-input pl-2.5">
                            {group.subcategories.map((sub) => (
                              <Link
                                key={sub.slug}
                                href={`/collection?category=${sub.categorySlug}&subcategory=${sub.slug}`}
                                onClick={() => setMenuOpen(false)}
                                className="block text-[11px] normal-case text-muted-foreground hover:text-accent"
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              href="/collection?wishlist=1"
              onClick={() => setMenuOpen(false)}
              className="py-2 text-primary hover:text-accent"
            >
              Wishlist ({wishlistCount})
            </Link>
            <Link
              href="/about"
              onClick={() => setMenuOpen(false)}
              className="py-2 text-primary hover:text-accent"
            >
              Our Story
            </Link>
            <Link
              href="/blog"
              onClick={() => setMenuOpen(false)}
              className="py-2 text-primary hover:text-accent"
            >
              Blog
            </Link>
            <Link
              href="/shipping"
              onClick={() => setMenuOpen(false)}
              className="py-2 text-primary hover:text-accent"
            >
              Shipping &amp; Returns
            </Link>
            <Link
              href="/faq"
              onClick={() => setMenuOpen(false)}
              className="py-2 text-primary hover:text-accent"
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="py-2 text-primary hover:text-accent"
            >
              Contact
            </Link>
            <div className="mt-4 border-t border-border pt-4">
              <Link
                href="/admin/login"
                onClick={() => setMenuOpen(false)}
                className="text-[10px] text-muted-foreground hover:text-accent"
              >
                Admin Portal
              </Link>
            </div>
          </nav>
        )}
      </header>
    </>
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
    <section className="relative overflow-hidden border-b border-border bg-background px-4 py-12 text-center sm:px-6 sm:py-16">
      <Image
        src={subHeaderBg}
        alt=""
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="relative z-10 container mx-auto">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-serif text-4xl text-primary sm:text-6xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-foreground/80">
          {copy}
        </p>
      </div>
    </section>
  );
}

export function SiteFooter() {
  const [categoryList, setCategoryList] = useState<StoreCategory[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterStatus, setNewsletterStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setCategoryList(res.data);
        }
      })
      .catch(() => { });
  }, []);

  async function handleNewsletterSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const cleanEmail = newsletterEmail.trim();
    if (!cleanEmail) return;

    setNewsletterLoading(true);
    setNewsletterStatus(null);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: cleanEmail, source: "footer" }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        setNewsletterStatus({
          type: "error",
          message:
            data?.error?.message || "Failed to subscribe. Please try again.",
        });
        return;
      }

      setNewsletterStatus({
        type: "success",
        message: "Thank you for subscribing! Check your inbox for updates.",
      });
      setNewsletterEmail("");
      setTimeout(() => setNewsletterStatus(null), 5000);
    } catch {
      setNewsletterStatus({
        type: "error",
        message: "Unable to connect to server. Please try again later.",
      });
    } finally {
      setNewsletterLoading(false);
    }
  }

  return (
    <footer className="border-t border-border bg-background">
      {/* Top Newsletter Subscription Section */}
      <div className="border-b border-border bg-secondary/35">
        <div className="mx-auto container px-4 py-10 sm:px-6 sm:py-12 lg:px-12">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row lg:gap-12">
            <div className="max-w-xl text-center lg:text-left">
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent">
                Stay Connected
              </span>
              <h3 className="mt-1.5 font-serif text-2xl font-bold text-primary sm:text-3xl">
                Join the KiddieQuick Family
              </h3>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Subscribe for exclusive previews of upcoming kids, men &amp;
                women seasonal collections, styling stories, and special festive
                discounts.
              </p>
            </div>

            <div className="w-full max-w-md">
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="h-11 w-full rounded-lg border border-border bg-white px-4 text-xs text-foreground placeholder:text-muted-foreground outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
                />
                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition hover:bg-accent/90 disabled:opacity-60"
                >
                  {newsletterLoading ? (
                    <span className="inline-block size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              {newsletterStatus && (
                <p
                  role="status"
                  className={`mt-2 text-xs font-medium ${newsletterStatus.type === "success"
                    ? "text-emerald-700"
                    : "text-accent"
                    }`}
                >
                  {newsletterStatus.type === "success" ? "✓ " : "✕ "}
                  {newsletterStatus.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main 4 Footer Columns */}
      <div className="mx-auto container px-4 py-12 sm:px-6 sm:py-14 lg:px-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {/* Brand Info & Social Media Links */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3"
              aria-label="KiddieQuick home"
            >
              <Image
                src="/logo.png"
                alt="KiddieQuick Logo"
                width={619}
                height={624}
                priority
                className="size-9 sm:size-10 object-contain shrink-0"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <Image
                    src="/KiddieQuick-Logo.svg"
                    alt="KiddieQuick"
                    width={704}
                    height={121}
                    priority
                    className="h-6 sm:h-[30px] w-auto object-contain"
                  />
                </div>
                <p className=" text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Kids · Men · Women Wear
                </p>
              </div>
            </Link>
            <p className="mt-3 max-w-xs text-xs leading-6 text-muted-foreground">
              Delivering quality everyday and celebration wear for kids, boys,
              girls, men, and women with contemporary Indian aesthetics.
            </p>

            {/* Social Media Icons */}
            <div className="mt-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                Follow Us
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow KiddieQuick on Instagram"
                  title="Instagram"
                  className="flex size-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:border-accent hover:bg-accent/10 hover:text-accent hover:scale-110"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Connect with KiddieQuick on Facebook"
                  title="Facebook"
                  className="flex size-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:border-accent hover:bg-accent/10 hover:text-accent hover:scale-110"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="currentColor"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Watch KiddieQuick on YouTube"
                  title="YouTube"
                  className="flex size-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:border-accent hover:bg-accent/10 hover:text-accent hover:scale-110"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="currentColor"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>

                {/* WhatsApp Direct Chat */}
                <a
                  href="https://wa.me/918824700161"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat with KiddieQuick on WhatsApp"
                  title="WhatsApp Support"
                  className="flex size-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 hover:scale-110"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="currentColor"
                  >
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Shop by Category
            </p>
            <div className="mt-4 flex flex-col gap-2 text-xs text-muted-foreground">
              {categoryList.map((category) => (
                <Link
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  className="hover:text-accent transition"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Customer Care */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Customer Care
            </p>
            <div className="mt-4 flex flex-col gap-2 text-xs text-muted-foreground">
              <Link href="/collection" className="hover:text-accent transition">
                All Products
              </Link>
              <Link
                href="/account?tab=orders"
                className="hover:text-accent transition"
              >
                My Orders &amp; Receipts
              </Link>
              <Link
                href="/account?tab=track"
                className="hover:text-accent transition"
              >
                Track Shipment
              </Link>
              <Link href="/about" className="hover:text-accent transition">
                Our Story
              </Link>
              <Link href="/blog" className="hover:text-accent transition">
                Blog &amp; Updates
              </Link>
              <Link href="/shipping" className="hover:text-accent transition">
                Shipping &amp; Returns
              </Link>
              <Link href="/faq" className="hover:text-accent transition">
                FAQ &amp; Help Center
              </Link>
              <Link href="/contact" className="hover:text-accent transition">
                Contact Us
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              KiddieQuick
            </p>
            <div className="mt-4 flex flex-col gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <MapPin size={14} className="text-accent shrink-0" /> 10/523,
                Malviya Nagar Road, Jaipur - 302017
              </span>
              <a
                href="tel:+918824700161"
                className="flex items-center gap-2 hover:text-accent transition"
              >
                <Phone size={14} className="text-accent shrink-0" /> +91 (882)
                470-0161
              </a>
              <a
                href="mailto:hello@kiddiequick.in"
                className="flex items-center gap-2 hover:text-accent transition"
              >
                <Mail size={14} className="text-accent shrink-0" />{" "}
                hello@kiddiequick.in
              </a>
              <div className="mt-2 text-[11px] text-muted-foreground/80 leading-5">
                Customer Support Hours:
                <br />
                Mon – Sat: 9:30 AM – 7:00 PM IST
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar with Policies & Admin */}
      <div className="border-t border-border bg-secondary/20">
        <div className="mx-auto container px-4 py-5 sm:px-6 lg:px-12 flex flex-col items-center justify-between gap-3 text-[10px] text-muted-foreground sm:flex-row">
          <span>
            © {new Date().getFullYear() > 2025 ? `2025–${new Date().getFullYear()}` : new Date().getFullYear()} KiddieQuick. All rights reserved.
          </span>
          <div className="flex items-center gap-4 text-[10px]">
            <Link
              href="/faq"
              className="transition hover:text-accent hover:underline underline-offset-4"
            >
              FAQ
            </Link>
            <span className="text-border">·</span>
            <Link
              href="/privacy"
              className="transition hover:text-accent hover:underline underline-offset-4"
            >
              Privacy Policy
            </Link>
            <span className="text-border">·</span>
            <Link
              href="/terms"
              className="transition hover:text-accent hover:underline underline-offset-4"
            >
              Terms &amp; Conditions
            </Link>
            <span className="text-border">·</span>
            <Link
              href="/admin/login"
              className="transition hover:text-accent hover:underline underline-offset-4"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
