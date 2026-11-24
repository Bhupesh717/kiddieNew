"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  Truck,
  RotateCcw,
  Sparkles,
  CreditCard,
  UserCheck,
  Mail,
  Phone,
  HelpCircle,
  MessageCircleQuestion,
  CheckCircle2,
} from "lucide-react";

interface FaqItem {
  question: string;
  answer: React.ReactNode;
  category: "orders" | "returns" | "sizing" | "payments" | "account";
}

const FAQ_DATA: FaqItem[] = [
  // Orders & Delivery
  {
    category: "orders",
    question: "How do I track my KiddieQuick order?",
    answer: (
      <p>
        Once your order is dispatched, you will receive a tracking link via SMS and email. You can also track your shipment live at any time by visiting our{" "}
        <Link href="/account?tab=track" className="text-accent underline font-semibold">
          Track Order Page
        </Link>{" "}
        using your 10-digit mobile number or order reference code.
      </p>
    ),
  },
  {
    category: "orders",
    question: "What are your delivery timelines and shipping charges?",
    answer: (
      <div>
        <p>
          We offer <strong className="text-foreground">FREE standard shipping across India</strong> on all orders above Rs. 2,000. For orders below Rs. 2,000, a nominal shipping charge of Rs. 99 applies.
        </p>
        <p className="mt-2">
          Orders are typically dispatched from our Jaipur fulfillment hub within 24–48 hours. Delivery takes 3–5 business days depending on your location and pin code.
        </p>
      </div>
    ),
  },
  {
    category: "orders",
    question: "Do you deliver to my pin code?",
    answer: (
      <p>
        We ship to over 20,000+ pin codes across India through premier courier partners including Blue Dart, Delhivery, ExpressBees, and DTDC. You can verify pin code serviceability directly on any product page before placing an order.
      </p>
    ),
  },
  {
    category: "orders",
    question: "Can I modify or cancel my order after placing it?",
    answer: (
      <p>
        Orders can be modified or cancelled within 2 hours of placement, before they are packed and handed over to our logistics partner. To request a change or cancellation, please reach out immediately to our support team at{" "}
        <a href="mailto:hello@kiddiequick.in" className="text-accent underline font-semibold">
          hello@kiddiequick.in
        </a>{" "}
        or WhatsApp/Call at{" "}
        <a href="tel:+918824700161" className="text-accent underline font-semibold">
          +91 (882) 470-0161
        </a>
        .
      </p>
    ),
  },

  // Returns & Exchanges
  {
    category: "returns",
    question: "What is your return and exchange policy?",
    answer: (
      <div>
        <p>
          We offer a hassle-free <strong className="text-foreground">7-Day Return and Exchange policy</strong> from the date of delivery.
        </p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>Garments must be unworn, unwashed, and in their original packaging with all brand tags intact.</li>
          <li>Size exchanges are complimentary (free pickup and replacement delivery).</li>
          <li>For hygiene reasons, newborn innerwear and custom alterations are non-returnable unless defective.</li>
        </ul>
      </div>
    ),
  },
  {
    category: "returns",
    question: "How long does it take to receive a refund?",
    answer: (
      <p>
        Once our warehouse receives and inspects the returned item (usually within 24–48 hours of pickup), refunds for prepaid orders are credited back to your original payment method (Bank / UPI / Card) within 5–7 business days. For Cash on Delivery (COD) orders, refunds are credited via direct NEFT/UPI bank transfer.
      </p>
    ),
  },
  {
    category: "returns",
    question: "How do I initiate a return or size exchange?",
    answer: (
      <p>
        Log in to your{" "}
        <Link href="/account?tab=orders" className="text-accent underline font-semibold">
          My Account &gt; Orders
        </Link>{" "}
        section and click &ldquo;Request Return / Exchange&rdquo; next to the item, or message our customer concierge team with your Order ID at{" "}
        <a href="mailto:hello@kiddiequick.in" className="text-accent underline font-semibold">
          hello@kiddiequick.in
        </a>
        . We will arrange a doorstep reverse pickup from your address.
      </p>
    ),
  },

  // Sizing & Garment Care
  {
    category: "sizing",
    question: "How do I choose the correct size for my child?",
    answer: (
      <div>
        <p>
          Every product page includes an interactive <strong>Size Chart &amp; Fit Guide</strong> with age, chest, height, and length recommendations in both centimeters and inches.
        </p>
        <p className="mt-2">
          If your child is in-between sizes or on the taller side, we generally recommend choosing one size up for longer and more comfortable wear.
        </p>
      </div>
    ),
  },
  {
    category: "sizing",
    question: "What fabrics do you use? Are they safe for sensitive skin?",
    answer: (
      <p>
        All KiddieQuick garments are crafted from premium bio-washed 100% breathable cotton, fine linen blends, and soft organic fabrics. We avoid harsh dyes and abrasive synthetic fibers to ensure complete comfort and safety for delicate, sensitive skin in Indian climates.
      </p>
    ),
  },
  {
    category: "sizing",
    question: "How should I wash and care for KiddieQuick garments?",
    answer: (
      <p>
        We recommend a gentle machine wash or hand wash in cold water with mild liquid detergent. Wash dark colors separately and avoid tumble drying on high heat. Iron on medium setting inside out, especially on embroidered or printed areas.
      </p>
    ),
  },

  // Payments & Security
  {
    category: "payments",
    question: "What payment options are available?",
    answer: (
      <div>
        <p>We provide multiple secure payment methods:</p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li><strong>Instant UPI:</strong> Google Pay, PhonePe, Paytm, BHIM, Cred</li>
          <li><strong>Debit &amp; Credit Cards:</strong> Visa, MasterCard, RuPay, American Express</li>
          <li><strong>Net Banking:</strong> All major Indian banks</li>
          <li><strong>Cash on Delivery (COD):</strong> Available on eligible pin codes</li>
        </ul>
      </div>
    ),
  },
  {
    category: "payments",
    question: "Is it safe to make online payments on KiddieQuick?",
    answer: (
      <p>
        Yes, 100% safe. All transactions are processed through RBI-authorized, PCI-DSS Level 1 compliant payment gateways protected with 256-bit SSL encryption. We never store your card numbers or CVV on our servers.
      </p>
    ),
  },
  {
    category: "payments",
    question: "What happens if money was debited but my order failed?",
    answer: (
      <p>
        In rare instances of banking network disruption where money is deducted but an order confirmation was not generated, the amount is automatically reversed by your bank within 24 to 48 hours. If you need confirmation, please email us your transaction ID at{" "}
        <a href="mailto:hello@kiddiequick.in" className="text-accent underline font-semibold">
          hello@kiddiequick.in
        </a>
        .
      </p>
    ),
  },

  // Account & Support
  {
    category: "account",
    question: "How do I sign in without remembering passwords?",
    answer: (
      <p>
        KiddieQuick uses secure, frictionless <strong>Email OTP Authentication</strong>. Enter your registered email address on our Login page, and you will receive an instant 6-digit one-time password in your inbox. No passwords to remember or reset!
      </p>
    ),
  },
  {
    category: "account",
    question: "How can I contact customer support?",
    answer: (
      <div>
        <p>Our dedicated support team in Jaipur is available Monday to Saturday, 9:30 AM to 7:00 PM IST:</p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li><strong>Email:</strong> <a href="mailto:hello@kiddiequick.in" className="text-accent underline font-semibold">hello@kiddiequick.in</a></li>
          <li><strong>Phone / WhatsApp:</strong> <a href="tel:+918824700161" className="text-accent underline font-semibold">+91 (882) 470-0161</a></li>
          <li><strong>Contact Form:</strong> Available 24/7 on our <Link href="/contact" className="text-accent underline font-semibold">Contact Page</Link></li>
        </ul>
      </div>
    ),
  },
];

