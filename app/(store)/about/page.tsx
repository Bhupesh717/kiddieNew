import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Gem,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  ShieldCheck,
  Smile,
  Sparkles,
  Truck,
} from "lucide-react";
import { PageIntro, SiteFooter, SiteHeader } from "@/components/site-shell";
import heroPortrait from "@/public/about/about-hero.jpg";
import kundanImg from "@/public/products/kundan-haar.png";
import pillarKidsImg from "@/public/about/pillar-kids.jpg";
import pillarEthnicImg from "@/public/about/pillar-ethnic.jpg";
import pillarWesternImg from "@/public/about/pillar-western.jpg";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Discover KiddieQuick — smart kids wear, contemporary men & women fashion, elegant Indian ethnic kurtas, festive suits, and everyday western apparel.",
};

const ATELIER_METRICS = [
  {
    value: "50k+",
    label: "Happy families",
    detail: "Dressed across India in premium comfort and vibrant styles",
  },
  {
    value: "100%",
    label: "Quality fabrics",
    detail: "Breathable combed cottons, pure linen & kid-friendly textiles",
  },
  {
    value: "4.9/5",
    label: "Customer rating",
    detail: "Loved for fit, durability, and contemporary family silhouettes",
  },
  {
    value: "Pan-India",
    label: "Express dispatch",
    detail: "Doorstep delivery across 20,000+ pin codes with easy returns",
  },
] as const;

const CRAFT_PILLARS = [
  {
    number: "01",
    title: "Smart Kids & Toddlers",
    image: pillarKidsImg,
    alt: "Kids comfortable everyday and festive outfits",
    copy: "Playful frocks, comfy baba suits, organic rompers, and graphic tees engineered for all-day smiles, soft touch, and easy movement.",
  },
  {
    number: "02",
    title: "Contemporary Indian Wear",
    image: pillarEthnicImg,
    alt: "Refined Indian ethnic suit and kurta set",
    copy: "From flowing ethnic suit sets and festive kurtas to elegant co-ords, each ensemble balances ceremonial grace with lightweight, all-day ease.",
  },
  {
    number: "03",
    title: "Elevated Western & Daily Wear",
    image: pillarWesternImg,
    alt: "Smart western shirts, polos and dresses",
    copy: "Breathable linen shirts, premium pique polos, relaxed dresses, and versatile everyday essentials designed for modern, effortless lifestyles.",
  },
] as const;

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Fabric Selection & Safety",
    copy: "We curate skin-friendly combed cottons, breathable linens, and lightweight silks tested for maximum softness and durability.",
  },
  {
    step: "02",
    title: "Ergonomic Tailoring & Cut",
    copy: "Master pattern-makers balance ease, flexible comfort for kids, and sharp flattering silhouettes for men and women.",
  },
  {
    step: "03",
    title: "Vibrant Dyes & Reinforced Stitch",
    copy: "Skin-safe and colorfast dyes meet clean, double-needle reinforced stitching built to withstand active days and festive celebrations.",
  },
  {
    step: "04",
    title: "Quality Care & Express Dispatch",
    copy: "Every piece undergoes multi-point inspection and arrives neatly packaged ready to wear for your next occasion.",
  },
] as const;

