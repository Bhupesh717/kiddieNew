"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Database,
  Eye,
  Share2,
  Lock,
  Clock,
  UserCheck,
  Cookie,
  ExternalLink,
  Baby,
  FileEdit,
  Mail,
  Phone,
  MapPin,
  List,
  ChevronRight,
  ShieldCheck,
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
    badge: "Overview",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          <strong className="text-foreground">KiddieQuick LLP</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data when you visit our e-commerce website, KiddieQuick LLP, and make purchases through our platform.
        </p>
        <p>
          We prioritize transparency and will keep you informed of any updates to this Privacy Policy as we continue to enhance our e-commerce services. By using our website, you agree to the collection and use of information in accordance with this Privacy Policy.
        </p>
      </div>
    ),
  },
  {
    id: "information-we-collect",
    title: "2. Information We Collect",
    shortTitle: "Information We Collect",
    icon: Database,
    badge: "Data Collection",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          We collect various types of information to facilitate and optimize your shopping experience:
        </p>
        <div className="grid gap-3 pt-1">
          <div className="rounded-lg border border-border/80 bg-background/60 p-3.5">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider text-accent">Personal Information</h4>
            <p className="mt-1">
              When you create an account, place an order, or subscribe to our newsletter, we collect your name, email address, shipping address, phone number, payment details (such as credit card information), and other necessary information.
            </p>
          </div>

          <div className="rounded-lg border border-border/80 bg-background/60 p-3.5">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider text-accent">Order Information</h4>
            <p className="mt-1">
              Details related to your purchases, including product information, order history, shipping preferences, and other transaction-related data.
            </p>
          </div>

          <div className="rounded-lg border border-border/80 bg-background/60 p-3.5">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider text-accent">Technical Data</h4>
            <p className="mt-1">
              This includes IP addresses, device type, browser type, time zone settings, and other technology-related information used to access our website.
            </p>
          </div>

          <div className="rounded-lg border border-border/80 bg-background/60 p-3.5">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider text-accent">Usage Data</h4>
            <p className="mt-1">
              Information about how you navigate and interact with our website, such as pages viewed, time spent on the site, and shopping preferences.
            </p>
          </div>

          <div className="rounded-lg border border-border/80 bg-background/60 p-3.5">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider text-accent">Cookies and Tracking Technologies</h4>
            <p className="mt-1">
              We use cookies and similar technologies to remember your preferences, track your shopping cart, and collect analytics data.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "how-we-use-information",
    title: "3. How We Use Your Information",
    shortTitle: "How We Use Information",
    icon: Eye,
    badge: "Usage Purposes",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>We use the information collected for various operational and customer-centric purposes, including:</p>
        <ul className="space-y-2.5">
          <li className="flex items-start gap-2.5">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
            <div>
              <strong className="text-foreground">To Process Transactions:</strong> To process and fulfill your orders, manage shipping, and provide customer support.
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
            <div>
              <strong className="text-foreground">To Improve User Experience:</strong> To enhance our website&rsquo;s functionality, personalize your shopping experience, and make navigation more efficient.
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
            <div>
              <strong className="text-foreground">To Provide Customer Support:</strong> To respond to inquiries, manage returns or exchanges, and address any issues with your orders.
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
            <div>
              <strong className="text-foreground">Marketing and Promotions:</strong> With your consent, we may send promotional offers, updates on new products, and personalized recommendations based on your previous purchases and preferences.
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
            <div>
              <strong className="text-foreground">Fraud Prevention:</strong> To detect and prevent fraud, identity theft, and other illegal activities.
            </div>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "sharing-your-information",
    title: "4. Sharing Your Information",
    shortTitle: "Sharing Information",
    icon: Share2,
    badge: "Third Parties",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>We only share your information with third parties in the following specific situations:</p>
        <div className="grid gap-3 pt-1">
          <div className="rounded-lg border border-border/80 bg-background/60 p-3.5">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider text-accent">Service Providers</h4>
            <p className="mt-1">
              We share your data with third-party vendors who assist us in operating our e-commerce platform, processing payments, fulfilling orders, managing shipping, and conducting marketing activities.
            </p>
          </div>

          <div className="rounded-lg border border-border/80 bg-background/60 p-3.5">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider text-accent">Payment Processing</h4>
            <p className="mt-1">
              Your payment information is shared with secure third-party payment processors, and we do not store your complete credit card information on our servers.
            </p>
          </div>

          <div className="rounded-lg border border-border/80 bg-background/60 p-3.5">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider text-accent">Legal Compliance</h4>
            <p className="mt-1">
              We may disclose your data if required by law, court order, or to enforce our Terms of Service.
            </p>
          </div>

          <div className="rounded-lg border border-border/80 bg-background/60 p-3.5">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider text-accent">Business Transactions</h4>
            <p className="mt-1">
              In the event of a merger, acquisition, or sale of assets, your personal information may be transferred as part of the business transaction.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "data-security",
    title: "5. Data Security",
    shortTitle: "Data Security",
    icon: Lock,
    badge: "Protection",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          We implement industry-standard security measures to protect your personal and payment information from unauthorized access, alteration, or disclosure.
        </p>
        <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 text-xs text-foreground/90">
          <p className="font-medium">
            While we strive to safeguard your data using encryption and rigorous administrative safeguards, please note that no method of transmission over the Internet or electronic storage is 100% secure.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "data-retention",
    title: "6. Data Retention",
    shortTitle: "Data Retention",
    icon: Clock,
    badge: "Retention",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          We retain your information only for as long as necessary to fulfill the purposes for which it was collected or as required by law.
        </p>
        <ul className="space-y-2.5">
          <li className="flex items-start gap-2.5">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
            <div>
              <strong className="text-foreground">Personal Information:</strong> We will retain your personal information for optimization and user experience as long as your account is active or as needed to provide you with services.
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
            <div>
              <strong className="text-foreground">Usage Data:</strong> We may retain usage data for 7 to 21 days to analyze trends and improve our services.
            </div>
          </li>
        </ul>
        <p className="text-xs text-muted-foreground/90">
          When your information is no longer needed, we will securely delete or anonymize it in accordance with applicable data protection laws.
        </p>
      </div>
    ),
  },
  {
    id: "your-rights",
    title: "7. Your Rights",
    shortTitle: "Your Rights",
    icon: UserCheck,
    badge: "User Control",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          Depending on your jurisdiction, you may have the following rights regarding your personal information:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <div className="rounded-lg border border-border bg-background/60 p-3">
            <span className="font-bold text-xs uppercase tracking-wider text-accent">Access</span>
            <p className="mt-1 text-xs">The right to access your personal information stored with us.</p>
          </div>
          <div className="rounded-lg border border-border bg-background/60 p-3">
            <span className="font-bold text-xs uppercase tracking-wider text-accent">Correction</span>
            <p className="mt-1 text-xs">The right to correct inaccurate or incomplete data.</p>
          </div>
          <div className="rounded-lg border border-border bg-background/60 p-3">
            <span className="font-bold text-xs uppercase tracking-wider text-accent">Deletion</span>
            <p className="mt-1 text-xs">The right to request permanent deletion of your data.</p>
          </div>
          <div className="rounded-lg border border-border bg-background/60 p-3">
            <span className="font-bold text-xs uppercase tracking-wider text-accent">Objection</span>
            <p className="mt-1 text-xs">The right to object to the processing of your data for marketing.</p>
          </div>
          <div className="rounded-lg border border-border bg-background/60 p-3 sm:col-span-2">
            <span className="font-bold text-xs uppercase tracking-wider text-accent">Portability</span>
            <p className="mt-1 text-xs">The right to request a transfer of your data to another service provider.</p>
          </div>
        </div>
        <p className="text-xs">
          To exercise any of these rights, please contact us at the details provided in the{" "}
          <a href="#contact-us" className="text-accent underline underline-offset-4 font-medium">
            Contact Us
          </a>{" "}
          section below.
        </p>
      </div>
    ),
  },
  {
    id: "cookies",
    title: "8. Cookies",
    shortTitle: "Cookies",
    icon: Cookie,
    badge: "Preferences",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          We use cookies to enhance your shopping experience by remembering your preferences and tracking your cart.
        </p>
        <p>
          You can manage your cookie preferences through your browser settings, but disabling cookies may affect the functionality of certain features on our website (such as persistent shopping cart and secure session logins).
        </p>
      </div>
    ),
  },
  {
    id: "third-party-links",
    title: "9. Third-Party Links",
    shortTitle: "Third-Party Links",
    icon: ExternalLink,
    badge: "External Sites",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          Our website may contain links to third-party sites (e.g., payment gateways, shipping carriers, social platforms). We are not responsible for the privacy practices or content of these external websites.
        </p>
        <p className="text-xs">
          Please review their privacy policies before sharing any personal information when navigating away from our domain.
        </p>
      </div>
    ),
  },
  {
    id: "childrens-privacy",
    title: "10. Children's Privacy",
    shortTitle: "Children's Privacy",
    icon: Baby,
    badge: "Under 18 Policy",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          Our website is not intended for individuals under the age of 18. We do not knowingly collect personal data from children.
        </p>
        <p>
          If we learn that we have inadvertently collected such data without verified parental consent, we will take immediate steps to delete it promptly from our active databases.
        </p>
      </div>
    ),
  },
  {
    id: "changes-to-policy",
    title: "11. Changes to This Policy",
    shortTitle: "Changes to Policy",
    icon: FileEdit,
    badge: "Revisions",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          We may update this Privacy Policy to reflect changes in our e-commerce practices or legal obligations. Any updates will be posted directly on this page, and we encourage you to review it periodically.
        </p>
        <p className="text-xs">
          The &ldquo;Effective Date&rdquo; at the top of this document indicates when the policy was last officially updated.
        </p>
      </div>
    ),
  },
  {
    id: "contact-us",
    title: "12. Questions About This Privacy Policy?",
    shortTitle: "Contact Us",
    icon: Mail,
    badge: "Support Desk",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          If you have any questions or concerns about our Privacy Policy or data handling practices, please contact us via our official support channels:
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
                href="tel:+918824700161"
                className="text-sm font-semibold text-accent hover:underline"
              >
                +91 (882) 470-0161
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

export function PrivacyContent() {
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
      {/* Policy Meta Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-accent" />
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
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Quick Navigation</p>
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
                <p className="font-semibold text-primary">Need Privacy Assistance?</p>
                <p className="mt-0.5 text-muted-foreground text-[10px]">
                  Our data protection team is available to assist you.
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
              Have specific questions about our data collection or privacy practices?{" "}
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
