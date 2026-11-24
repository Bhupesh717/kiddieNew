"use client";

import { useState, useEffect, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2, Mail, ShieldCheck } from "lucide-react";
import { setCustomerToken, setCustomerUser } from "@/src/lib/api/customer-auth";

export function StoreLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  async function sendCode(event?: React.FormEvent<HTMLFormElement>) {
    if (event) event.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ action: "send", email }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        setMessage(
          payload?.error?.message ?? "Unable to send verification code.",
        );
        return;
      }
      setSent(true);
      setResendCooldown(60);
      setMessage(
        payload?.data?.message || "Verification code sent to your email.",
      );
    } catch {
      setMessage("Could not connect to authentication server.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ action: "verify", email, code }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        setMessage(
          payload?.error?.message ?? "Invalid or expired verification code.",
        );
        return;
      }
      setVerified(true);
      if (payload.data?.token) {
        setCustomerToken(payload.data.token);
      }
      const customerData = payload.data?.user || payload.data?.customer;
      if (customerData) {
        setCustomerUser(customerData);
      }
      setMessage("Account verified and signed in successfully!");

      const targetUrl =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("redirect") ||
            "/collection"
          : "/collection";

      setTimeout(() => {
        router.push(targetUrl);
      }, 600);
    } catch {
      setMessage("Could not verify code with server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-background text-foreground lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <Link
          href="/"
          className="inline-flex items-center gap-3 rounded-md bg-background px-4 py-2.5 shadow-sm"
          aria-label="KiddieQuick home"
        >
          <Image
            src="/logo.png"
            alt="KiddieQuick Logo"
            width={619}
            height={624}
            className="size-10 object-contain"
          />
          <span className="font-serif text-xl font-bold tracking-tight text-primary">
            KiddieQuick{" "}
            <span className="text-xs font-sans text-accent">LLP</span>
          </span>
        </Link>
        <div className="relative z-10 max-w-lg">
          <p className="text-[10px] uppercase tracking-[0.32em] text-amber-200/90">
            Everyday Comfort & Festive Elegance
          </p>
          <h1 className="mt-5 font-serif text-6xl leading-[1.02]">
            Your world of <em className="text-amber-200/90">style & joy.</em>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-amber-200/90">
            Sign in to revisit your favourites, track your orders and discover
            our newest collections for kids, boys, girls, men & women.
          </p>
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-amber-200/90">
          KiddieQuick LLP · Jaipur, India
        </p>
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -right-16 size-96 rounded-full border border-amber-300/20"
        />
      </section>
      <section className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground transition hover:text-accent"
            >
              <ArrowLeft size={14} /> Back to the store
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 lg:hidden"
              aria-label="KiddieQuick home"
            >
              <Image
                src="/logo.png"
                alt="KiddieQuick Logo"
                width={619}
                height={624}
                className="size-8 object-contain"
              />
              <span className="font-serif text-lg font-bold text-primary">
                KiddieQuick
              </span>
            </Link>
          </div>
          <div className="mt-10 lg:mt-14">
            <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-accent">
              <Mail size={20} />
            </div>
            <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
              Customer account
            </p>
            <h2 className="mt-2 font-serif text-4xl text-primary">
              Welcome back
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Sign in with a one-time code sent to your email.
            </p>
          </div>
          {!sent ? (
            <form onSubmit={sendCode} className="mt-8 flex flex-col gap-5">
              <label
                className="flex flex-col gap-2 text-xs font-medium text-foreground/90"
                htmlFor="store-email"
              >
                Email address
                <input
                  id="store-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="h-12 border border-border bg-white px-4 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 items-center justify-center gap-2 bg-accent text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-accent/90 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    Sending code <Loader2 size={14} className="animate-spin" />
                  </>
                ) : (
                  <>
                    Send sign-in code <Mail size={14} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="mt-8 flex flex-col gap-5">
              <div className="border border-border bg-white px-4 py-3 text-xs text-muted-foreground">
                A sign-in code was sent to{" "}
                <strong className="text-primary">{email}</strong>
              </div>
              <label
                className="flex flex-col gap-2 text-xs font-medium text-foreground/90"
                htmlFor="store-code"
              >
                Six-digit code
                <input
                  id="store-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(event) =>
                    setCode(event.target.value.replace(/\D/g, ""))
                  }
                  placeholder="000000"
                  className="h-12 border border-border bg-white px-4 text-center font-mono text-lg tracking-[0.5em] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
                />
              </label>
              <button
                type="submit"
                disabled={loading || verified}
                className="flex h-12 items-center justify-center gap-2 bg-accent text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-accent/90 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    Verifying <Loader2 size={15} className="animate-spin" />
                  </>
                ) : verified ? (
                  <>
                    Redirecting...{" "}
                    <Loader2 size={15} className="animate-spin" />
                  </>
                ) : (
                  <>
                    Verify code <ShieldCheck size={15} />
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={loading || verified}
                onClick={() => {
                  setSent(false);
                  setCode("");
                  setMessage("");
                  setResendCooldown(0);
                }}
                className="text-xs text-muted-foreground underline underline-offset-4"
              >
                Use another email
              </button>
            </form>
          )}
          {sent && !verified && (
            <div className="mt-5 rounded-lg border border-orange-200/70 bg-orange-50/60 p-4 text-xs leading-5 text-slate-700">
              <div className="flex items-start gap-2.5">
                <Mail size={16} className="mt-0.5 shrink-0 text-orange-600" />
                <div>
                  <p className="font-semibold text-slate-900">
                    Verification code sent
                  </p>
                  <p className="mt-0.5 text-slate-600">
                    We sent a 6-digit code to{" "}
                    <span className="font-semibold text-slate-900">{email}</span>.
                    Please check your inbox or spam folder.
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={loading || resendCooldown > 0}
                      onClick={() => sendCode()}
                      className="font-medium text-orange-700 underline underline-offset-4 hover:text-orange-900 disabled:text-slate-400 disabled:no-underline"
                    >
                      {resendCooldown > 0
                        ? `Resend code in ${resendCooldown}s`
                        : "Resend code"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {message && (
            <div
              role="status"
              className={`mt-4 rounded-md p-3 text-xs ${
                verified
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border border-red-200 bg-red-50 text-accent"
              }`}
            >
              <div className="flex items-center gap-2 font-medium">
                {verified ? (
                  <Check size={15} className="text-emerald-600" />
                ) : null}
                <span>{message}</span>
              </div>
              {verified && (
                <p className="mt-1 text-[11px] text-emerald-700">
                  Redirecting to collection page in a moment... Or{" "}
                  <Link
                    href="/collection"
                    className="font-semibold underline underline-offset-2 hover:text-emerald-900"
                  >
                    click here to open now
                  </Link>
                  .
                </p>
              )}
            </div>
          )}
          <p className="mt-10 border-t border-border pt-5 text-center text-[10px] leading-5 text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2">
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>
          <p className="mt-8 text-center text-[10px] uppercase tracking-[0.17em] text-muted-foreground">
            Need help?{" "}
            <Link
              href="/contact"
              className="text-accent underline underline-offset-2"
            >
              Contact customer care
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
