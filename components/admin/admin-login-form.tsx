"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { setAdminToken, setAdminUser } from "@/src/lib/api/auth-token";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@kiddiequick.in");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setNotice("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success || !payload.data?.token) {
        const errorMsg =
          payload?.error?.message ??
          payload?.error?.fieldErrors?.email?.[0] ??
          payload?.error?.fieldErrors?.password?.[0] ??
          "Invalid email or password credentials.";
        setErrorMessage(errorMsg);
        return;
      }

      // Verify user is an admin
      if (payload.data.user?.role !== "admin") {
        setErrorMessage(
          "Access denied: You do not have administrator privileges.",
        );
        return;
      }

      setAdminToken(payload.data.token);
      setAdminUser(payload.data.user);
      router.push("/admin");
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Unable to connect to authentication server. Please verify backend is running.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-background text-foreground lg:grid-cols-[1.05fr_.95fr]">
      <section className="hidden min-h-screen flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <Link
          href="/"
          className="inline-flex items-center gap-3 rounded-md bg-background px-4 py-2.5 shadow-sm"
          aria-label="KiddieQuick Admin home"
        >
          <Image
            src="/logo.png"
            alt="KiddieQuick Admin"
            width={619}
            height={624}
            className="size-10 object-contain"
          />
          <span className="font-serif text-xl font-bold tracking-tight text-primary">
            KiddieQuick
          </span>
        </Link>
        <div className="max-w-lg">
          <p className="text-[10px] uppercase tracking-[0.32em] text-amber-200/90">
            Private workspace
          </p>
          <h1 className="mt-5 font-serif text-6xl leading-[1.02]">
            Steward the <em className="text-amber-200/90">brand.</em>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-amber-200/90">
            A considered space to manage the collections, orders and customers
            behind KiddieQuick.
          </p>
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-amber-200/90">
          Authorized team only · KiddieQuick
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground transition hover:text-accent"
            >
              <ArrowLeft size={14} /> Return to storefront
            </Link>
            <Link
              href="/"
              className="inline-block lg:hidden"
              aria-label="KiddieQuick home"
            >
              <Image
                src="/logo.png"
                alt="KiddieQuick"
                width={619}
                height={624}
                sizes="96px"
                className="h-10 w-auto object-contain"
              />
            </Link>
          </div>
          <div className="mt-10 flex size-12 items-center justify-center rounded-full bg-secondary text-accent lg:mt-14">
            <LockKeyhole size={20} />
          </div>
          <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
            Store administration
          </p>
          <h2 className="mt-2 font-serif text-4xl text-primary">
            Team sign in
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Enter your administrator credentials to securely manage the atelier.
          </p>

          {errorMessage && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-3 border border-accent/30 bg-accent/10 p-3 text-xs leading-5 text-accent"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <div>{errorMessage}</div>
            </div>
          )}

          <form onSubmit={submitLogin} className="mt-6 flex flex-col gap-5">
            <label
              htmlFor="admin-email"
              className="flex flex-col gap-2 text-xs font-medium text-foreground/90"
            >
              Work email
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kiddiequick.in"
                className="h-12 border border-border bg-white px-4 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
              />
            </label>

            <label
              htmlFor="admin-password"
              className="flex flex-col gap-2 text-xs font-medium text-foreground/90"
            >
              Password
              <span className="flex h-12 border border-border bg-white focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="px-4 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </label>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  setNotice(
                    "Contact administrator to reset credentials or use seeded admin: admin@kiddiequick.in / admin123",
                  )
                }
                className="text-xs text-accent underline underline-offset-4"
              >
                Need help signing in?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 items-center justify-center gap-2 bg-accent text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-accent/90 disabled:opacity-60"
            >
              {loading ? (
                <>
                  Verifying credentials{" "}
                  <Loader2 size={15} className="animate-spin" />
                </>
              ) : (
                <>
                  Sign in securely <ShieldCheck size={15} />
                </>
              )}
            </button>
          </form>

          {notice && (
            <p
              role="status"
              className="mt-5 border border-border bg-white p-3 text-xs leading-5 text-muted-foreground"
            >
              {notice}
            </p>
          )}

          <div className="mt-8 border-t border-border pt-5 text-center">
            <p className="text-[11px] text-muted-foreground">
              Default admin access:{" "}
              <span className="font-semibold text-primary">
                admin@kiddiequick.in
              </span>{" "}
              / <span className="font-semibold text-primary">admin123</span>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
