import type { Metadata } from "next";
import { PageIntro, SiteFooter, SiteHeader } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description:
    "Shipping timelines, international delivery, and return policy for Majisavesh.",
};

const policies = [
  [
    "Shipping",
    "Free shipping on domestic orders above Rs 2,000. Orders are dispatched within 2–4 working days.",
  ],
  [
    "International",
    "We ship worldwide. Duties and taxes are calculated at checkout and delivery usually takes 7–10 working days.",
  ],
  [
    "Returns",
    "Unused pieces can be returned within 7 days of delivery. Bespoke and altered pieces are final sale.",
  ],
] as const;

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-[#fbf8f3] text-[#33251f]">
      <SiteHeader />
      <PageIntro
        eyebrow="Care, from our door to yours"
        title="Shipping & returns"
        copy="Everything you need to know before your Majisavesh piece begins its journey."
      />
      <section className="mx-auto grid max-w-5xl gap-4 px-5 py-12 pb-20 md:grid-cols-3 lg:px-8">
        {policies.map(([title, copy]) => (
          <article
            key={title}
            className="border border-[#e8ded2] bg-[#f3ece2] p-6"
          >
            <h2 className="font-serif text-2xl">{title}</h2>
            <p className="mt-4 text-sm leading-7 text-[#77675d]">{copy}</p>
          </article>
        ))}
      </section>
      <SiteFooter />
    </main>
  );
}
