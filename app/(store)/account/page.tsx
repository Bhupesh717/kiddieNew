"use client";

import { Suspense, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Edit2,
  ExternalLink,
  HelpCircle,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User,
  X,
} from "lucide-react";
import {
  getCustomerToken,
  getCustomerUser,
  setCustomerUser,
  customerLogout,
  getCustomerAuthHeaders,
  type CustomerUser,
} from "@/src/lib/api/customer-auth";

type Address = {
  id: string | number;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  stateName: string;
  stateCode?: string;
  pincode: string;
  isDefault?: boolean;
};

type OrderItem = {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image?: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  lineTotal: number;
};

type Order = {
  id: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  stateName: string;
  pinCode: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promoCode?: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  trackingNumber?: string;
  shippingCarrier?: string;
  createdAt: string;
  formattedDate: string;
  items: OrderItem[];
};

type TabType = "profile" | "orders" | "track";

function CustomerAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = (searchParams.get("tab") as TabType) || "profile";
  const initialRef = searchParams.get("reference") || searchParams.get("order") || "";

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [token, setToken] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Profile States
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Address States
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    stateName: "Rajasthan",
    pincode: "",
  });

  // Orders States
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Tracking States
  const [trackingReference, setTrackingReference] = useState(initialRef);
  const [trackingPhone, setTrackingPhone] = useState("");
  const [trackingResult, setTrackingResult] = useState<Order | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState("");

  // Sync tab with URL if changed
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as TabType;
    if (tabFromUrl && (tabFromUrl === "profile" || tabFromUrl === "orders" || tabFromUrl === "track")) {
      setActiveTab(tabFromUrl);
    }
    const refFromUrl = searchParams.get("reference") || searchParams.get("order");
    if (refFromUrl) {
      setTrackingReference(refFromUrl);
      setActiveTab("track");
    }
  }, [searchParams]);

  // Authenticate & Load Customer on Mount
  useEffect(() => {
    const storedToken = getCustomerToken();
    setToken(storedToken);
    setLoadingAuth(false);

    if (!storedToken) return;

    // Load initial cached user
    const cached = getCustomerUser();
    if (cached) {
      setUser(cached);
      setNameInput(cached.name || "");
      setPhoneInput(cached.phone || "");
    }

    // Fetch fresh profile
    fetch("/api/users/me", {
      headers: getCustomerAuthHeaders(),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res?.success && res.data) {
          setUser(res.data);
          setCustomerUser(res.data, false);
          setNameInput(res.data.name || "");
          setPhoneInput(res.data.phone || "");
        } else if (res?.status === 401 || res?.error === "UNAUTHENTICATED") {
          customerLogout();
          setToken(null);
          setUser(null);
        }
      })
      .catch(() => {});

    // Fetch addresses
    fetchAddresses();

    // Fetch orders
    fetchOrders();
  }, []);

  // Auto-run tracking if reference was present in URL on mount
  useEffect(() => {
    if (initialRef && initialTab === "track") {
      performTracking(initialRef);
    }
  }, [initialRef]);

  function fetchAddresses() {
    setLoadingAddresses(true);
    fetch("/api/users/me/addresses", {
      headers: getCustomerAuthHeaders(),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setAddresses(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingAddresses(false));
  }

  function fetchOrders() {
    setLoadingOrders(true);
    fetch("/api/orders", {
      headers: getCustomerAuthHeaders(),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setOrders(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingOrders(false));
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileMessage(null);
    setSavingProfile(true);

    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: getCustomerAuthHeaders(),
        body: JSON.stringify({
          name: nameInput.trim(),
          phone: phoneInput.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setProfileMessage({
          type: "error",
          text: data?.error?.message || "Failed to update profile. Please verify your phone number.",
        });
        return;
      }
      setUser(data.data);
      setCustomerUser(data.data);
      setEditingProfile(false);
      setProfileMessage({ type: "success", text: "Profile details updated successfully!" });
      setTimeout(() => setProfileMessage(null), 4000);
    } catch {
      setProfileMessage({ type: "error", text: "Unable to connect to server. Please try again." });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAddressSave(e: React.FormEvent) {
    e.preventDefault();
    setSavingAddress(true);

    try {
      const res = await fetch("/api/users/me/addresses", {
        method: "POST",
        headers: getCustomerAuthHeaders(),
        body: JSON.stringify({
          ...newAddress,
          isDefault: addresses.length === 0,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        alert(data?.error?.message || "Please enter valid address details (10-digit phone, 6-digit PIN).");
        return;
      }
      setShowAddressForm(false);
      setNewAddress({
        fullName: "",
        phone: "",
        addressLine: "",
        city: "",
        stateName: "Rajasthan",
        pincode: "",
      });
      fetchAddresses();
    } catch {
      alert("Could not save address. Please try again.");
    } finally {
      setSavingAddress(false);
    }
  }

  async function performTracking(refToTrack?: string) {
    const targetRef = (refToTrack || trackingReference).trim();
    if (!targetRef) {
      setTrackingError("Please enter your Order Reference or ID (e.g. #KQ-10023).");
      return;
    }

    setTrackingLoading(true);
    setTrackingError("");
    setTrackingResult(null);

    try {
      const params = new URLSearchParams();
      params.set("reference", targetRef);
      if (trackingPhone.trim()) {
        params.set("phone", trackingPhone.trim());
      }

      const res = await fetch(`/api/orders/track?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data?.success || !data.data) {
        setTrackingError(
          data?.error?.message || "No matching order found. Please check your order reference number.",
        );
        return;
      }

      setTrackingResult(data.data);
    } catch {
      setTrackingError("Unable to fetch tracking status. Please check your network and try again.");
    } finally {
      setTrackingLoading(false);
    }
  }

  async function handleSignOut() {
    await customerLogout();
    router.push("/");
  }

  if (loadingAuth) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-accent" />
      </div>
    );
  }

  // Unauthorized State
  if (!token) {
    return (
      <main className="container mx-auto px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Lock size={26} />
          </div>
          <h1 className="mt-5 font-serif text-2xl font-bold text-primary sm:text-3xl">
            Customer Sign In Required
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Please sign in to view your profile, manage saved delivery addresses, review order history, and track live shipments.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/login?redirect=/account"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition hover:bg-accent/90"
            >
              Sign In to Your Account <ArrowRight size={15} />
            </Link>
            <Link
              href="/collection"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-secondary"
            >
              Browse Collections
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-20 pt-6 text-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Title */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <nav className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-accent">
                Home
              </Link>
              <span>/</span>
              <span className="text-foreground">My Account</span>
            </nav>
            <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              Hello, {user?.name || "Customer"}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Manage your personal details, order receipts, and live tracking.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-border pb-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab("profile");
              router.replace("/account?tab=profile");
            }}
            className={`inline-flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === "profile"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <User size={16} />
            <span>Profile &amp; Addresses</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("orders");
              router.replace("/account?tab=orders");
            }}
            className={`inline-flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === "orders"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShoppingBag size={16} />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("track");
              router.replace("/account?tab=track");
            }}
            className={`inline-flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === "track"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Truck size={16} />
            <span>Live Order Tracking</span>
          </button>
        </div>

        {/* =========================================================================
            TAB 1: PROFILE & SAVED ADDRESSES
        ========================================================================= */}
        {activeTab === "profile" && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            {/* Left Card: Customer Profile Details */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-full bg-accent text-lg font-bold text-white shadow-sm">
                    {user?.name ? user.name.trim().charAt(0).toUpperCase() : "K"}
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-primary">
                      Personal Information
                    </h2>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <ShieldCheck size={13} /> Verified Customer
                    </span>
                  </div>
                </div>

                {!editingProfile && (
                  <button
                    type="button"
                    onClick={() => setEditingProfile(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary hover:text-accent"
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                )}
              </div>

              {profileMessage && (
                <div
                  className={`mt-4 rounded-lg p-3 text-xs ${
                    profileMessage.type === "success"
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border border-red-200 bg-red-50 text-accent"
                  }`}
                >
                  {profileMessage.text}
                </div>
              )}

              {!editingProfile ? (
                <div className="mt-6 space-y-4 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Full Name
                    </span>
                    <p className="mt-1 text-sm font-semibold text-primary">
                      {user?.name || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Email Address
                    </span>
                    <p className="mt-1 flex items-center gap-2 text-sm text-foreground">
                      <Mail size={14} className="text-muted-foreground" />
                      {user?.email}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Mobile Number
                    </span>
                    <p className="mt-1 flex items-center gap-2 text-sm text-foreground">
                      <Phone size={14} className="text-muted-foreground" />
                      {user?.phone ? `+91 ${user.phone}` : "No phone number added"}
                    </p>
                  </div>

                  <div className="border-t border-border pt-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Account Status
                    </span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded bg-secondary px-2.5 py-1 text-[11px] font-medium text-primary">
                        Orders: {user?.totalOrders || orders.length}
                      </span>
                      <span className="rounded bg-secondary px-2.5 py-1 text-[11px] font-medium text-primary">
                        Total Spent: Rs. {(user?.totalSpent || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProfileSave} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-foreground">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="e.g. Riya Sharma"
                      className="mt-1.5 h-10 w-full rounded-lg border border-border bg-white px-3 text-xs outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground">
                      Email Address (Locked)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ""}
                      className="mt-1.5 h-10 w-full rounded-lg border border-border bg-secondary/60 px-3 text-xs text-muted-foreground cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground">
                      Mobile Phone (10-digits)
                    </label>
                    <div className="mt-1.5 flex">
                      <span className="inline-flex items-center rounded-l-lg border border-r-0 border-border bg-secondary px-3 text-xs text-muted-foreground">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        pattern="[6-9][0-9]{9}"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ""))}
                        placeholder="9876543210"
                        className="h-10 w-full rounded-r-lg border border-border bg-white px-3 text-xs outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-accent/90 disabled:opacity-60"
                    >
                      {savingProfile ? (
                        <>
                          Saving <Loader2 size={13} className="animate-spin" />
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={savingProfile}
                      onClick={() => setEditingProfile(false)}
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-xs font-semibold text-foreground hover:bg-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Right Card: Saved Delivery Addresses */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="font-serif text-lg font-bold text-primary">
                    Saved Delivery Addresses
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Addresses saved for seamless 1-click checkout.
                  </p>
                </div>

                {!showAddressForm && (
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                  >
                    <Plus size={14} /> Add Address
                  </button>
                )}
              </div>

              {/* Add Address Form */}
              {showAddressForm && (
                <form
                  onSubmit={handleAddressSave}
                  className="mt-6 rounded-xl border border-accent/30 bg-accent/5 p-4 space-y-3.5"
                >
                  <div className="flex items-center justify-between border-b border-accent/20 pb-2">
                    <span className="text-xs font-bold text-primary">New Delivery Address</span>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="text-muted-foreground hover:text-accent"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-[11px] font-medium text-foreground">
                        Recipient Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.fullName}
                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                        placeholder="e.g. Riya Sharma"
                        className="mt-1 h-9 w-full rounded border border-border bg-white px-2.5 text-xs outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-foreground">
                        Phone Number (10 digits)
                      </label>
                      <input
                        type="tel"
                        required
                        pattern="[6-9][0-9]{9}"
                        maxLength={10}
                        value={newAddress.phone}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            phone: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        placeholder="9876543210"
                        className="mt-1 h-9 w-full rounded border border-border bg-white px-2.5 text-xs outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-foreground">
                      Street Address &amp; Landmark
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={newAddress.addressLine}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                      placeholder="Flat, House no., Building, Street, Area"
                      className="mt-1 w-full rounded border border-border bg-white p-2 text-xs outline-none focus:border-accent"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-foreground">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        placeholder="Jaipur"
                        className="mt-1 h-9 w-full rounded border border-border bg-white px-2.5 text-xs outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-foreground">
                        State
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.stateName}
                        onChange={(e) => setNewAddress({ ...newAddress, stateName: e.target.value })}
                        placeholder="Rajasthan"
                        className="mt-1 h-9 w-full rounded border border-border bg-white px-2.5 text-xs outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-foreground">
                        Pincode (6 digits)
                      </label>
                      <input
                        type="text"
                        required
                        pattern="[1-9][0-9]{5}"
                        maxLength={6}
                        value={newAddress.pincode}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            pincode: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        placeholder="302001"
                        className="mt-1 h-9 w-full rounded border border-border bg-white px-2.5 text-xs outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded bg-accent px-4 text-xs font-semibold text-white transition hover:bg-accent/90 disabled:opacity-60"
                    >
                      {savingAddress ? "Saving..." : "Save Delivery Address"}
                    </button>
                    <button
                      type="button"
                      disabled={savingAddress}
                      onClick={() => setShowAddressForm(false)}
                      className="h-9 rounded border border-border px-3 text-xs text-foreground hover:bg-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Address List */}
              <div className="mt-6 space-y-3">
                {loadingAddresses ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-accent" />
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                    <MapPin className="mx-auto size-8 text-muted-foreground/60" />
                    <p className="mt-2 font-medium text-foreground">No saved addresses yet</p>
                    <p className="mt-1">Add your shipping address for quicker checkout on future orders.</p>
                  </div>
                ) : (
                  addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="relative rounded-xl border border-border bg-secondary/30 p-4 text-xs transition hover:border-accent/40"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-primary">{addr.fullName}</span>
                        {addr.isDefault && (
                          <span className="rounded bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                            Default Address
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-muted-foreground">{addr.addressLine}</p>
                      <p className="text-muted-foreground">
                        {addr.city}, {addr.stateName} - {addr.pincode}
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-foreground">
                        Phone: +91 {addr.phone}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: ORDER HISTORY
        ========================================================================= */}
        {activeTab === "orders" && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-primary">
                  My Orders &amp; Receipts
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Track your previous purchases, view line items, and inspect delivery statuses.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchOrders}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-foreground hover:bg-secondary"
              >
                <RefreshCw size={13} className={loadingOrders ? "animate-spin" : ""} />
                <span>Refresh Orders</span>
              </button>
            </div>

            {loadingOrders ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <Loader2 className="size-8 animate-spin text-accent" />
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center shadow-sm">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <Package size={28} />
                </div>
                <h3 className="mt-4 font-serif text-xl font-bold text-primary">
                  No orders placed yet
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-muted-foreground">
                  You haven&apos;t placed any orders with this account yet. Discover our newest smart kids and family fashion collections!
                </p>
                <Link
                  href="/collection"
                  className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-6 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition hover:bg-accent/90"
                >
                  Explore Collection <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  const statusColors: Record<string, string> = {
                    placed: "bg-blue-50 text-blue-700 border-blue-200",
                    confirmed: "bg-sky-50 text-sky-700 border-sky-200",
                    processing: "bg-amber-50 text-amber-700 border-amber-200",
                    shipped: "bg-purple-50 text-purple-700 border-purple-200",
                    delivered: "bg-emerald-50 text-emerald-800 border-emerald-200",
                    cancelled: "bg-red-50 text-red-700 border-red-200",
                  };

                  return (
                    <div
                      key={order.id}
                      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md"
                    >
                      {/* Order Card Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/30 px-5 py-3.5 text-xs">
                        <div className="flex flex-wrap items-center gap-3">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              Order Reference
                            </span>
                            <p className="font-mono font-bold text-primary">
                              {order.reference.startsWith("#") ? order.reference : `#${order.reference}`}
                            </p>
                          </div>
                          <span className="text-border">|</span>
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              Placed Date
                            </span>
                            <p className="font-medium text-foreground">
                              {order.formattedDate}
                            </p>
                          </div>
                          <span className="text-border">|</span>
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              Total Amount
                            </span>
                            <p className="font-bold text-primary">
                              Rs. {order.total.toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              statusColors[order.orderStatus.toLowerCase()] ||
                              "bg-gray-100 text-gray-700 border-gray-200"
                            }`}
                          >
                            ● {order.orderStatus}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              setTrackingReference(order.reference);
                              setActiveTab("track");
                              performTracking(order.reference);
                            }}
                            className="inline-flex items-center gap-1 rounded-md bg-accent px-3 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:bg-accent/90"
                          >
                            <Truck size={12} /> Track
                          </button>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="p-5">
                        <div className="divide-y divide-border/60">
                          {order.items?.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                            >
                              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary/50">
                                {item.image ? (
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex size-full items-center justify-center text-muted-foreground">
                                    <ShoppingBag size={20} />
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0 flex-1 text-xs">
                                <Link
                                  href={`/products/${item.slug}`}
                                  className="font-semibold text-primary hover:text-accent line-clamp-1"
                                >
                                  {item.name}
                                </Link>
                                <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                                  {item.size && <span>Size: <strong className="text-foreground">{item.size}</strong></span>}
                                  {item.color && <span>Color: <strong className="text-foreground">{item.color}</strong></span>}
                                  <span>Qty: <strong className="text-foreground">{item.quantity}</strong></span>
                                </div>
                              </div>

                              <div className="text-right text-xs">
                                <span className="font-semibold text-primary">
                                  Rs. {item.lineTotal.toLocaleString("en-IN")}
                                </span>
                                <p className="text-[10px] text-muted-foreground">
                                  Rs. {item.price} each
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer & Expand Details Toggle */}
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs">
                          <div className="text-muted-foreground">
                            Delivery to: <strong className="text-foreground">{order.customerName}</strong> ({order.city}, {order.stateName} - {order.pinCode})
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setExpandedOrderId(isExpanded ? null : order.id)
                            }
                            className="font-semibold text-accent underline underline-offset-2 hover:text-accent/80"
                          >
                            {isExpanded ? "Hide Receipt Breakdown" : "View Price Breakdown"}
                          </button>
                        </div>

                        {/* Collapsible Receipt Breakdown */}
                        {isExpanded && (
                          <div className="mt-4 rounded-xl border border-border bg-secondary/40 p-4 text-xs space-y-1.5 animate-in fade-in">
                            <div className="flex justify-between text-muted-foreground">
                              <span>Subtotal</span>
                              <span>Rs. {order.subtotal.toLocaleString("en-IN")}</span>
                            </div>
                            {order.discount > 0 && (
                              <div className="flex justify-between text-emerald-700">
                                <span>Discount ({order.promoCode || "Applied Coupon"})</span>
                                <span>- Rs. {order.discount.toLocaleString("en-IN")}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-muted-foreground">
                              <span>Shipping</span>
                              <span>{order.shipping === 0 ? "FREE" : `Rs. ${order.shipping}`}</span>
                            </div>
                            <div className="flex justify-between border-t border-border pt-2 text-sm font-bold text-primary">
                              <span>Grand Total</span>
                              <span>Rs. {order.total.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="pt-2 text-[11px] text-muted-foreground">
                              Payment Method: <span className="uppercase font-semibold text-foreground">{order.paymentMethod}</span> | Status: <span className="capitalize font-semibold text-foreground">{order.paymentStatus}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: LIVE ORDER TRACKING
        ========================================================================= */}
        {activeTab === "track" && (
          <div className="mt-8 space-y-8">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="max-w-2xl">
                <h2 className="font-serif text-2xl font-bold text-primary">
                  Live Order Tracking
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Enter your order reference number (e.g. #KQ-10023) to see the live dispatch and delivery timeline.
                </p>

                {/* Tracking Search Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    performTracking();
                  }}
                  className="mt-5 flex flex-wrap gap-3"
                >
                  <div className="relative min-w-[240px] flex-1">
                    <Search
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      type="text"
                      required
                      value={trackingReference}
                      onChange={(e) => setTrackingReference(e.target.value)}
                      placeholder="Order Reference (e.g. #KQ-10023)"
                      className="h-11 w-full rounded-lg border border-border bg-white pl-10 pr-4 text-xs font-mono outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  <input
                    type="tel"
                    value={trackingPhone}
                    onChange={(e) => setTrackingPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="Phone number (optional)"
                    className="h-11 w-44 rounded-lg border border-border bg-white px-3 text-xs outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
                  />

                  <button
                    type="submit"
                    disabled={trackingLoading}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-6 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition hover:bg-accent/90 disabled:opacity-60"
                  >
                    {trackingLoading ? (
                      <>
                        Tracking <Loader2 size={14} className="animate-spin" />
                      </>
                    ) : (
                      <>
                        Track Order <Truck size={15} />
                      </>
                    )}
                  </button>
                </form>

                {trackingError && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-accent">
                    {trackingError}
                  </div>
                )}
              </div>
            </div>

            {/* Tracking Result Timeline */}
            {trackingResult && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-8 animate-in fade-in">
                {/* Status Hero Banner */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-accent/20 bg-accent/5 p-4">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                      Package Status
                    </span>
                    <h3 className="font-serif text-xl font-bold text-primary capitalize">
                      {trackingResult.orderStatus}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Order Reference: <strong className="font-mono text-foreground">{trackingResult.reference}</strong>
                    </p>
                  </div>

                  <div className="text-right text-xs">
                    {trackingResult.shippingCarrier && (
                      <p className="text-muted-foreground">
                        Carrier: <strong className="text-foreground">{trackingResult.shippingCarrier}</strong>
                      </p>
                    )}
                    {trackingResult.trackingNumber && (
                      <p className="font-mono text-muted-foreground">
                        AWB / Tracking: <strong className="text-primary">{trackingResult.trackingNumber}</strong>
                      </p>
                    )}
                    <span className="mt-1 inline-block rounded bg-accent px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                      {trackingResult.paymentStatus === "paid" ? "Paid Online" : "Cash on Delivery"}
                    </span>
                  </div>
                </div>

                {/* 5-Step Visual Timeline */}
                <div>
                  <h4 className="font-serif text-sm font-bold text-primary uppercase tracking-wider">
                    Shipment Journey
                  </h4>

                  {(() => {
                    const status = trackingResult.orderStatus.toLowerCase();
                    const steps = [
                      { id: "placed", title: "Order Placed", desc: trackingResult.formattedDate },
                      { id: "confirmed", title: "Confirmed & Prepared", desc: "Order verified by KiddieQuick" },
                      { id: "shipped", title: "Packed & Dispatched", desc: trackingResult.shippingCarrier || "Courier partner assigned" },
                      { id: "out_for_delivery", title: "Out for Delivery", desc: "Arriving at delivery address" },
                      { id: "delivered", title: "Delivered", desc: "Package handed over" },
                    ];

                    let currentStepIndex = 0;
                    if (status === "placed") currentStepIndex = 0;
                    else if (status === "confirmed" || status === "processing") currentStepIndex = 1;
                    else if (status === "shipped") currentStepIndex = 2;
                    else if (status === "out_for_delivery") currentStepIndex = 3;
                    else if (status === "delivered") currentStepIndex = 4;
                    else if (status === "cancelled") currentStepIndex = -1;

                    return (
                      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-5 relative">
                        {steps.map((step, idx) => {
                          const isDone = currentStepIndex >= idx;
                          const isCurrent = currentStepIndex === idx;

                          return (
                            <div key={step.id} className="relative flex sm:flex-col items-center gap-3 text-left sm:text-center">
                              {/* Step Node */}
                              <div
                                className={`flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition ${
                                  isDone
                                    ? "border-accent bg-accent text-white shadow-sm"
                                    : "border-border bg-secondary text-muted-foreground"
                                } ${isCurrent ? "ring-4 ring-accent/20" : ""}`}
                              >
                                {isDone ? (
                                  <Check size={18} />
                                ) : (
                                  <span className="text-xs font-bold">{idx + 1}</span>
                                )}
                              </div>

                              <div>
                                <p className={`text-xs font-bold ${isDone ? "text-primary" : "text-muted-foreground"}`}>
                                  {step.title}
                                </p>
                                <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-2">
                                  {step.desc}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Delivery Information & Items in Package */}
                <div className="grid gap-6 border-t border-border pt-6 md:grid-cols-2">
                  <div className="rounded-xl border border-border bg-secondary/30 p-4 text-xs">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Destination Address
                    </span>
                    <p className="mt-2 font-bold text-primary">{trackingResult.customerName}</p>
                    <p className="mt-1 text-muted-foreground">{trackingResult.address}</p>
                    <p className="text-muted-foreground">
                      {trackingResult.city}, {trackingResult.stateName} - {trackingResult.pinCode}
                    </p>
                    <p className="mt-2 font-mono text-[11px] text-foreground">
                      Contact: +91 {trackingResult.customerPhone}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/30 p-4 text-xs">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Package Summary ({trackingResult.items?.length || 0} items)
                    </span>
                    <div className="mt-2 max-h-36 overflow-y-auto space-y-2 pr-1">
                      {trackingResult.items?.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <span className="font-medium text-primary line-clamp-1">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="font-semibold text-foreground shrink-0 ml-2">
                            Rs. {item.lineTotal.toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-between border-t border-border/70 pt-2 font-bold text-primary">
                      <span>Total Value</span>
                      <span>Rs. {trackingResult.total.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* Need Help Callout */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-secondary/20 p-4 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <HelpCircle size={16} className="text-accent" />
                    <span>Have questions about this package or need urgent delivery help?</span>
                  </div>
                  <Link
                    href="/contact"
                    className="font-semibold text-accent underline underline-offset-2 hover:text-accent/80"
                  >
                    Contact KiddieQuick Support →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function CustomerAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-accent" />
        </div>
      }
    >
      <CustomerAccountContent />
    </Suspense>
  );
}
