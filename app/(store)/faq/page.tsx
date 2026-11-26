import type { Metadata } from "next";
import { PageIntro, SiteFooter, SiteHeader } from "@/components/site-shell";
import { FaqContent } from "@/components/faq-content";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) | KiddieQuick",
  description:
    "Find answers to common questions about KiddieQuick orders, shipping timelines, 7-day returns, sizing guides, bio-washed cotton, and payment options.",
};

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <PageIntro
        eyebrow="Help & Support Center"
        title="Frequently Asked Questions"
        copy="Everything you need to know about shopping, orders, sizes, returns, and fabrics at KiddieQuick."
      />

      <FaqContent />

      <SiteFooter />
    </main>
  );
}