const CATEGORIES = [
  { id: "all", label: "All Questions", icon: HelpCircle },
  { id: "orders", label: "Orders & Delivery", icon: Truck },
  { id: "returns", label: "Returns & Exchanges", icon: RotateCcw },
  { id: "sizing", label: "Sizing & Fabrics", icon: Sparkles },
  { id: "payments", label: "Payments & Pricing", icon: CreditCard },
  { id: "account", label: "Account & Support", icon: UserCheck },
] as const;

export function FaqContent() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // First item open by default

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const toggleExpand = (idx: number) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Search Bar */}
      <div className="mx-auto max-w-2xl text-center">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. tracking, returns, sizing, refund, cotton)..."
            className="h-13 w-full rounded-2xl border border-border bg-card pl-11 pr-4 text-sm text-foreground shadow-sm placeholder:text-muted-foreground/70 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                setExpandedIndex(null);
              }}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                isSelected
                  ? "bg-accent text-white shadow-sm"
                  : "border border-border bg-card text-muted-foreground hover:border-accent/50 hover:text-foreground"
              }`}
            >
              <Icon size={14} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* FAQs List Accordion */}
      <div className="mt-10 space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, idx) => {
            const isOpen = expandedIndex === idx;
            return (
              <div
                key={faq.question}
                className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                  isOpen
                    ? "border-accent/40 bg-card shadow-sm ring-1 ring-accent/20"
                    : "border-border bg-card/60 hover:border-border/90 hover:bg-card"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(idx)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left"
                >
                  <span className="font-serif text-base sm:text-lg font-bold text-primary">
                    {faq.question}
                  </span>
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-transform duration-200 ${
                      isOpen
                        ? "rotate-180 bg-accent text-white"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    <ChevronDown size={16} />
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-border/60 bg-background/50 px-5 py-4 sm:px-6 sm:py-5 text-sm leading-relaxed text-muted-foreground animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <MessageCircleQuestion size={36} className="mx-auto text-muted-foreground/60" />
            <h3 className="mt-3 font-serif text-lg font-semibold text-primary">
              No matching questions found
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              We couldn&rsquo;t find an answer for &ldquo;{searchQuery}&rdquo;. Try another search term or contact our concierge team.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-4 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white transition hover:bg-accent/90"
            >
              Reset Search &amp; Filters
            </button>
          </div>
        )}
      </div>

      {/* Still Have Questions? Banner */}
      <div className="mt-14 rounded-3xl border border-border bg-secondary/50 p-8 sm:p-10 shadow-sm">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:text-left text-center">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
              Need Personal Assistance?
            </span>
            <h3 className="mt-1 font-serif text-2xl font-bold text-primary sm:text-3xl">
              Still Have Questions?
            </h3>
            <p className="mt-2 max-w-lg text-xs leading-relaxed text-muted-foreground">
              Can&rsquo;t find what you&rsquo;re looking for? Our dedicated team in Jaipur is happy to assist with sizing, custom requirements, or order updates.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition hover:bg-accent/90"
            >
              <Mail size={15} />
              <span>Contact Support</span>
            </Link>
            <a
              href="tel:+918824700161"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-xs font-semibold text-foreground transition hover:border-accent hover:text-accent"
            >
              <Phone size={15} />
              <span>+91 (882) 470-0161</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
