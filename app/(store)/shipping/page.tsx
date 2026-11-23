import type { Metadata } from "next";
import { PageIntro, SiteFooter, SiteHeader } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description:
    "Shipping timelines, pan-India delivery, and return policy for KiddieQuick.",
};

const policies = [
  [
    "Shipping",
    "Free shipping on domestic orders above Rs 999. Orders are dispatched within 1–3 working days.",
  ],
  [
    "Express Delivery",
    "We ship across 20,000+ pin codes in India with reliable courier partners. Delivery usually takes 3–5 working days.",
  ],
  [
    "Easy Returns",
    "Unused pieces with original tags can be returned or exchanged within 7 days of delivery.",
  ],
] as const;

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <PageIntro
        eyebrow="Care, from our door to yours"
        title="Shipping & returns"
        copy="Everything you need to know before your KiddieQuick order begins its journey."
      />
      <section className="mx-auto grid max-w-5xl gap-4 px-5 py-12 pb-20 md:grid-cols-3 lg:px-8">
        {policies.map(([title, copy]) => (
          <article
            key={title}
            className="border border-border bg-secondary p-6"
          >
            <h2 className="font-serif text-2xl">{title}</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">{copy}</p>
          </article>
        ))}
      </section>
      <SiteFooter />
    </main>
  );
}
