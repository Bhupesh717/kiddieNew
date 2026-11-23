"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Check,
  Copy,
  Gift,
  Loader2,
  Mail,
  Sparkles,
  X,
} from "lucide-react";

const STORAGE_KEY_SUBSCRIBED = "kiddiequick_newsletter_subscribed";
const STORAGE_KEY_DISMISSED = "kiddiequick_newsletter_dismissed_at";
const DISMISS_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days cooldown if closed without subscribing
const COUPON_CODE = "WELCOME10";

export function NewsletterModal() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Never show modal on checkout, admin, or auth pages
    if (
      !pathname ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/checkout") ||
      pathname.startsWith("/login")
    ) {
      return;
    }

    try {
      // Check if already subscribed
      const subscribed = localStorage.getItem(STORAGE_KEY_SUBSCRIBED);
      if (subscribed === "true") {
        return;
      }

      // Check if dismissed recently
      const dismissedAt = localStorage.getItem(STORAGE_KEY_DISMISSED);
      if (dismissedAt) {
        const timeDiff = Date.now() - parseInt(dismissedAt, 10);
        if (!isNaN(timeDiff) && timeDiff < DISMISS_COOLDOWN_MS) {
          return;
        }
      }
    } catch {
      // LocalStorage access failsafe
    }

    // Modern delay: 2.5 seconds after page load for pleasant non-intrusive timing
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Handle ESC key to dismiss
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        handleDismiss();
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  function handleDismiss() {
    setIsOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY_DISMISSED, Date.now().toString());
    } catch {
      // Ignore storage errors
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          source: "welcome_modal",
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        setError(
          payload?.error?.message ||
            "Unable to subscribe right now. Please try again.",
        );
        return;
      }

      setIsSuccess(true);
      try {
        localStorage.setItem(STORAGE_KEY_SUBSCRIBED, "true");
      } catch {
        // Ignore storage errors
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopyCoupon() {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(COUPON_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Blurred Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-amber-950/15 bg-background shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close subscription offer"
          className="absolute right-3.5 top-3.5 z-20 flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground/70 backdrop-blur-md transition hover:bg-background hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <X size={17} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-[1.05fr_1.35fr]">
          {/* Left Visual Column (Shown on md+ screens, compact banner on mobile) */}
          <div className="relative hidden min-h-[420px] md:flex flex-col justify-between overflow-hidden bg-primary p-6 text-white">
            <Image
              src="/home/spotlight-kids.jpg"
              alt="KiddieQuick Collection"
              fill
              sizes="(max-width: 768px) 100vw, 360px"
              className="object-cover object-top opacity-65"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-amber-200 backdrop-blur-md">
                <Sparkles size={11} className="text-amber-300" />
                Jaipur Atelier
              </span>
            </div>

            <div className="relative z-10 space-y-2">
              <p className="font-serif text-2xl font-bold leading-tight text-white drop-shadow-sm">
                Everyday Comfort &amp; Festive Elegance
              </p>
              <p className="text-[11px] leading-relaxed text-amber-100/80">
                Skin-friendly pure cottons, breathable linens and festive
                silhouettes for kids, men &amp; women.
              </p>
            </div>
          </div>

          {/* Right Content / Form Column */}
          <div className="flex flex-col justify-between p-6 sm:p-8">
            {!isSuccess ? (
              <div className="space-y-4">
                {/* Pill Eyebrow */}
                <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                  <Gift size={12} />
                  <span>Welcome Privilege</span>
                </div>

                {/* Heading */}
                <div>
                  <h2
                    id="newsletter-modal-title"
                    className="font-serif text-2xl font-bold tracking-tight text-primary sm:text-3xl"
                  >
                    Get 10% Off Your First Order
                  </h2>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Join over 12,000+ happy families. Subscribe now to unlock
                    your instant welcome coupon code and secret sale drops.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      aria-label="Email address for discount"
                      className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground/70 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
                    />
                  </div>

                  {error && (
                    <p
                      role="alert"
                      className="text-[11px] font-medium text-red-600 animate-in fade-in"
                    >
                      ✕ {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-md transition hover:bg-accent/90 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span>Activating Offer...</span>
                        <Loader2 size={15} className="animate-spin" />
                      </>
                    ) : (
                      <>
                        <span>Unlock My 10% Off</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>

                {/* Trust Footer */}
                <div className="pt-2 text-center space-y-2">
                  <p className="text-[10px] text-muted-foreground">
                    🔒 No spam ever. Unsubscribe with one click anytime.
                  </p>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="text-[10px] text-muted-foreground/80 hover:text-foreground underline underline-offset-2 transition"
                  >
                    No thanks, I will pay full price
                  </button>
                </div>
              </div>
            ) : (
              /* Success / Coupon Voucher Reveal State */
              <div className="space-y-5 text-center py-2 animate-in fade-in duration-300">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check size={24} strokeWidth={2.5} />
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">
                    Welcome to the KiddieQuick Family!
                  </span>
                  <h3 className="mt-1 font-serif text-2xl font-bold text-primary sm:text-3xl">
                    Here is Your 10% Discount
                  </h3>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Use this exclusive welcome voucher during checkout on your
                    first order:
                  </p>
                </div>

                {/* Coupon Voucher Box */}
                <div className="rounded-xl border-2 border-dashed border-accent/40 bg-accent/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-left">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Promo Code
                      </p>
                      <p className="font-mono text-xl font-bold tracking-[0.2em] text-accent">
                        {COUPON_CODE}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyCoupon}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition shadow-sm ${
                        copied
                          ? "bg-emerald-600 text-white"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check size={14} />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/collection"
                    onClick={() => setIsOpen(false)}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent text-xs font-bold uppercase tracking-[0.16em] text-white shadow-md transition hover:bg-accent/90"
                  >
                    <span>Start Shopping With 10% Off</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