const WHY_CHOOSE_US = [
  {
    icon: Smile,
    title: "Kid-Safe & Gentle Fabrics",
    description:
      "Crafted with 100% combed cottons, breathable pure linens, and certified non-toxic dyes gentle on delicate, sensitive skin.",
  },
  {
    icon: Sparkles,
    title: "All-Day Play Comfort",
    description:
      "Tagless labels, itch-free seams, and ergonomic flexible waistbands engineered for active movement, smiles, and ease.",
  },
  {
    icon: Gem,
    title: "Curated Family Wardrobe",
    description:
      "One destination for everyone — playful toddler outfits, sharp men's shirts & polos, stylish women's dresses, and festive Indian suits.",
  },
  {
    icon: ShieldCheck,
    title: "Tested Durability",
    description:
      "Double-needle reinforced stitching and colorfast weaves built to withstand countless playground adventures and wash cycles.",
  },
  {
    icon: Truck,
    title: "Pan-India Express Delivery",
    description:
      "Fast, reliable dispatch across 20,000+ pin codes in India with real-time tracking from our warehouse to your doorstep.",
  },
  {
    icon: RotateCcw,
    title: "Easy 7-Day Returns & Exchanges",
    description:
      "Hassle-free size exchanges and easy 7-day returns supported by friendly customer concierge via WhatsApp and call.",
  },
] as const;

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <PageIntro
        eyebrow="The house of KiddieQuick"
        title="Style made simple for the whole family"
        copy="From playful kids wear to refined Indian ethnic suits, kurtas, and sharp western essentials — crafted with comfort, joy, and everyday elegance."
      />

      <section
        aria-label="Atelier highlights"
        className="border-b border-border bg-popover"
      >
        <div className="container mx-auto grid grid-cols-2 divide-x divide-y divide-border px-0 sm:px-6 lg:grid-cols-4 lg:divide-y-0">
          {ATELIER_METRICS.map((item) => (
            <div key={item.label} className="px-5 py-7 sm:px-6 sm:py-9">
              <p className="font-serif text-3xl text-primary sm:text-4xl">
                {item.value}
              </p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                {item.label}
              </p>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 sm:px-6 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div className="relative pb-8 sm:pr-8">
            <div className="relative aspect-[4/5] overflow-hidden border border-border bg-secondary">
              <Image
                src={heroPortrait}
                alt="Contemporary family ethnic and western fashion"
                fill
                placeholder="blur"
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover object-center"
              />
            </div>

            <div className="absolute bottom-0 right-0 hidden w-44 border-4 border-background bg-popover shadow-lg sm:block md:w-52">
              <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                <Image
                  src={kundanImg}
                  alt="Curated handcrafted accessory details"
                  fill
                  placeholder="blur"
                  sizes="208px"
                  className="object-cover"
                />
              </div>
              <p className="px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-accent">
                KiddieQuick · Fashion Studio
              </p>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-accent">
              <Sparkles size={13} /> Our purpose & ethos
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-[1.12] text-primary sm:text-5xl">
              Thoughtful fashion. Made for every milestone.
            </h2>
            <p className="mt-6 text-sm leading-8 text-muted-foreground sm:text-base sm:leading-8">
              KiddieQuick began with a clear purpose: high quality, beautiful
              fashion for kids, men, and women shouldn&apos;t be complicated or
              overpriced. Too often, festive and daily clothing forces a
              compromise between comfort, durability, and contemporary style.
            </p>
            <p className="mt-4 text-sm leading-8 text-muted-foreground">
              Working side by side with experienced fabric mills, skilled
              tailoring masters, and ethical manufacturing partners, we curate
              smart kids wear, Indian ethnic suits, festive kurtas, and sharp
              western dressing built to be treasured and worn with joy.
            </p>

            <div className="mt-8 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  <Gem size={14} className="text-accent" /> Honest fabrics
                </p>
                <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                  Every batch of fabric, button, and seam is inspected for
                  durability and comfort prior to finishing.
                </p>
              </div>
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  <Clock size={14} className="text-accent" /> Conscious batches
                </p>
                <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                  Carefully proportioned releases ensure exceptional fit, zero
                  needless waste, and uncompromised quality.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/collection"
                className="inline-flex items-center gap-2 bg-primary px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-primary/90"
              >
                Explore collection <ArrowRight size={14} />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 border border-input bg-white px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary transition hover:border-primary"
              >
                Read the journal
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-secondary py-14 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-accent">
              The craft pillars
            </p>
            <h2 className="mt-3 font-serif text-3xl text-primary sm:text-5xl">
              What makes a KiddieQuick piece
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Three disciplines guide every weave, stitch, and finish leaving
              our studio.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {CRAFT_PILLARS.map((pillar) => (
              <article
                key={pillar.number}
                className="group flex flex-col border border-input bg-popover"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                  <Image
                    src={pillar.image}
                    alt={pillar.alt}
                    fill
                    placeholder="blur"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-[center_22%] transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="font-serif text-lg text-accent">
                    {pillar.number}
                  </span>
                  <h3 className="mt-1 font-serif text-2xl text-primary">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-xs leading-6 text-muted-foreground">
                    {pillar.copy}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 sm:px-6 lg:py-20">
        <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-accent">
              Thoughtful design
            </p>
            <h2 className="mt-2 font-serif text-3xl text-primary sm:text-4xl">
              How every piece is made
            </h2>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary underline underline-offset-4 transition hover:text-accent"
          >
            Custom enquiries <ArrowRight size={13} />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((item) => (
            <div
              key={item.step}
              className="flex flex-col justify-between border border-border bg-white p-6"
            >
              <div>
                <span className="inline-block border border-border bg-background px-2.5 py-1 font-mono text-[11px] font-semibold text-accent">
                  STEP {item.step}
                </span>
                <h3 className="mt-4 font-serif text-xl text-primary">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-xs leading-6 text-muted-foreground">
                  {item.copy}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="border-t border-border bg-stone-50/70 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-accent">
              The KiddieQuick Difference
            </p>
            <h2 className="mt-3 font-serif text-3xl text-primary sm:text-5xl">
              Why Choose KiddieQuick
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Designed with care, tailored for comfort, and loved by modern
              families across India. Here is why parents and fashion lovers trust
              us for their daily and festive wear.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_CHOOSE_US.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group relative flex flex-col justify-between border border-border bg-white p-7 transition duration-300 hover:border-accent hover:shadow-sm"
                >
                  <div>
                    <div className="flex size-11 items-center justify-center rounded-lg bg-accent/10 text-accent transition duration-300 group-hover:bg-accent group-hover:text-white">
                      <Icon size={22} />
                    </div>
                    <h3 className="mt-5 font-serif text-xl font-medium text-primary">
                      {item.title}
                    </h3>
                    <p className="mt-2.5 text-xs leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-accent opacity-0 transition group-hover:opacity-100">
                    <span>Quality assured</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-primary px-5 py-16 text-center text-primary-foreground sm:py-20">
        <div className="mx-auto max-w-3xl">
          <div
            aria-hidden="true"
            className="mx-auto mb-6 h-px w-16 bg-amber-300"
          />
          <blockquote className="font-serif text-3xl leading-snug sm:text-4xl md:text-5xl">
            “Clothing is at its best when it brings comfort, confidence, and joy
            to everyday moments and celebrations alike.”
          </blockquote>
          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-200/90">
            House of KiddieQuick · Smart Living &amp; Dressing
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 sm:px-6 lg:py-16">
        <div className="grid gap-8 border border-border bg-popover p-7 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
              Connect with us
            </p>
            <h2 className="mt-2 font-serif text-3xl text-primary sm:text-4xl">
              Meet our styling &amp; support team
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
              Whether selecting celebratory kurtas, sizing kids outfits, or
              requesting fabric guidance, our concierge team is delighted to
              assist online or over phone.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-accent px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-accent/90"
              >
                Contact support <ArrowRight size={13} />
              </Link>
              <Link
                href="/collection"
                className="inline-flex items-center border border-input bg-white px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary transition hover:border-primary"
              >
                Shop collection
              </Link>
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-6 text-xs text-muted-foreground lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="flex items-start gap-2.5">
              <MapPin size={15} className="mt-0.5 shrink-0 text-accent" />
              <span>
                <strong className="block text-primary">
                  Headquarters &amp; Hub
                </strong>
                Jaipur, Rajasthan 302001, India
              </span>
            </p>
            <p className="flex items-start gap-2.5">
              <Clock size={15} className="mt-0.5 shrink-0 text-accent" />
              <span>
                <strong className="block text-primary">Support Hours</strong>
                Monday – Saturday · 9:30 AM – 7:30 PM IST
              </span>
            </p>
            <p className="flex items-start gap-2.5">
              <Phone size={15} className="mt-0.5 shrink-0 text-accent" />
              <span>
                <strong className="block text-primary">
                  Concierge &amp; WhatsApp
                </strong>
                +91 (882) 470-0161
              </span>
            </p>
            <p className="flex items-start gap-2.5">
              <Mail size={15} className="mt-0.5 shrink-0 text-accent" />
              <span>
                <strong className="block text-primary">Email</strong>
                hello@kiddiequick.in
              </span>
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
