"use client";

import { useState, type FormEvent } from "react";
import { Check, Loader2, Mail, MapPin, Phone } from "lucide-react";
import { PageIntro, SiteFooter, SiteHeader } from "@/components/site-shell";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState("Styling & fit");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          topic,
          subject: topic,
          message: message.trim(),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        setErrorMsg(
          data?.error?.message ||
          "Unable to submit inquiry. Please check the fields and try again.",
        );
        return;
      }

      setSent(true);
    } catch {
      setErrorMsg("Network error. Could not connect to support server.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setName("");
    setEmail("");
    setPhone("");
    setTopic("Styling & fit");
    setMessage("");
    setSent(false);
    setErrorMsg("");
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <PageIntro
        eyebrow="We would love to hear from you"
        title="Contact KiddieQuick"
        copy="Questions about sizing, orders, fabric, or styling? Our team is here to help."
      />
      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-12 pb-20 md:grid-cols-[.8fr_1.2fr] lg:px-8">
        <div className="flex flex-col gap-5 text-sm text-muted-foreground">
          <p className="flex items-center gap-3">
            <MapPin size={17} className="text-accent" /> 10/523, Malviya Nagar Road, Jaipur - 302017, Rajasthan, India
          </p>
          <a
            href="tel:+918824700161"
            className="flex items-center gap-3 hover:text-accent transition"
          >
            <Phone size={17} className="text-accent" /> +91 (882) 470-0161
          </a>
          <a
            href="mailto:hello@kiddiequick.in"
            className="flex items-center gap-3 hover:text-accent transition"
          >
            <Mail size={17} className="text-accent" /> hello@kiddiequick.in
          </a>
          <div className="mt-6 border-t border-border pt-6 leading-7">
            Monday–Saturday
            <br />
            9:30 AM – 7:00 PM IST
          </div>
        </div>

        {sent ? (
          <div className="flex flex-col items-start justify-center border border-border bg-secondary p-8 rounded-xl shadow-sm">
            <span className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Check size={20} />
            </span>
            <h2 className="mt-4 font-serif text-3xl font-bold text-primary">
              Inquiry Received!
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Thank you, <strong className="text-primary">{name || "friend"}</strong>. Your inquiry about{" "}
              <strong>{topic}</strong> has been logged in our support desk. Our team will review and contact you shortly.
            </p>
            <button
              type="button"
              onClick={resetForm}
              className="mt-6 rounded-lg bg-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-accent/90"
            >
              Send Another Inquiry
            </button>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="flex flex-col gap-5 border border-border bg-secondary p-6 md:p-8 rounded-xl shadow-sm"
          >
            {errorMsg && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-accent">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/80">
                Your name *
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                  className="mt-2 w-full border-b border-input bg-transparent px-1 py-3 text-base font-normal normal-case tracking-normal text-foreground placeholder:text-muted-foreground outline-none focus:border-accent"
                />
              </label>

              <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/80">
                Phone number (optional)
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="e.g. 9876543210"
                  className="mt-2 w-full border-b border-input bg-transparent px-1 py-3 text-base font-normal normal-case tracking-normal text-foreground placeholder:text-muted-foreground outline-none focus:border-accent"
                />
              </label>
            </div>

            <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/80">
              Email address *
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full border-b border-input bg-transparent px-1 py-3 text-base font-normal normal-case tracking-normal text-foreground placeholder:text-muted-foreground outline-none focus:border-accent"
              />
            </label>

            <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/80">
              Topic
              <select
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                className="mt-2 w-full border-b border-input bg-transparent px-1 py-3 text-base font-normal normal-case tracking-normal text-foreground outline-none focus:border-accent"
              >
                <option>Styling &amp; fit</option>
                <option>Kids wear &amp; sizing</option>
                <option>Festive suit &amp; kurta order</option>
                <option>Shipping &amp; returns</option>
                <option>Bulk / gifting inquiry</option>
                <option>Other question</option>
              </select>
            </label>

            <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/80">
              How can we help? *
              <textarea
                required
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Tell us what you are looking for..."
                className="mt-2 w-full border-b border-input bg-transparent px-1 py-3 text-base font-normal leading-relaxed normal-case tracking-normal text-foreground placeholder:text-muted-foreground outline-none focus:border-accent"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-12 items-center justify-center gap-2 rounded-lg bg-accent px-6 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-accent/90 disabled:opacity-60"
            >
              {loading ? (
                <>
                  Sending Message <Loader2 size={15} className="animate-spin" />
                </>
              ) : (
                "Send message"
              )}
            </button>
          </form>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
