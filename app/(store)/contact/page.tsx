"use client";

import { useState, type FormEvent } from "react";
import { Check, Loader2, Mail, MapPin, Phone, AlertCircle, CheckCircle2 } from "lucide-react";
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

  // Validation States
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Field Validation Helper
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case "name": {
        const trimmed = value.trim();
        if (!trimmed) return "Please enter your full name.";
        if (trimmed.length < 2) return "Name must be at least 2 characters.";
        if (trimmed.length > 120) return "Name cannot exceed 120 characters.";
        if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
          return "Name should only contain letters and standard characters.";
        }
        return "";
      }
      case "email": {
        const trimmed = value.trim();
        if (!trimmed) return "Please enter your email address.";
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(trimmed)) {
          return "Please enter a valid email address (e.g. name@example.com).";
        }
        return "";
      }
      case "phone": {
        const trimmed = value.trim();
        if (!trimmed) return ""; // Optional field
        // Normalize digits
        const digits = trimmed.replace(/\D/g, "");
        if (digits.length === 10) {
          if (!/^[6-9]\d{9}$/.test(digits)) {
            return "Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.";
          }
          return "";
        }
        if (digits.length === 11 && digits.startsWith("0")) {
          return "";
        }
        if (digits.length === 12 && digits.startsWith("91")) {
          return "";
        }
        return "Please enter a valid 10-digit mobile number (e.g. 9876543210).";
      }
      case "message": {
        const trimmed = value.trim();
        if (!trimmed) return "Please describe how we can help you.";
        if (trimmed.length < 10) {
          return `Please provide a little more detail (at least 10 characters, current: ${trimmed.length}).`;
        }
        if (trimmed.length > 3000) {
          return "Message cannot exceed 3,000 characters.";
        }
        return "";
      }
      default:
        return "";
    }
  };

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (field: string, value: string) => {
    switch (field) {
      case "name":
        setName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "phone":
        setPhone(value);
        break;
      case "message":
        setMessage(value);
        break;
    }

    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg("");

    // Validate all fields
    const nameErr = validateField("name", name);
    const emailErr = validateField("email", email);
    const phoneErr = validateField("phone", phone);
    const messageErr = validateField("message", message);

    const newErrors = {
      name: nameErr,
      email: emailErr,
      phone: phoneErr,
      message: messageErr,
    };

    setTouched({
      name: true,
      email: true,
      phone: true,
      message: true,
    });
    setErrors(newErrors);

    // If any validation fails, abort submission
    if (nameErr || emailErr || phoneErr || messageErr) {
      setErrorMsg("Please correct the errors in the form before submitting.");
      return;
    }

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
          email: email.trim().toLowerCase(),
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
      setErrorMsg("Network error. Could not connect to support server. Please try again.");
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
    setTouched({});
    setErrors({});
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
          <div className="flex flex-col items-start justify-center border border-border bg-secondary p-8 rounded-xl shadow-sm animate-in fade-in duration-300">
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
            noValidate
            className="flex flex-col gap-5 border border-border bg-secondary p-6 md:p-8 rounded-xl shadow-sm"
          >
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle size={15} className="shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Full Name Field */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/80 flex items-center justify-between">
                  <span>Your name *</span>
                  {touched.name && !errors.name && (
                    <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-normal normal-case">
                      <CheckCircle2 size={11} /> Valid
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    onBlur={() => handleBlur("name", name)}
                    placeholder="Enter your full name"
                    className={`mt-2 w-full border-b bg-transparent px-1 py-3 text-sm font-normal normal-case tracking-normal text-foreground placeholder:text-muted-foreground outline-none transition-colors ${
                      touched.name && errors.name
                        ? "border-red-500 focus:border-red-600"
                        : touched.name && !errors.name
                        ? "border-emerald-500 focus:border-emerald-600"
                        : "border-input focus:border-accent"
                    }`}
                  />
                </div>
                {touched.name && errors.name && (
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-red-600">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/80 flex items-center justify-between">
                  <span>Phone number (optional)</span>
                  {touched.phone && !errors.phone && phone.trim() && (
                    <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-normal normal-case">
                      <CheckCircle2 size={11} /> Valid
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    onBlur={() => handleBlur("phone", phone)}
                    placeholder="e.g. 9876543210"
                    className={`mt-2 w-full border-b bg-transparent px-1 py-3 text-sm font-normal normal-case tracking-normal text-foreground placeholder:text-muted-foreground outline-none transition-colors ${
                      touched.phone && errors.phone
                        ? "border-red-500 focus:border-red-600"
                        : touched.phone && !errors.phone && phone.trim()
                        ? "border-emerald-500 focus:border-emerald-600"
                        : "border-input focus:border-accent"
                    }`}
                  />
                </div>
                {touched.phone && errors.phone && (
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-red-600">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/80 flex items-center justify-between">
                <span>Email address *</span>
                {touched.email && !errors.email && (
                  <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-normal normal-case">
                    <CheckCircle2 size={11} /> Valid
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email", email)}
                  placeholder="you@example.com"
                  className={`mt-2 w-full border-b bg-transparent px-1 py-3 text-sm font-normal normal-case tracking-normal text-foreground placeholder:text-muted-foreground outline-none transition-colors ${
                    touched.email && errors.email
                      ? "border-red-500 focus:border-red-600"
                      : touched.email && !errors.email
                      ? "border-emerald-500 focus:border-emerald-600"
                      : "border-input focus:border-accent"
                  }`}
                />
              </div>
              {touched.email && errors.email && (
                <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-red-600">
                  <AlertCircle size={12} className="shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Topic Field */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/80">
                Topic
              </label>
              <select
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                className="mt-2 w-full border-b border-input bg-transparent px-1 py-3 text-sm font-normal normal-case tracking-normal text-foreground outline-none focus:border-accent cursor-pointer"
              >
                <option value="Styling & fit">Styling &amp; fit</option>
                <option value="Kids wear & sizing">Kids wear &amp; sizing</option>
                <option value="Festive suit & kurta order">Festive suit &amp; kurta order</option>
                <option value="Shipping & returns">Shipping &amp; returns</option>
                <option value="Bulk / gifting inquiry">Bulk / gifting inquiry</option>
                <option value="Other question">Other question</option>
              </select>
            </div>

            {/* Message Field */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/80">
                  How can we help? *
                </label>
                <span className="text-[10px] text-muted-foreground">
                  {message.trim().length} / 3000 chars
                </span>
              </div>
              <div className="relative">
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  onBlur={() => handleBlur("message", message)}
                  placeholder="Tell us what you are looking for (minimum 10 characters)..."
                  className={`mt-2 w-full border-b bg-transparent px-1 py-3 text-sm font-normal leading-relaxed normal-case tracking-normal text-foreground placeholder:text-muted-foreground outline-none transition-colors ${
                    touched.message && errors.message
                      ? "border-red-500 focus:border-red-600"
                      : touched.message && !errors.message && message.trim()
                      ? "border-emerald-500 focus:border-emerald-600"
                      : "border-input focus:border-accent"
                  }`}
                />
              </div>
              {touched.message && errors.message && (
                <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-red-600">
                  <AlertCircle size={12} className="shrink-0" />
                  <span>{errors.message}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-3 flex h-12 items-center justify-center gap-2 rounded-lg bg-accent px-6 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-accent/90 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <span>Sending Message</span>
                  <Loader2 size={15} className="animate-spin" />
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
