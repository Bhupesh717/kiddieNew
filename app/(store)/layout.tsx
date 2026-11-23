import type { ReactNode } from "react";
import { StorefrontProvider } from "@/components/storefront/cart-provider";
import { NewsletterModal } from "@/components/storefront/newsletter-modal";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <StorefrontProvider>
      {children}
      <NewsletterModal />
    </StorefrontProvider>
  );
}
