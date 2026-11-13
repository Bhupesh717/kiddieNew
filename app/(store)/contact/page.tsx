"use client";

import { useState, type FormEvent } from "react";
import { Check, Mail, MapPin, Phone } from "lucide-react";
import { PageIntro, SiteFooter, SiteHeader } from "@/components/site-shell";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("Styling & fit");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  function resetForm() {
    setName("");
    setEmail("");
    setTopic("Styling & fit");
    setMessage("");
    setSent(false);
  }

  return (
    <main className="min-h-screen bg-[#fbf8f3] text-[#33251f]">
      <SiteHeader />
      <PageIntro
        eyebrow="We would love to hear from you"
        title="Contact the atelier"
        copy="Questions about sizing, styling or a special order? Our team is here to help."
      />
      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-12 pb-20 md:grid-cols-[.8fr_1.2fr] lg:px-8">
        <div className="flex flex-col gap-5 text-sm text-[#77675d]">
          <p className="flex items-center gap-3">
            <MapPin size={17} className="text-[#a44436]" /> C-Scheme, Jaipur,
            Rajasthan
          </p>
          <p className="flex items-center gap-3">
            <Phone size={17} className="text-[#a44436]" /> +91 141 400 2424
          </p>
          <p className="flex items-center gap-3">
            <Mail size={17} className="text-[#a44436]" /> hello@majisavesh.com
          </p>
          <div className="mt-6 border-t border-[#e8ded2] pt-6 leading-7">
            Monday–Saturday
            <br />
            10:00 AM – 6:00 PM IST
          </div>
        </div>

        {sent ? (
          <div className="flex flex-col items-start justify-center border border-[#e8ded2] bg-[#f3ece2] p-8">
            <span className="flex size-10 items-center justify-center rounded-full bg-[#e8f4ec] text-[#168252]">
              <Check size={18} />
            </span>
            <h2 className="mt-4 font-serif text-3xl text-[#39231e]">
              Message received
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#77675d]">
              Thank you, {name || "friend"}. Your inquiry about{" "}
              <strong>{topic}</strong> has been recorded in this preview (no
              email is dispatched in demo mode).
            </p>
            <button
              type="button"
              onClick={resetForm}
              className="mt-6 border border-[#39231e] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#39231e]"
            >
              Send another inquiry
            </button>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="flex flex-col gap-5 border border-[#e8ded2] bg-[#f3ece2] p-6 md:p-8"
          >
            <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5c4d44]">
              Your name
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your full name"
                className="mt-2 w-full border-b border-[#bca999] bg-transparent px-1 py-3 text-base font-normal normal-case tracking-normal text-[#33251f] placeholder:text-[#9b8b7f] outline-none focus:border-[#a44436]"
              />
            </label>
            <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5c4d44]">
              Email address
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full border-b border-[#bca999] bg-transparent px-1 py-3 text-base font-normal normal-case tracking-normal text-[#33251f] placeholder:text-[#9b8b7f] outline-none focus:border-[#a44436]"
              />
            </label>
            <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5c4d44]">
              Topic
              <select
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                className="mt-2 w-full border-b border-[#bca999] bg-transparent px-1 py-3 text-base font-normal normal-case tracking-normal text-[#33251f] outline-none focus:border-[#a44436]"
              >
                <option>Styling &amp; fit</option>
                <option>Custom poshak order</option>
                <option>Shipping &amp; returns</option>
                <option>Bridal styling appointment</option>
              </select>
            </label>
            <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5c4d44]">
              How can we help?
              <textarea
                required
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Tell us what you are looking for..."
                className="mt-2 w-full border-b border-[#bca999] bg-transparent px-1 py-3 text-base font-normal leading-relaxed normal-case tracking-normal text-[#33251f] placeholder:text-[#9b8b7f] outline-none focus:border-[#a44436]"
              />
            </label>
            <button
              type="submit"
              className="mt-2 bg-[#a44436] px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#7f2d24]"
            >
              Send message
            </button>
          </form>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
