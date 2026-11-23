import type { Metadata } from "next";
import { Suspense } from "react";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import { GlobalLoaderProvider } from "@/components/providers/global-loader-provider";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif-loaded",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "KiddieQuick LLP | Smart Kids, Men & Women Wear",
    template: "%s | KiddieQuick",
  },
  description:
    "Smart Kids, Men & Women Fashion by KiddieQuick LLP. High quality cottons, linens, and accessories.",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${cormorant.variable} ${jakarta.variable}`}
    >
      <body suppressHydrationWarning className="font-sans antialiased">
        <Suspense fallback={null}>
          <GlobalLoaderProvider>{children}</GlobalLoaderProvider>
        </Suspense>
      </body>
    </html>
  );
}
