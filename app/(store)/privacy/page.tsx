import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Mail, Lock, Eye, FileText, RefreshCw } from "lucide-react";
import { PageIntro, SiteFooter, SiteHeader } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how KiddieQuick LLP collects, protects, and handles your personal information.",
};

const SECTIONS = [
  {
    icon: Lock,
    title: "1. Information We Collect",
    content: (
      <>
        <p>
          When you place an order, create an account, or contact our team at
          KiddieQuick LLP, we collect the necessary personal information
          required to serve you:
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
          <li>
            <strong>Contact Details:</strong> Full name, email address, phone
            number, and postal delivery address.
          </li>
          <li>
            <strong>Order Details:</strong> Items purchased, sizes, billing
            records, order status, and customer notes.
          </li>
          <li>
            <strong>Technical Information:</strong> IP address, device type,
            browser version, and session identifiers to ensure reliable cart
            checkout and fraud prevention.
          </li>
        </ul>
      </>
    ),
  },
  {
    icon: Eye,
    title: "2. How We Use Your Information",
    content: (
      <>
        <p>Your data is used solely to provide a seamless shopping experience:</p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
          <li>Fulfill, pack, ship, and deliver your orders to your doorstep.</li>
          <li>
            Send dispatch updates, courier tracking links, and order
            confirmations via SMS/Email/WhatsApp.
          </li>
          <li>
            Provide customer support, size guidance, and process returns or
            exchanges.
          </li>
          <li>
            Continuously improve product sizing, garment comfort, and website
            speed.
          </li>
        </ul>
      </>
    ),
  },
  {
    icon: ShieldCheck,
    title: "3. Payment Security & Encryption",
    content: (
      <>
        <p>
          We do <strong>not</strong> store your credit/debit card numbers, CVVs,
          or Net Banking passwords on our servers.
        </p>
        <p className="mt-2">
          All online transactions are processed through RBI-approved, PCI-DSS
          Level 1 certified payment gateways with 256-bit SSL encryption.
        </p>
      </>
    ),
  },
  {
    icon: RefreshCw,
    title: "4. Data Sharing & Third Parties",
    content: (
      <>
        <p>
          KiddieQuick LLP does <strong>never</strong> sell, rent, or trade your
          personal information to third parties for marketing purposes.
        </p>
        <p className="mt-2">
          We share your contact and delivery address only with trusted service
          providers strictly required for order fulfillment:
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
          <li>Insured logistics courier partners (e.g. Blue Dart, Delhivery) for delivery.</li>
          <li>Encrypted SMS and email notification gateways.</li>
        </ul>
      </>
    ),
  },
  {
    icon: FileText,
    title: "5. Cookies & Session Storage",
    content: (
      <p>
        We use essential cookies and local browser storage to keep track of your
        active shopping cart, remember your language preferences, and maintain
        secure account sign-in sessions. You can disable cookies in your browser
        settings, though some storefront features like bag persistence may be
        affected.
      </p>
    ),
  },
  {
    icon: Mail,
    title: "6. Your Rights & Privacy Inquiries",
    content: (
      <>
        <p>
          You have the right to request a copy of your personal data, update your
          profile, or request data deletion at any time.
        </p>
        <p className="mt-2">
          For any privacy questions or requests, please write to our Data
          Grievance Officer:
        </p>
        <div className="mt-3 rounded-lg border border-border bg-popover p-4 text-xs">
          <p className="font-semibold text-primary">KiddieQuick LLP — Privacy Desk</p>
          <p className="mt-1 text-muted-foreground">
            10/523, Malviya Nagar Road, Jaipur - 302017, Rajasthan, India
          </p>
          <p className="mt-1">
            Email:{" "}
            <a
              href="mailto:hello@kiddiequick.in"
              className="text-accent underline underline-offset-4"
            >
              hello@kiddiequick.in
            </a>
          </p>
        </div>
      </>
    ),
  },
] as const;

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <PageIntro
        eyebrow="Trust & Transparency"
        title="Privacy Policy"
        copy="How KiddieQuick LLP safeguards your personal data, transaction security, and shopping privacy."
      />

      <section className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8 flex items-center justify-between border-b border-border pb-4 text-xs text-muted-foreground">
          <span>Effective Date: 1 January 2026</span>
          <span>Last Updated: November 2026</span>
        </div>

        <div className="space-y-8">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            return (
              <article
                key={sec.title}
                className="rounded-xl border border-border bg-secondary/50 p-6 sm:p-8"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Icon size={18} />
                  </span>
                  <h2 className="font-serif text-2xl text-primary">{sec.title}</h2>
                </div>
                <div className="mt-4 text-sm leading-7 text-muted-foreground">
                  {sec.content}
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-12 text-center text-xs text-muted-foreground">
          Have questions about our privacy practices?{" "}
          <Link
            href="/contact"
            className="font-medium text-accent underline underline-offset-4"
          >
            Contact our concierge team
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
