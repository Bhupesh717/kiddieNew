import type { Metadata } from "next";
import { PageIntro, SiteFooter, SiteHeader } from "@/components/site-shell";
import { TermsContent } from "@/components/terms-content";

export const metadata: Metadata = {
  title: "Terms and Conditions | KiddieQuick LLP",
  description:
    "Review the Terms of Use, order policies, and legal framework governing purchases at KiddieQuick LLP.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <PageIntro
        eyebrow="Legal & Policies"
        title="Terms & Conditions"
        copy="Clear, fair terms guiding your shopping experience, order fulfillment, and rights with KiddieQuick LLP."
      />

      <TermsContent />

      <SiteFooter />
    </main>
  );
}
