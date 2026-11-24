"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Scale,
  Globe,
  User,
  CreditCard,
  Truck,
  RotateCcw,
  Copyright,
  AlertTriangle,
  ShieldCheck,
  FileEdit,
  Gavel,
  Mail,
  Phone,
  MapPin,
  List,
  ChevronRight,
} from "lucide-react";

interface SectionItem {
  id: string;
  title: string;
  shortTitle: string;
  icon: typeof FileText;
  badge?: string;
  content: React.ReactNode;
}

const SECTIONS: SectionItem[] = [
  {
    id: "introduction",
    title: "1. Introduction",
    shortTitle: "Introduction",
    icon: FileText,
    badge: "Agreement",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          Welcome to <strong className="text-foreground">KiddieQuick LLP</strong> (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;). By accessing or using our e-commerce platform, you agree to comply with these Terms of Use. Please review these terms carefully.
        </p>
      </div>
    ),
  },
  {
    id: "acceptance-of-terms",
    title: "2. Acceptance of Terms",
    shortTitle: "Acceptance",
    icon: Scale,
    badge: "Binding Terms",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          By accessing or using our platform, you agree to be bound by these Terms of Use and all applicable laws. If you do not agree to these terms, please discontinue using our platform.
        </p>
      </div>
    ),
  },
  {
    id: "use-of-the-platform",
    title: "3. Use of the Platform",
    shortTitle: "Platform Use",
    icon: Globe,
    badge: "Permitted Use",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          You agree to use our platform only for lawful purposes and in a manner that does not infringe upon the rights of, restrict, or inhibit any other user&rsquo;s experience on the platform.
        </p>
      </div>
    ),
  },
  {
    id: "user-accounts",
    title: "4. User Accounts",
    shortTitle: "User Accounts",
    icon: User,
    badge: "Security",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          To access certain features of our platform, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for any activity conducted under your account.
        </p>
      </div>
    ),
  },
  {
    id: "purchases-and-payments",
    title: "5. Purchases and Payments",
    shortTitle: "Purchases & Payments",
    icon: CreditCard,
    badge: "Orders & Pricing",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          By purchasing items on our platform, you agree to provide accurate and complete payment information. We reserve the right to refuse or cancel any order at our discretion. Prices, product descriptions, and availability are subject to change without notice.
        </p>
      </div>
    ),
  },
  {
    id: "shipping-and-delivery",
    title: "6. Shipping and Delivery",
    shortTitle: "Shipping & Delivery",
    icon: Truck,
    badge: "Logistics",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          Shipping times and costs may vary based on location and product selection. KiddieQuick LLP is not liable for any delays due to unforeseen events beyond our control, including but not limited to, weather conditions, customs delays, or carrier issues.
        </p>
      </div>
    ),
  },
  {
    id: "returns-and-refunds",
    title: "7. Returns and Refunds",
    shortTitle: "Returns & Refunds",
    icon: RotateCcw,
    badge: "Return Policy",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          Our return and refund policies are outlined separately on our platform. Please refer to the{" "}
          <Link
            href="/shipping"
            className="text-accent underline underline-offset-4 font-semibold hover:text-accent/90"
          >
            &ldquo;Returns &amp; Refunds&rdquo;
          </Link>{" "}
          section for full details on eligibility and procedures for returning items and receiving refunds.
        </p>
      </div>
    ),
  },
  {
    id: "intellectual-property",
    title: "8. Intellectual Property",
    shortTitle: "Intellectual Property",
    icon: Copyright,
    badge: "Copyrights",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          All content on our platform, including text, graphics, logos, images, and software, is the property of KiddieQuick LLP and is protected by intellectual property laws. Unauthorized use of any content is strictly prohibited.
        </p>
      </div>
    ),
  },
  {
    id: "limitation-of-liability",
    title: "9. Limitation of Liability",
    shortTitle: "Limitation of Liability",
    icon: AlertTriangle,
    badge: "Liability",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          To the fullest extent permitted by law, KiddieQuick LLP shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use or inability to use our platform.
        </p>
      </div>
    ),
  },
  {
    id: "indemnification",
    title: "10. Indemnification",
    shortTitle: "Indemnification",
    icon: ShieldCheck,
    badge: "Legal Protection",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          You agree to indemnify and hold harmless KiddieQuick LLP, its affiliates, employees, and agents from any claims, liabilities, damages, or expenses arising from your use of our platform or breach of these Terms.
        </p>
      </div>
    ),
  },
  {
    id: "changes-to-terms",
    title: "11. Changes to Terms",
    shortTitle: "Changes to Terms",
    icon: FileEdit,
    badge: "Modifications",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          KiddieQuick LLP reserves the right to modify these Terms of Use at any time. Any changes will take effect immediately upon being posted on our platform. Continued use of our platform following any modifications constitutes acceptance of the revised terms.
        </p>
      </div>
    ),
  },
  {
    id: "governing-law",
    title: "12. Governing Law",
    shortTitle: "Governing Law",
    icon: Gavel,
    badge: "Jurisdiction",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          These Terms of Use are governed by the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Jaipur, Rajasthan, India.
        </p>
      </div>
    ),
  },
  {
    id: "questions-about-terms",
    title: "13. Questions About These Terms?",
    shortTitle: "Contact Us",
    icon: Mail,
    badge: "Support Desk",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          If you have any questions or concerns about these Terms of Use, please contact us via our official support channels:
        </p>
        <div className="mt-3 grid gap-3 rounded-xl border border-border bg-background p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Mail size={16} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Email Support</p>
              <a
                href="mailto:hello@kiddiequick.in"
                className="text-sm font-semibold text-accent hover:underline break-all"
              >
                hello@kiddiequick.in
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Phone size={16} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Phone Support</p>
              <a
                href="tel:+918824700162"
                className="text-sm font-semibold text-accent hover:underline"
              >
                +91 (882) 470-0162
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <MapPin size={16} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Registered Address</p>
              <p className="text-xs text-foreground font-medium">
                10/523 Malviya Nagar Road, Jaipur 302017, Rajasthan, India
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export function TermsContent() {
  const [activeSection, setActiveSection] = useState<string>("introduction");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 100;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSection(id);
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Terms Meta Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Scale size={16} className="text-accent" />
          <span>Effective Date: 1 January 2026</span>
        </div>
        <span>Last Updated: November 2026</span>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
        {/* Sticky Left Table of Contents */}
        <aside className="hidden lg:block lg:col-span-4 sticky top-24 z-10">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm max-h-[calc(100vh-7.5rem)] flex flex-col">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border">
              <span className="flex size-7 items-center justify-center rounded-md bg-accent/10 text-accent">
                <List size={16} />
              </span>
              <div>
                <h3 className="font-serif text-sm font-bold text-primary">Table of Contents</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Terms Navigation</p>
              </div>
            </div>

            {/* Scrollable Nav List */}
            <nav className="mt-3 overflow-y-auto pr-1 space-y-1 text-xs flex-1">
              {SECTIONS.map((sec) => {
                const isActive = activeSection === sec.id;
                return (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    onClick={(e) => scrollToSection(e, sec.id)}
                    className={`group flex items-center justify-between rounded-lg px-3 py-2 transition-all ${
                      isActive
                        ? "bg-accent/10 font-semibold text-accent"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <span className="truncate">{sec.title}</span>
                    <ChevronRight
                      size={13}
                      className={`shrink-0 transition-transform ${
                        isActive ? "translate-x-0.5 text-accent opacity-100" : "opacity-0 group-hover:opacity-60"
                      }`}
                    />
                  </a>
                );
              })}
            </nav>

            {/* Help Callout at bottom of sticky sidebar */}
            <div className="mt-4 pt-3 border-t border-border/80">
              <div className="rounded-xl bg-secondary/60 p-3 text-[11px]">
                <p className="font-semibold text-primary">Questions About Our Terms?</p>
                <p className="mt-0.5 text-muted-foreground text-[10px]">
                  Our customer concierge is here to help clarify any policy.
                </p>
                <a
                  href="mailto:hello@kiddiequick.in"
                  className="mt-2 inline-flex items-center gap-1.5 font-semibold text-accent hover:underline text-[11px]"
                >
                  <Mail size={12} />
                  <span>hello@kiddiequick.in</span>
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Horizontal Quick Navigation */}
        <div className="lg:hidden mb-6 sticky top-16 z-20 -mx-4 px-4 py-2 bg-background/95 backdrop-blur border-b border-border overflow-x-auto scrollbar-none flex gap-2">
          {SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                onClick={(e) => scrollToSection(e, sec.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors ${
                  isActive
                    ? "bg-accent text-white shadow-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {sec.shortTitle}
              </a>
            );
          })}
        </div>

        {/* Main Content Sections */}
        <div className="lg:col-span-8 space-y-6">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <article
                key={sec.id}
                id={sec.id}
                className={`scroll-mt-28 rounded-2xl border transition-all duration-300 p-6 sm:p-7 ${
                  isActive
                    ? "border-accent/40 bg-card shadow-sm ring-1 ring-accent/20"
                    : "border-border bg-card/60"
                }`}
              >
                <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3.5 mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex size-9 items-center justify-center rounded-xl transition-colors ${
                        isActive
                          ? "bg-accent text-white shadow-sm"
                          : "bg-accent/10 text-accent"
                      }`}
                    >
                      <Icon size={18} />
                    </span>
                    <h2 className="font-serif text-xl sm:text-2xl text-primary font-bold">
                      {sec.title}
                    </h2>
                  </div>
                  {sec.badge && (
                    <span className="hidden sm:inline-block rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {sec.badge}
                    </span>
                  )}
                </div>

                {sec.content}
              </article>
            );
          })}

          {/* Bottom Footer Help */}
          <div className="mt-10 rounded-2xl border border-border bg-secondary/40 p-6 text-center text-xs text-muted-foreground">
            <p>
              Need further legal or policy assistance?{" "}
              <Link
                href="/contact"
                className="font-semibold text-accent underline underline-offset-4 hover:text-accent/90"
              >
                Contact our concierge team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
