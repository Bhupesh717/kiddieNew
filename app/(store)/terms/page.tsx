import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  RotateCcw,
  Scale,
  ShieldAlert,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { PageIntro, SiteFooter, SiteHeader } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms and conditions governing the use of KiddieQuick LLP storefront and product orders.",
};

const TERMS = [
  {
    icon: Scale,
    title: "1. Acceptance of Terms",
    content: (
      <>
        <p>
          Welcome to KiddieQuick LLP. By accessing our website, browsing our
          catalog, or making a purchase, you agree to comply with and be bound
          by these Terms and Conditions.
        </p>
        <p className="mt-2">
          These terms are governed in accordance with the laws of India. Any
          disputes arising shall be subject to the exclusive jurisdiction of the
          competent courts in Jaipur, Rajasthan.
        </p>
      </>
    ),
  },
  {
    icon: ShoppingBag,
    title: "2. Product Accuracy, Colors & Pricing",
    content: (
      <>
        <p>
          We make every effort to display garment colors, textures, and fabric
          finishes accurately. However, actual colors may slightly vary due to
          individual monitor settings or lighting during photography.
        </p>
        <p className="mt-2">
          All prices listed on the website are in Indian Rupees (INR) and are
          inclusive of applicable GST. We reserve the right to revise product
          pricing and promotional offers without prior notice.
        </p>
      </>
    ),
  },
  {
    icon: FileText,
    title: "3. Orders & Payment Processing",
    content: (
      <>
        <p>
          An order is confirmed once payment authorization is successful and a
          confirmation email / SMS with order number is generated.
        </p>
        <p className="mt-2">
          We accept major credit/debit cards, Net Banking, UPI (Google Pay,
          PhonePe, Paytm), and Cash on Delivery (COD) on eligible pin codes. In
          the event of payment failure or technical disruption, any deducted
          funds are automatically reversed by your bank within 5–7 working days.
        </p>
      </>
    ),
  },
  {
    icon: Truck,
    title: "4. Shipping & Delivery",
    content: (
      <>
        <p>
          Orders are typically dispatched from our Jaipur hub within 1–3
          working days. Standard delivery timelines range from 3–5 working days
          depending on the destination location across 20,000+ serviceable pin
          codes.
        </p>
        <p className="mt-2">
          While we partner with premier courier providers, delivery times may be
          subject to unforeseen logistics delays or regional holidays.
        </p>
      </>
    ),
  },
  {
    icon: RotateCcw,
    title: "5. 7-Day Returns & Size Exchanges",
    content: (
      <>
        <p>
          We want you and your little ones to love every piece. If you need a
          size change or return, requests can be initiated within 7 calendar days
          from the date of delivery.
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
          <li>
            Items must be unused, unwashed, unworn, with all original tags and
            packaging intact.
          </li>
          <li>
            For hygiene reasons, newborn inner garments and custom-altered
            pieces are non-returnable unless received defective.
          </li>
          <li>
            Refunds for prepaid orders are credited back to the original payment
            source within 5–7 business days upon quality inspection.
          </li>
        </ul>
      </>
    ),
  },
  {
    icon: ShieldAlert,
    title: "6. Intellectual Property & Brand Rights",
    content: (
      <p>
        All content on this website — including text, brand names, product
        photography, graphics, video films, logos, and software — is the
        intellectual property of KiddieQuick LLP. Unauthorized copying,
        commercial reproduction, or modification is strictly prohibited.
      </p>
    ),
  },
] as const;

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <PageIntro
        eyebrow="Legal & Policies"
        title="Terms & Conditions"
        copy="Clear, fair terms guiding your shopping experience and rights with KiddieQuick LLP."
      />

      <section className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8 flex items-center justify-between border-b border-border pb-4 text-xs text-muted-foreground">
          <span>Effective Date: 1 January 2026</span>
          <span>Last Updated: November 2026</span>
        </div>

        <div className="space-y-8">
          {TERMS.map((term) => {
            const Icon = term.icon;
            return (
              <article
                key={term.title}
                className="rounded-xl border border-border bg-secondary/50 p-6 sm:p-8"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Icon size={18} />
                  </span>
                  <h2 className="font-serif text-2xl text-primary">{term.title}</h2>
                </div>
                <div className="mt-4 text-sm leading-7 text-muted-foreground">
                  {term.content}
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-12 rounded-xl border border-border bg-popover p-6 text-center text-xs text-muted-foreground">
          <p className="font-semibold text-primary">Need clarification on any policy?</p>
          <p className="mt-1">
            Our concierge team is happy to assist. Email us at{" "}
            <a
              href="mailto:hello@kiddiequick.in"
              className="text-accent underline underline-offset-4"
            >
              hello@kiddiequick.in
            </a>{" "}
            or visit our{" "}
            <Link
              href="/contact"
              className="font-medium text-accent underline underline-offset-4"
            >
              Contact Page
            </Link>
            .
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
