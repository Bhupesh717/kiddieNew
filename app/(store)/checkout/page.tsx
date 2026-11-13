"use client";

import { useEffect, useState, type FormEvent } from "react";
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

export default function CheckoutPage() {
  const { items, selectedTotal, clearSelectedItems } = useCart();
  const selectedItems = items.filter((item) => item.selected);

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

  const discount = computePromoDiscount(selectedTotal, appliedPromo);
  const discountedSubtotal = Math.max(0, selectedTotal - discount);
  const shippingFee =
    selectedTotal === 0 || discountedSubtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : STANDARD_SHIPPING_FEE;
  const grandTotal = discountedSubtotal + shippingFee;

  function applyPromoCode() {
    const normalized = promoInput.trim().toUpperCase();
    if (!normalized) {
      setAppliedPromo(null);
      setPromoFeedback(null);
      return;
    }
    const found = DEMO_PROMO_CODES.find((rule) => rule.code === normalized);
    if (!found) {
      setAppliedPromo(null);
      setPromoFeedback({
        ok: false,
        message: "Code not found. Try WELCOME10 or FESTIVE25.",
      });
      return;
    }
    if (!found.active) {
      setAppliedPromo(null);
      setPromoFeedback({
        ok: false,
        message: `${found.code} has expired. Try WELCOME10 or FESTIVE25.`,
      });
      return;
    }
    setAppliedPromo(found);
    setPromoFeedback({
      ok: true,
      message: `Applied ${found.code} (${found.label}).`,
    });
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedItems.length) return;

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

    const orderNumber = `MV-${String(Date.now()).slice(-6)}`;
    setCompletedOrder({
      reference: orderNumber,
      customerName: parsed.data.fullName,
      city: parsed.data.city,
      stateName: parsed.data.stateName,
      pinCode: parsed.data.pinCode,
      paymentMethod,
      items: selectedItems,
      subtotal: selectedTotal,
      discount,
      shipping: shippingFee,
      total: grandTotal,
    });
    clearSelectedItems();
  }

  function inputBorderClass(hasError?: string) {
    return hasError
      ? "border-[#a44436] bg-[#fdf7f6]"
      : "border-[#ded3c7] bg-white focus:border-[#39231e]";
  }

  return (
    <main className="min-h-screen bg-[#fbf8f3] text-[#33251f]">
      <SiteHeader />
      <PageIntro
        eyebrow="Majisavesh · Checkout preview"
        title={completedOrder ? "Thank you" : "A few details"}
        copy={
          completedOrder
            ? "Your demo order preview is ready. No payment has been charged."
            : "Complete the form to preview the final step. This demo does not charge you or create a real payment."
        }
      />
      <div className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
        {completedOrder ? (
          <section className="mx-auto max-w-3xl border border-[#e8ded2] bg-white p-7 sm:p-10">
            <div className="text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#e8f4ec] text-[#168252]">
                <Check />
              </span>
              <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a44436]">
                Order reference #{completedOrder.reference}
              </p>
              <h2 className="mt-2 font-serif text-3xl">
                Thank you, {completedOrder.customerName}
              </h2>
              <p className="mt-2 text-sm text-[#77675d]">
                Preview order prepared for {completedOrder.city},{" "}
                {completedOrder.stateName} – {completedOrder.pinCode} (
                {completedOrder.paymentMethod}). Checkout payments and backend
                order storage are in demo mode.
              </p>
            </div>

            <div className="mt-8 border-t border-[#eee8e0] pt-6">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b796b]">
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
                      <span className="text-xs text-[#77675d]">
                        (Qty {quantity})
                      </span>
                    </span>
                    <span>{formatPrice(product.price * quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2 border-t border-[#eee8e0] pt-4 text-xs text-[#77675d]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(completedOrder.subtotal)}</span>
                </div>
                {completedOrder.discount > 0 && (
                  <div className="flex justify-between text-[#168252]">
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
                <div className="flex justify-between border-t border-[#eee8e0] pt-2 text-sm font-semibold text-[#33251f]">
                  <span>Total</span>
                  <span>{formatPrice(completedOrder.total)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/collection"
                className="inline-block bg-[#39231e] px-6 py-3 text-[10px] uppercase tracking-[0.18em] text-white transition hover:bg-[#52342c]"
              >
                Continue shopping
              </Link>
            </div>
          </section>
        ) : selectedItems.length ? (
          <form
            noValidate
            onSubmit={submitOrder}
            className="grid gap-8 lg:grid-cols-[1fr_360px]"
          >
            <section className="border border-[#e8ded2] bg-white p-5 sm:p-7">
              <div className="flex items-center gap-2 border-b border-[#eee8e0] pb-4">
                <span className="flex size-7 items-center justify-center rounded-full bg-[#39231e] text-xs text-white">
                  1
                </span>
                <h2 className="font-serif text-2xl">Delivery information</h2>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-medium text-[#4b3c33]">
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
                    className={`mt-2 w-full border px-3 py-3 text-sm font-normal text-[#33251f] outline-none ${inputBorderClass(fieldErrors.fullName)}`}
                    placeholder="Your full name"
                  />
                  {fieldErrors.fullName && (
                    <span
                      role="alert"
                      className="mt-1.5 block text-[11px] font-normal text-[#a44436]"
                    >
                      {fieldErrors.fullName}
                    </span>
                  )}
                </label>

                <label className="text-xs font-medium text-[#4b3c33]">
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
                    className={`mt-2 w-full border px-3 py-3 text-sm font-normal text-[#33251f] outline-none ${inputBorderClass(fieldErrors.email)}`}
                    placeholder="you@example.com"
                  />
                  {fieldErrors.email && (
                    <span
                      role="alert"
                      className="mt-1.5 block text-[11px] font-normal text-[#a44436]"
                    >
                      {fieldErrors.email}
                    </span>
                  )}
                </label>

                <label className="text-xs font-medium text-[#4b3c33] sm:col-span-2">
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
                    className={`mt-2 w-full border px-3 py-3 text-sm font-normal text-[#33251f] outline-none ${inputBorderClass(fieldErrors.address)}`}
                    placeholder="House / flat number, building and street"
                  />
                  {fieldErrors.address && (
                    <span
                      role="alert"
                      className="mt-1.5 block text-[11px] font-normal text-[#a44436]"
                    >
                      {fieldErrors.address}
                    </span>
                  )}
                </label>

                <label className="text-xs font-medium text-[#4b3c33]">
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
                      className={`w-full border px-3 py-3 pr-9 text-sm font-normal text-[#33251f] outline-none ${inputBorderClass(fieldErrors.pinCode || pinLookupError)}`}
                      placeholder="6-digit PIN (e.g. 302001)"
                    />
                    {lookingUpPin && (
                      <Loader2
                        size={15}
                        className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#8d3428]"
                      />
                    )}
                  </div>
                  {pinLookupError || fieldErrors.pinCode ? (
                    <span
                      role="alert"
                      className="mt-1.5 block text-[11px] font-normal text-[#a44436]"
                    >
                      {pinLookupError || fieldErrors.pinCode}
                    </span>
                  ) : pinVerifiedInfo ? (
                    <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-normal text-[#168252]">
                      <MapPinCheck size={12} /> {pinVerifiedInfo}
                    </span>
                  ) : (
                    <span className="mt-1.5 block text-[11px] font-normal text-[#8b796b]">
                      Enter 6-digit PIN to auto-fill State &amp; City
                    </span>
                  )}
                </label>

                <label className="text-xs font-medium text-[#4b3c33]">
                  State *
                  <select
                    required
                    autoComplete="address-level1"
                    value={stateCode}
                    aria-invalid={Boolean(fieldErrors.stateCode)}
                    onChange={(event) => handleStateChange(event.target.value)}
                    onBlur={() => validateSingleField("stateCode")}
                    className={`mt-2 w-full border px-3 py-3 text-sm font-normal text-[#33251f] outline-none ${inputBorderClass(fieldErrors.stateCode)}`}
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
                      className="mt-1.5 block text-[11px] font-normal text-[#a44436]"
                    >
                      {fieldErrors.stateCode}
                    </span>
                  )}
                </label>

                <label className="text-xs font-medium text-[#4b3c33]">
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
                    className={`mt-2 w-full border px-3 py-3 text-sm font-normal text-[#33251f] outline-none disabled:cursor-not-allowed disabled:bg-[#faf7f3] disabled:text-[#8b796b] ${inputBorderClass(fieldErrors.city)}`}
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
                      className="mt-1.5 block text-[11px] font-normal text-[#a44436]"
                    >
                      {fieldErrors.city}
                    </span>
                  )}
                </label>

                <label className="text-xs font-medium text-[#4b3c33]">
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
                    className={`mt-2 w-full border px-3 py-3 text-sm font-normal text-[#33251f] outline-none ${inputBorderClass(fieldErrors.phone)}`}
                    placeholder="+91 98765 43210"
                  />
                  {fieldErrors.phone ? (
                    <span
                      role="alert"
                      className="mt-1.5 block text-[11px] font-normal text-[#a44436]"
                    >
                      {fieldErrors.phone}
                    </span>
                  ) : (
                    <span className="mt-1.5 block text-[11px] font-normal text-[#8b796b]">
                      10-digit Indian mobile number for courier updates
                    </span>
                  )}
                </label>
              </div>

              <div className="mt-8 flex items-center gap-2 border-b border-[#eee8e0] pb-4">
                <span className="flex size-7 items-center justify-center rounded-full bg-[#39231e] text-xs text-white">
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
                          ? "border-[#39231e] bg-[#fbf8f3] font-medium"
                          : "border-[#ded3c7]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={option}
                        checked={paymentMethod === option}
                        onChange={() => setPaymentMethod(option)}
                        className="accent-[#8d3428]"
                      />
                      {option}
                    </label>
                  ),
                )}
              </div>

              <div className="mt-6 flex gap-3 border-t border-[#eee8e0] pt-5 text-xs leading-5 text-[#77675d]">
                <LockKeyhole size={15} className="mt-0.5 shrink-0" />
                <p>
                  Checkout is in demo mode. No payment details are requested or
                  processed.
                </p>
              </div>
            </section>

            <aside className="h-fit border border-[#e8ded2] bg-white p-5">
              <h2 className="font-serif text-xl">Your order</h2>
              <div className="mt-4 flex flex-col gap-4">
                {selectedItems.map(({ lineKey, product, quantity }) => (
                  <div key={lineKey} className="flex gap-3">
                    <div className="relative size-14 shrink-0 overflow-hidden bg-[#eee4d8]">
                      <BlogCoverImage
                        src={product.image}
                        alt={product.name}
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-sm">{product.name}</p>
                      <p className="text-[10px] text-[#77675d]">
                        {product.fabric} · Qty {quantity}
                      </p>
                    </div>
                    <span className="text-xs">
                      {formatPrice(product.price * quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t border-[#eee8e0] pt-4">
                <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#77675d]">
                  <Tag size={12} /> Promo code
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    value={promoInput}
                    onChange={(event) => setPromoInput(event.target.value)}
                    placeholder="WELCOME10"
                    className="min-w-0 flex-1 border border-[#ded3c7] px-3 py-2 text-xs uppercase"
                  />
                  <button
                    type="button"
                    onClick={applyPromoCode}
                    className="border border-[#39231e] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#39231e] hover:bg-[#f3ece2]"
                  >
                    Apply
                  </button>
                </div>
                {promoFeedback && (
                  <p
                    className={`mt-2 text-[11px] ${
                      promoFeedback.ok ? "text-[#168252]" : "text-[#a44436]"
                    }`}
                  >
                    {promoFeedback.message}
                  </p>
                )}
              </div>

              <div className="mt-5 flex justify-between border-t border-[#eee8e0] pt-4 text-sm">
                <span>Subtotal</span>
                <strong>{formatPrice(selectedTotal)}</strong>
              </div>
              {discount > 0 && (
                <div className="mt-2 flex justify-between text-xs text-[#168252]">
                  <span>Discount ({appliedPromo?.code})</span>
                  <span>−{formatPrice(discount)}</span>
                </div>
              )}
              <p className="mt-2 flex justify-between text-xs text-[#77675d]">
                <span>Shipping</span>
                <span>
                  {shippingFee === 0 ? "Free" : formatPrice(shippingFee)}
                </span>
              </p>
              <div className="mt-4 flex justify-between border-t border-[#eee8e0] pt-4">
                <span className="font-semibold">Total</span>
                <strong>{formatPrice(grandTotal)}</strong>
              </div>
              <button
                type="submit"
                disabled={lookingUpPin}
                className="mt-5 w-full bg-[#39231e] py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#52342c] disabled:opacity-50"
              >
                {lookingUpPin ? "Verifying PIN..." : "Review demo order"}
              </button>
              <p className="mt-3 text-center text-[9px] leading-4 text-[#8b796b]">
                No real order or payment will be created.
              </p>
            </aside>
          </form>
        ) : (
          <div className="mx-auto max-w-3xl border border-dashed border-[#d8cabc] bg-white p-8 text-center">
            <h2 className="font-serif text-2xl">Your cart is empty</h2>
            <p className="mt-2 text-sm text-[#77675d]">
              Add an item before continuing to checkout.
            </p>
            <Link
              href="/collection"
              className="mt-5 inline-block bg-[#39231e] px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-white"
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
