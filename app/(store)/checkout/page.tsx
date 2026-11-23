"use client";

import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Loader2, LockKeyhole, MapPinCheck, Tag } from "lucide-react";
import {
  DEMO_PROMO_CODES,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
  computePromoDiscount,
  formatPrice,
  type PromoCodeRule,
} from "@/src/lib/store/catalog";
import {
  checkoutFormSchema,
  type CheckoutFieldErrors,
  type CheckoutFieldName,
} from "@/src/lib/store/checkout-validation";
import { BlogCoverImage } from "@/components/storefront/blog-cover-image";
import { useCart, type CartItem } from "@/components/storefront/cart-provider";
import { PageIntro, SiteFooter, SiteHeader } from "@/components/site-shell";
import {
  getCustomerToken,
  getCustomerUser,
  getCustomerAuthHeaders,
} from "@/src/lib/api/customer-auth";

type IndianStateOption = {
  code: string;
  name: string;
};

type CompletedOrder = {
  reference: string;
  customerName: string;
  city: string;
  stateName: string;
  pinCode: string;
  paymentMethod: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
};

function CheckoutForm() {
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("buyNow") === "1";
  const { items, selectedTotal, clearSelectedItems } = useCart();
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);

  useEffect(() => {
    if (isBuyNow) {
      try {
        const stored = window.sessionStorage.getItem("kiddiequick_buynow_item");
        if (stored) {
          const parsed = JSON.parse(stored) as CartItem;
          if (parsed && parsed.product) {
            setBuyNowItem(parsed);
          }
        }
      } catch {
        // ignore
      }
    }
  }, [isBuyNow]);

  const activeItems: CartItem[] = useMemo(() => {
    if (isBuyNow && buyNowItem) {
      return [buyNowItem];
    }
    return items.filter((item) => item.selected);
  }, [isBuyNow, buyNowItem, items]);

  const activeSubtotal: number = useMemo(() => {
    if (isBuyNow && buyNowItem) {
      return (
        (buyNowItem.unitPrice || buyNowItem.product.price) * buyNowItem.quantity
      );
    }
    return selectedTotal;
  }, [isBuyNow, buyNowItem, selectedTotal]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [stateName, setStateName] = useState("");
  const [city, setCity] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI / QR");

  const [states, setStates] = useState<IndianStateOption[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  const [lookingUpPin, setLookingUpPin] = useState(false);
  const [pinVerifiedInfo, setPinVerifiedInfo] = useState("");
  const [pinLookupError, setPinLookupError] = useState("");
  const [serverOrderError, setServerOrderError] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [validatingPromo, setValidatingPromo] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<CheckoutFieldErrors>({});

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCodeRule | null>(null);
  const [promoFeedback, setPromoFeedback] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    fetch("/api/locations/india")
      .then((res) => res.json())
      .then(
        (payload: {
          success?: boolean;
          data?: { states?: IndianStateOption[] };
        }) => {
          if (cancelled || !payload?.success || !payload.data?.states) return;
          setStates(payload.data.states);
        },
      )
      .catch(() => {
        // Keep manual fallback empty cleanly if offline
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-prefill details if logged in as customer
  useEffect(() => {
    const user = getCustomerUser();
    if (user) {
      if (user.name) setFullName((prev) => prev || user.name);
      if (user.email) setEmail((prev) => prev || user.email);
      if (user.phone) setPhone((prev) => prev || user.phone || "");

      const token = getCustomerToken();
      if (token) {
        fetch("/api/users/me/addresses", {
          headers: getCustomerAuthHeaders(),
        })
          .then((r) => r.json())
          .then((res) => {
            if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
              type ServerAddress = {
                id: string | number;
                addressLine?: string;
                city?: string;
                stateName?: string;
                stateCode?: string;
                pincode?: string;
                phone?: string;
                isDefault?: boolean;
              };
              const addrs = res.data as ServerAddress[];
              const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
              if (defaultAddr) {
                if (defaultAddr.addressLine) {
                  setAddress((prev) => prev || defaultAddr.addressLine || "");
                }
                if (defaultAddr.city) {
                  setCity((prev) => prev || defaultAddr.city || "");
                }
                if (defaultAddr.stateName) {
                  setStateName((prev) => prev || defaultAddr.stateName || "");
                }
                if (defaultAddr.stateCode) {
                  setStateCode((prev) => prev || defaultAddr.stateCode || "");
                }
                if (defaultAddr.pincode) {
                  setPinCode((prev) => prev || defaultAddr.pincode || "");
                }
                if (defaultAddr.phone) {
                  setPhone((prev) => prev || defaultAddr.phone || "");
                }
              }
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    if (pinCode.length !== 6) {
      setPinVerifiedInfo("");
      setPinLookupError("");
      setLookingUpPin(false);
      return;
    }

    if (!/^[1-9][0-9]{5}$/.test(pinCode)) {
      setPinVerifiedInfo("");
      setPinLookupError("PIN code must be 6 digits and cannot start with 0.");
      return;
    }

    const controller = new AbortController();
    setLookingUpPin(true);
    setPinLookupError("");
    setPinVerifiedInfo("");

    fetch(`/api/shipping/pincode/${encodeURIComponent(pinCode)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        const payload = (await res.json().catch(() => null)) as {
          success?: boolean;
          data?: {
            pincode: string;
            stateCode: string;
            stateName: string;
            city: string;
            office: string;
            cities: string[];
          };
          error?: { message?: string };
        } | null;

        if (!res.ok || !payload?.success || !payload.data) {
          throw new Error(
            payload?.error?.message ?? "Enter a valid 6-digit Indian PIN code.",
          );
        }

        const matched = payload.data;
        if (matched.stateCode) {
          setStateCode(matched.stateCode);
          setStateName(matched.stateName);
        }
        if (Array.isArray(matched.cities) && matched.cities.length > 0) {
          setCities(matched.cities);
        }
        if (matched.city) {
          setCity(matched.city);
        }
        setPinVerifiedInfo(
          matched.office
            ? `${matched.office}, ${matched.stateName}`
            : `${matched.city}, ${matched.stateName}`,
        );
        setFieldErrors((prev) => ({
          ...prev,
          pinCode: undefined,
          stateCode: undefined,
          stateName: undefined,
          city: undefined,
        }));
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setPinVerifiedInfo("");
        setPinLookupError(
          error instanceof Error ? error.message : "Could not verify PIN code.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLookingUpPin(false);
        }
      });

    return () => controller.abort();
  }, [pinCode]);

  async function handleStateChange(nextCode: string) {
    const selectedState = states.find((item) => item.code === nextCode);
    setStateCode(nextCode);
    setStateName(selectedState?.name ?? "");
    setCity("");
    setCities([]);
    setFieldErrors((prev) => ({
      ...prev,
      stateCode: undefined,
      stateName: undefined,
      city: undefined,
    }));

    if (!nextCode) return;

    setLoadingCities(true);
    try {
      const response = await fetch(
        `/api/locations/india?stateCode=${encodeURIComponent(nextCode)}`,
      );
      const payload = (await response.json().catch(() => null)) as {
        success?: boolean;
        data?: { cities?: string[] };
      } | null;
      if (response.ok && payload?.success && payload.data?.cities) {
        setCities(payload.data.cities);
      }
    } catch {
      // Ignore network errors cleanly
    } finally {
      setLoadingCities(false);
    }
  }

  function validateSingleField(
    name: CheckoutFieldName,
    overrideValue?: string,
  ) {
    const candidate = {
      fullName,
      email,
      address,
      stateCode,
      stateName,
      city,
      pinCode,
      phone,
      ...(overrideValue !== undefined ? { [name]: overrideValue } : {}),
    };
    const parsed = checkoutFormSchema.safeParse(candidate);
    if (parsed.success) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
      return;
    }
    const matchingIssue = parsed.error.issues.find(
      (issue) => issue.path[0] === name,
    );
    setFieldErrors((prev) => ({
      ...prev,
      [name]: matchingIssue?.message,
    }));
  }

  const discount = computePromoDiscount(activeSubtotal, appliedPromo);
  const discountedSubtotal = Math.max(0, activeSubtotal - discount);
  const shippingFee =
    activeSubtotal === 0 || discountedSubtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : STANDARD_SHIPPING_FEE;
  const grandTotal = discountedSubtotal + shippingFee;

  async function applyPromoCode() {
    const normalized = promoInput.trim().toUpperCase();
    if (!normalized) {
      setAppliedPromo(null);
      setPromoFeedback(null);
      return;
    }

    setValidatingPromo(true);
    setPromoFeedback(null);
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          code: normalized,
          subtotal: activeSubtotal,
          cartTotal: activeSubtotal,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success || !payload.data?.valid) {
        setAppliedPromo(null);
        setPromoFeedback({
          ok: false,
          message:
            payload?.error?.message ??
            "Code not valid or expired. Try WELCOME10 or FESTIVE25.",
        });
        return;
      }

      const coupon = payload.data;
      setAppliedPromo({
        code: coupon.code,
        type: coupon.discountType === "fixed" ? "fixed" : "percentage",
        value: coupon.discountValue,
        label: coupon.label || `${coupon.discountValue}% off offer`,
        active: true,
      });
      setPromoFeedback({
        ok: true,
        message: coupon.message || `Applied ${coupon.code} successfully!`,
      });
    } catch {
      setPromoFeedback({
        ok: false,
        message: "Unable to validate coupon with server right now.",
      });
    } finally {
      setValidatingPromo(false);
    }
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeItems.length) return;
    setServerOrderError("");

    const parsed = checkoutFormSchema.safeParse({
      fullName,
      email,
      address,
      stateCode,
      stateName,
      city,
      pinCode,
      phone,
    });

    const nextErrors: CheckoutFieldErrors = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as CheckoutFieldName | undefined;
        if (key && !nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
    }

    if (pinLookupError) {
      nextErrors.pinCode = pinLookupError;
    }

    if (Object.keys(nextErrors).length > 0 || !parsed.success) {
      setFieldErrors(nextErrors);
      const firstInvalid = event.currentTarget.querySelector<HTMLElement>(
        "[aria-invalid='true']",
      );
      firstInvalid?.focus();
      return;
    }

    if (!pinVerifiedInfo) {
      setLookingUpPin(true);
      try {
        const res = await fetch(
          `/api/shipping/pincode/${encodeURIComponent(parsed.data.pinCode)}`,
        );
        const payload = (await res.json().catch(() => null)) as {
          success?: boolean;
          error?: { message?: string };
        } | null;
        if (!res.ok || !payload?.success) {
          const msg =
            payload?.error?.message ?? "Enter a valid 6-digit Indian PIN code.";
          setPinLookupError(msg);
          setFieldErrors((prev) => ({ ...prev, pinCode: msg }));
          return;
        }
      } catch {
        setFieldErrors((prev) => ({
          ...prev,
          pinCode: "Unable to verify PIN code right now.",
        }));
        return;
      } finally {
        setLookingUpPin(false);
      }
    }

    setSubmittingOrder(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: getCustomerAuthHeaders(),
        body: JSON.stringify({
          fullName: parsed.data.fullName,
          email: parsed.data.email,
          phone: parsed.data.phone,
          address: parsed.data.address,
          city: parsed.data.city,
          stateCode: parsed.data.stateCode,
          stateName: parsed.data.stateName,
          pinCode: parsed.data.pinCode,
          paymentMethod,
          promoCode: appliedPromo?.code,
          items: activeItems.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            price: item.unitPrice ?? item.product.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color || "Standard",
            sku: item.sku,
            variant_id: item.variantId,
            image: item.product.image,
          })),
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success || !payload.data) {
        if (payload?.error?.fieldErrors) {
          const mappedErrors: CheckoutFieldErrors = {};
          for (const [k, msgs] of Object.entries(payload.error.fieldErrors)) {
            if (Array.isArray(msgs) && msgs.length > 0) {
              mappedErrors[k as CheckoutFieldName] = msgs[0] as string;
            }
          }
          setFieldErrors((prev) => ({ ...prev, ...mappedErrors }));
        }
        setServerOrderError(
          payload?.error?.message ?? "Failed to place order.",
        );
        return;
      }

      const order = payload.data;
      setCompletedOrder({
        reference: order.reference || `MV-${order.id}`,
        customerName: order.customerName,
        city: order.city,
        stateName: order.stateName,
        pinCode: order.pinCode,
        paymentMethod: order.paymentMethod,
        items: activeItems,
        subtotal: order.subtotal,
        discount: order.discount,
        shipping: order.shipping,
        total: order.total,
      });
      if (isBuyNow) {
        try {
          window.sessionStorage.removeItem("kiddiequick_buynow_item");
        } catch {
          // ignore
        }
      } else {
        clearSelectedItems();
      }
    } catch (err) {
      setServerOrderError(
        err instanceof Error
          ? err.message
          : "Unable to place order. Please try again.",
      );
    } finally {
      setSubmittingOrder(false);
    }
  }

  function inputBorderClass(hasError?: string) {
    return hasError
      ? "border-accent bg-accent/10"
      : "border-input bg-white focus:border-primary";
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <PageIntro
        eyebrow="KiddieQuick · Checkout preview"
        title={completedOrder ? "Thank you" : "A few details"}
        copy={
          completedOrder
            ? "Your demo order preview is ready. No payment has been charged."
            : "Complete the form to preview the final step. This demo does not charge you or create a real payment."
        }
      />
      <div className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
        {completedOrder ? (
          <section className="mx-auto max-w-3xl border border-border bg-white p-7 sm:p-10">
            <div className="text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
                <Check />
              </span>
              <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
                Order reference #{completedOrder.reference}
              </p>
              <h2 className="mt-2 font-serif text-3xl">
                Thank you, {completedOrder.customerName}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Preview order prepared for {completedOrder.city},{" "}
                {completedOrder.stateName} – {completedOrder.pinCode} (
                {completedOrder.paymentMethod}). Checkout payments and backend
                order storage are in demo mode.
              </p>
            </div>

            <div className="mt-8 border-t border-border pt-6">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Items in your preview
              </h3>
              <div className="mt-4 space-y-3">
                {completedOrder.items.map(({ lineKey, product, quantity }) => (
                  <div
                    key={lineKey}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {product.name}{" "}
                      <span className="text-xs text-muted-foreground">
                        (Qty {quantity})
                      </span>
                    </span>
                    <span>{formatPrice(product.price * quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(completedOrder.subtotal)}</span>
                </div>
                {completedOrder.discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Promo savings</span>
                    <span>−{formatPrice(completedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {completedOrder.shipping === 0
                      ? "Free"
                      : formatPrice(completedOrder.shipping)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold text-foreground">
                  <span>Total</span>
                  <span>{formatPrice(completedOrder.total)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/collection"
                className="inline-block bg-primary px-6 py-3 text-[10px] uppercase tracking-[0.18em] text-white transition hover:bg-primary/90"
              >
                Continue shopping
              </Link>
            </div>
          </section>
        ) : activeItems.length ? (
          <form
            noValidate
            onSubmit={submitOrder}
            className="grid gap-8 lg:grid-cols-[1fr_360px]"
          >
            <section className="border border-border bg-white p-5 sm:p-7">
              <div className="flex items-center gap-2 border-b border-border pb-4">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs text-white">
                  1
                </span>
                <h2 className="font-serif text-2xl">Delivery information</h2>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-medium text-foreground/90">
                  Full name *
                  <input
                    required
                    autoComplete="name"
                    value={fullName}
                    aria-invalid={Boolean(fieldErrors.fullName)}
                    onChange={(event) => {
                      const next = event.target.value;
                      setFullName(next);
                      if (fieldErrors.fullName) {
                        validateSingleField("fullName", next);
                      }
                    }}
                    onBlur={() => validateSingleField("fullName")}
                    className={`mt-2 w-full border px-3 py-3 text-sm font-normal text-foreground outline-none ${inputBorderClass(fieldErrors.fullName)}`}
                    placeholder="Your full name"
                  />
                  {fieldErrors.fullName && (
                    <span
                      role="alert"
                      className="mt-1.5 block text-[11px] font-normal text-accent"
                    >
                      {fieldErrors.fullName}
                    </span>
                  )}
                </label>

                <label className="text-xs font-medium text-foreground/90">
                  Email address *
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={email}
                    aria-invalid={Boolean(fieldErrors.email)}
                    onChange={(event) => {
                      const next = event.target.value;
                      setEmail(next);
                      if (fieldErrors.email) {
                        validateSingleField("email", next);
                      }
                    }}
                    onBlur={() => validateSingleField("email")}
                    className={`mt-2 w-full border px-3 py-3 text-sm font-normal text-foreground outline-none ${inputBorderClass(fieldErrors.email)}`}
                    placeholder="you@example.com"
                  />
                  {fieldErrors.email && (
                    <span
                      role="alert"
                      className="mt-1.5 block text-[11px] font-normal text-accent"
                    >
                      {fieldErrors.email}
                    </span>
                  )}
                </label>

                <label className="text-xs font-medium text-foreground/90 sm:col-span-2">
                  Address *
                  <input
                    required
                    autoComplete="street-address"
                    value={address}
                    aria-invalid={Boolean(fieldErrors.address)}
                    onChange={(event) => {
                      const next = event.target.value;
                      setAddress(next);
                      if (fieldErrors.address) {
                        validateSingleField("address", next);
                      }
                    }}
                    onBlur={() => validateSingleField("address")}
                    className={`mt-2 w-full border px-3 py-3 text-sm font-normal text-foreground outline-none ${inputBorderClass(fieldErrors.address)}`}
                    placeholder="House / flat number, building and street"
                  />
                  {fieldErrors.address && (
                    <span
                      role="alert"
                      className="mt-1.5 block text-[11px] font-normal text-accent"
                    >
                      {fieldErrors.address}
                    </span>
                  )}
                </label>

                <label className="text-xs font-medium text-foreground/90">
                  PIN code *
                  <div className="relative mt-2">
                    <input
                      required
                      inputMode="numeric"
                      maxLength={6}
                      autoComplete="postal-code"
                      value={pinCode}
                      aria-invalid={Boolean(
                        fieldErrors.pinCode || pinLookupError,
                      )}
                      onChange={(event) => {
                        const digits = event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6);
                        setPinCode(digits);
                        if (fieldErrors.pinCode) {
                          validateSingleField("pinCode", digits);
                        }
                      }}
                      onBlur={() => validateSingleField("pinCode")}
                      className={`w-full border px-3 py-3 pr-9 text-sm font-normal text-foreground outline-none ${inputBorderClass(fieldErrors.pinCode || pinLookupError)}`}
                      placeholder="6-digit PIN (e.g. 302001)"
                    />
                    {lookingUpPin && (
                      <Loader2
                        size={15}
                        className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-accent"
                      />
                    )}
                  </div>
                  {pinLookupError || fieldErrors.pinCode ? (
                    <span
                      role="alert"
                      className="mt-1.5 block text-[11px] font-normal text-accent"
                    >
                      {pinLookupError || fieldErrors.pinCode}
                    </span>
                  ) : pinVerifiedInfo ? (
                    <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-normal text-success">
                      <MapPinCheck size={12} /> {pinVerifiedInfo}
                    </span>
                  ) : (
                    <span className="mt-1.5 block text-[11px] font-normal text-muted-foreground">
                      Enter 6-digit PIN to auto-fill State &amp; City
                    </span>
                  )}
                </label>

                <label className="text-xs font-medium text-foreground/90">
                  State *
                  <select
                    required
                    autoComplete="address-level1"
                    value={stateCode}
                    aria-invalid={Boolean(fieldErrors.stateCode)}
                    onChange={(event) => handleStateChange(event.target.value)}
                    onBlur={() => validateSingleField("stateCode")}
                    className={`mt-2 w-full border px-3 py-3 text-sm font-normal text-foreground outline-none ${inputBorderClass(fieldErrors.stateCode)}`}
                  >
                    <option value="">Select state</option>
                    {states.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.stateCode && (
                    <span
                      role="alert"
                      className="mt-1.5 block text-[11px] font-normal text-accent"
                    >
                      {fieldErrors.stateCode}
                    </span>
                  )}
                </label>

                <label className="text-xs font-medium text-foreground/90">
                  City *
                  <select
                    required
                    disabled={!stateCode || loadingCities}
                    autoComplete="address-level2"
                    value={city}
                    aria-invalid={Boolean(fieldErrors.city)}
                    onChange={(event) => {
                      const next = event.target.value;
                      setCity(next);
                      validateSingleField("city", next);
                    }}
                    onBlur={() => validateSingleField("city")}
                    className={`mt-2 w-full border px-3 py-3 text-sm font-normal text-foreground outline-none disabled:cursor-not-allowed disabled:bg-background disabled:text-muted-foreground ${inputBorderClass(fieldErrors.city)}`}
                  >
                    <option value="">
                      {!stateCode
                        ? "Select state or enter PIN first"
                        : loadingCities
                          ? "Loading cities..."
                          : "Select city"}
                    </option>
                    {cities.map((cityName) => (
                      <option key={cityName} value={cityName}>
                        {cityName}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.city && (
                    <span
                      role="alert"
                      className="mt-1.5 block text-[11px] font-normal text-accent"
                    >
                      {fieldErrors.city}
                    </span>
                  )}
                </label>

                <label className="text-xs font-medium text-foreground/90">
                  Phone number *
                  <input
                    required
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={14}
                    value={phone}
                    aria-invalid={Boolean(fieldErrors.phone)}
                    onChange={(event) => {
                      const cleaned = event.target.value.replace(
                        /[^+\d\s-]/g,
                        "",
                      );
                      setPhone(cleaned);
                      if (fieldErrors.phone) {
                        validateSingleField("phone", cleaned);
                      }
                    }}
                    onBlur={() => validateSingleField("phone")}
                    className={`mt-2 w-full border px-3 py-3 text-sm font-normal text-foreground outline-none ${inputBorderClass(fieldErrors.phone)}`}
                    placeholder="+91 98765 43210"
                  />
                  {fieldErrors.phone ? (
                    <span
                      role="alert"
                      className="mt-1.5 block text-[11px] font-normal text-accent"
                    >
                      {fieldErrors.phone}
                    </span>
                  ) : (
                    <span className="mt-1.5 block text-[11px] font-normal text-muted-foreground">
                      10-digit Indian mobile number for courier updates
                    </span>
                  )}
                </label>
              </div>

              <div className="mt-8 flex items-center gap-2 border-b border-border pb-4">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs text-white">
                  2
                </span>
                <h2 className="font-serif text-2xl">Payment method</h2>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {["UPI / QR", "Credit / Debit Card", "Cash on Delivery"].map(
                  (option) => (
                    <label
                      key={option}
                      className={`flex cursor-pointer items-center gap-2 border px-3 py-3 text-xs transition ${
                        paymentMethod === option
                          ? "border-primary bg-background font-medium"
                          : "border-input"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={option}
                        checked={paymentMethod === option}
                        onChange={() => setPaymentMethod(option)}
                        className="accent-accent"
                      />
                      {option}
                    </label>
                  ),
                )}
              </div>

              <div className="mt-6 flex gap-3 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
                <LockKeyhole size={15} className="mt-0.5 shrink-0" />
                <p>
                  Checkout is in demo mode. No payment details are requested or
                  processed.
                </p>
              </div>
            </section>

            <aside className="h-fit border border-border bg-white p-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="font-serif text-xl">Your order</h2>
                {isBuyNow && (
                  <span className="rounded bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                    Buy Now
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-col gap-4">
                {activeItems.map(
                  ({
                    lineKey,
                    product,
                    size,
                    color,
                    sku,
                    unitPrice,
                    quantity,
                  }) => (
                    <div key={lineKey} className="flex gap-3">
                      <div className="relative size-14 shrink-0 overflow-hidden bg-secondary">
                        <BlogCoverImage
                          src={product.image}
                          alt={product.name}
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-serif text-sm font-medium text-primary">
                          {product.name}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                          {color && (
                            <span className="font-medium text-primary">
                              {color}
                            </span>
                          )}
                          {size && size !== "standard" && (
                            <span>· Size: {size}</span>
                          )}
                          <span>· Qty {quantity}</span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-accent">
                        {formatPrice((unitPrice || product.price) * quantity)}
                      </span>
                    </div>
                  ),
                )}
              </div>

              <div className="mt-5 border-t border-border pt-4">
                <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <Tag size={12} /> Promo code
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    value={promoInput}
                    onChange={(event) => setPromoInput(event.target.value)}
                    placeholder="WELCOME10"
                    className="min-w-0 flex-1 border border-input px-3 py-2 text-xs uppercase"
                  />
                  <button
                    type="button"
                    disabled={validatingPromo}
                    onClick={applyPromoCode}
                    className="border border-primary px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-primary hover:bg-secondary disabled:opacity-50"
                  >
                    {validatingPromo ? "..." : "Apply"}
                  </button>
                </div>
                {promoFeedback && (
                  <p
                    className={`mt-2 text-[11px] ${
                      promoFeedback.ok ? "text-success" : "text-accent"
                    }`}
                  >
                    {promoFeedback.message}
                  </p>
                )}
              </div>

              <div className="mt-5 flex justify-between border-t border-border pt-4 text-sm">
                <span>Subtotal</span>
                <strong>{formatPrice(activeSubtotal)}</strong>
              </div>
              {discount > 0 && (
                <div className="mt-2 flex justify-between text-xs text-success">
                  <span>Discount ({appliedPromo?.code})</span>
                  <span>−{formatPrice(discount)}</span>
                </div>
              )}
              <p className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>Shipping</span>
                <span>
                  {shippingFee === 0 ? "Free" : formatPrice(shippingFee)}
                </span>
              </p>
              <div className="mt-4 flex justify-between border-t border-border pt-4">
                <span className="font-semibold">Total</span>
                <strong>{formatPrice(grandTotal)}</strong>
              </div>

              {serverOrderError && (
                <div
                  role="alert"
                  className="mt-4 border border-accent/30 bg-accent/10 p-3 text-xs leading-5 text-accent"
                >
                  {serverOrderError}
                </div>
              )}

              <button
                type="submit"
                disabled={lookingUpPin || submittingOrder}
                className="mt-5 w-full bg-primary py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-primary/90 disabled:opacity-50"
              >
                {submittingOrder
                  ? "Placing order..."
                  : lookingUpPin
                    ? "Verifying PIN..."
                    : isBuyNow
                      ? `Complete Buy Now · ${formatPrice(grandTotal)}`
                      : `Place order · ${formatPrice(grandTotal)}`}
              </button>
              <p className="mt-3 text-center text-[9px] leading-4 text-muted-foreground">
                Authentic handcrafted pieces · Insured pan-India dispatch
              </p>
            </aside>
          </form>
        ) : (
          <div className="mx-auto max-w-3xl border border-dashed border-input bg-white p-8 text-center">
            <h2 className="font-serif text-2xl">
              {isBuyNow ? "No Buy Now item selected" : "Your cart is empty"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isBuyNow
                ? "Please choose a product and click Buy Now, or browse our collection."
                : "Add an item before continuing to checkout."}
            </p>
            <Link
              href="/collection"
              className="mt-5 inline-block bg-primary px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-white"
            >
              Explore the collection
            </Link>
          </div>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <SiteHeader />
          <div className="container mx-auto px-4 py-16 text-center text-sm text-muted-foreground">
            Loading checkout...
          </div>
          <SiteFooter />
        </div>
      }
    >
      <CheckoutForm />
    </Suspense>
  );
}
