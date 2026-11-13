"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Mail, ShieldCheck } from "lucide-react";

const DEMO_CODE = "246810";

export function StoreLoginForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState("");

  function sendCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSent(true);
  }

  function verifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code === DEMO_CODE) {
      setVerified(true);
      setMessage("Demo code verified. No account session was created.");
    } else {
      setMessage("That code does not match. Try the demo code shown below.");
    }
  }

  return (
    <main className="grid min-h-screen bg-[#fbf8f3] text-[#33251f] lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[#39231e] p-12 text-[#f8ede0] lg:flex">
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
        <div className="relative z-10 max-w-lg">
          <p className="text-[10px] uppercase tracking-[0.32em] text-[#d6af7a]">
            A little closer to the atelier
          </p>
          <h1 className="mt-5 font-serif text-6xl leading-[1.02]">
            Your world of <em className="text-[#d6af7a]">heirlooms.</em>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-[#d9c7b5]">
            Sign in to revisit your favourites, follow your orders and discover
            new craft stories.
          </p>
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#c1a98f]">
          The royal attire of Rajasthan · Jaipur, India
        </p>
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -right-16 size-96 rounded-full border border-[#d6af7a]/20"
        />
      </section>
      <section className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs text-[#77675d] transition hover:text-[#a44436]"
            >
              <ArrowLeft size={14} /> Back to the store
            </Link>
            <Link
              href="/"
              className="inline-block lg:hidden"
              aria-label="Majisavesh home"
            >
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
          <div className="mt-10 lg:mt-14">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#f3ece2] text-[#a44436]">
              <Mail size={20} />
            </div>
            <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a44436]">
              Customer account
            </p>
            <h2 className="mt-2 font-serif text-4xl text-[#39231e]">
              Welcome back
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#77675d]">
              Sign in with a one-time code sent to your email.
            </p>
          </div>
          {!sent ? (
            <form onSubmit={sendCode} className="mt-8 flex flex-col gap-5">
              <label
                className="flex flex-col gap-2 text-xs font-medium text-[#4b3c33]"
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
                  className="h-12 border border-[#e8ded2] bg-white px-4 text-sm outline-none transition focus:border-[#a44436] focus:ring-2 focus:ring-[#a44436]/15"
                />
              </label>
              <button className="flex h-12 items-center justify-center gap-2 bg-[#a44436] text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#7f2d24]">
                Send sign-in code <Mail size={14} />
              </button>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="mt-8 flex flex-col gap-5">
              <div className="border border-[#e8ded2] bg-white px-4 py-3 text-xs text-[#77675d]">
                A sign-in code was sent to{" "}
                <strong className="text-[#39231e]">{email}</strong>
              </div>
              <label
                className="flex flex-col gap-2 text-xs font-medium text-[#4b3c33]"
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
                  className="h-12 border border-[#e8ded2] bg-white px-4 text-center font-mono text-lg tracking-[0.5em] outline-none transition focus:border-[#a44436] focus:ring-2 focus:ring-[#a44436]/15"
                />
              </label>
              <button className="flex h-12 items-center justify-center gap-2 bg-[#a44436] text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#7f2d24]">
                Verify code <ShieldCheck size={15} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setCode("");
                  setMessage("");
                }}
                className="text-xs text-[#77675d] underline underline-offset-4"
              >
                Use another email
              </button>
            </form>
          )}
          {sent && (
            <div className="mt-5 border border-dashed border-[#cdbca9] bg-[#f7f1e8] p-4 text-xs leading-5 text-[#77675d]">
              <p className="font-semibold text-[#39231e]">
                Demo OTP:{" "}
                <span className="font-mono tracking-[0.2em]">{DEMO_CODE}</span>
              </p>
              <p className="mt-1">
                UI preview only—no email is sent and no real sign-in happens.
              </p>
            </div>
          )}
          {message && (
            <p
              role="status"
              className={`mt-4 flex items-center gap-2 text-xs ${verified ? "text-[#52704c]" : "text-[#a44436]"}`}
            >
              {verified && <Check size={14} />}
              {message}
            </p>
          )}
          <p className="mt-10 border-t border-[#e8ded2] pt-5 text-center text-[10px] leading-5 text-[#a48668]">
            By continuing, you agree to our{" "}
            <Link href="/shipping" className="underline underline-offset-2">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/shipping" className="underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>
          <p className="mt-8 text-center text-[10px] uppercase tracking-[0.17em] text-[#a48668]">
            Need help?{" "}
            <Link
              href="/contact"
              className="text-[#a44436] underline underline-offset-2"
            >
              Contact customer care
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
