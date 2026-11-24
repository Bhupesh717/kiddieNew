import type { Metadata } from "next";
import { PageIntro, SiteFooter, SiteHeader } from "@/components/site-shell";
import { PrivacyContent } from "@/components/privacy-content";

export const metadata: Metadata = {
  title: "Privacy Policy | KiddieQuick LLP",
  description:
    "Learn how KiddieQuick LLP collects, uses, and safeguards your personal information, orders, and data security.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <PageIntro
        eyebrow="Trust & Transparency"
        title="Privacy Policy"
        copy="Learn how KiddieQuick LLP collects, protects, and handles your personal information across our e-commerce platform."
      />

      <PrivacyContent />

      <SiteFooter />
    </main>
  );
}
