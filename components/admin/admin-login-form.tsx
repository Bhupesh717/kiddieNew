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
} from "lucide-react";

export function AdminLoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");

  function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/admin");
  }

  return (
    <main className="grid min-h-screen bg-[#f7f4ef] text-[#2f2924] lg:grid-cols-[1.05fr_.95fr]">
      <section className="hidden min-h-screen flex-col justify-between bg-[#39231e] p-12 text-[#f8ede0] lg:flex">
        <Link
          href="/"
          className="inline-block w-fit rounded-md bg-[#fbf8f3] px-4 py-2.5 shadow-sm"
          aria-label="Majisavesh home"
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
        <div className="max-w-lg">
          <p className="text-[10px] uppercase tracking-[0.32em] text-[#d6af7a]">
            Private workspace
          </p>
          <h1 className="mt-5 font-serif text-6xl leading-[1.02]">
            Steward the <em className="text-[#d6af7a]">atelier.</em>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-[#d9c7b5]">
            A considered space to manage the collections, orders and stories
            behind Majisavesh.
          </p>
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#c1a98f]">
          Authorized team members only
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs text-[#776f68] transition hover:text-[#a44436]"
            >
              <ArrowLeft size={14} /> Return to storefront
            </Link>
            <Link href="/" className="inline-block lg:hidden" aria-label="Majisavesh home">
              <Image
                src="/logo.png"
                alt="Majisavesh"
                width={1563}
                height={680}
                sizes="96px"
                className="h-10 w-auto object-contain"
              />
            </Link>
          </div>
          <div className="mt-10 flex size-12 items-center justify-center rounded-full bg-[#eee7df] text-[#8d3428] lg:mt-14">
            <LockKeyhole size={20} />
          </div>
          <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a44436]">
            Atelier administration
          </p>
          <h2 className="mt-2 font-serif text-4xl text-[#39231e]">
            Team sign in
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#776f68]">
            Use your administrator email and password to preview the workspace.
          </p>

          <form onSubmit={submitLogin} className="mt-8 flex flex-col gap-5">
            <label
              htmlFor="admin-email"
              className="flex flex-col gap-2 text-xs font-medium text-[#4b3c33]"
            >
              Work email
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="username"
                defaultValue="aditi@majisavesh.com"
                placeholder="name@majisavesh.com"
                className="h-12 border border-[#dfd8cf] bg-white px-4 text-sm outline-none transition focus:border-[#a44436] focus:ring-2 focus:ring-[#a44436]/15"
              />
            </label>

            <label
              htmlFor="admin-password"
              className="flex flex-col gap-2 text-xs font-medium text-[#4b3c33]"
            >
              Password
              <span className="flex h-12 border border-[#dfd8cf] bg-white focus-within:border-[#a44436] focus-within:ring-2 focus-within:ring-[#a44436]/15">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  defaultValue="majisavesh-demo"
                  placeholder="Enter your password"
                  className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="px-4 text-[#776f68]"
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
                    "Password recovery will be available when backend admin authentication is connected.",
                  )
                }
                className="text-xs text-[#8d3428] underline underline-offset-4"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="flex h-12 items-center justify-center gap-2 bg-[#8d3428] text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#70281f]"
            >
              Sign in securely <ShieldCheck size={15} />
            </button>
          </form>

          <Link
            href="/admin"
            className="mt-4 flex items-center justify-center gap-2 border border-[#dfd8cf] bg-white py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#39231e] transition hover:border-[#8d3428]"
          >
            Enter demo dashboard <ArrowRight size={13} />
          </Link>

          {notice && (
            <p
              role="status"
              className="mt-5 border border-[#e8ded2] bg-white p-3 text-xs leading-5 text-[#77675d]"
            >
              {notice}
            </p>
          )}
          <p className="mt-10 border-t border-[#dfd8cf] pt-5 text-center text-[10px] leading-5 text-[#9a8d81]">
            Demo interface only. No credentials are validated against a backend
            server.
          </p>
        </div>
      </section>
    </main>
  );
}
