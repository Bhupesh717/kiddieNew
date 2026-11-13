import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Gem, Mail, MapPin, Phone, Sparkles } from "lucide-react";
import { PageIntro, SiteFooter, SiteHeader } from "@/components/site-shell";
import heroPortrait from "@/public/hero-ethnic-wear.png";
import kundanImg from "@/public/products/kundan-haar.png";
import mustardImg from "@/public/products/mustard-poshak.png";
import roseSilkImg from "@/public/products/rose-silk.png";
import tealImg from "@/public/products/teal-poshak.png";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Discover the house of Majisavesh — heirloom Rajasthani poshaks, handwoven textiles, and artisanal occasion dressing from Jaipur.",
};

const ATELIER_METRICS = [
  {
    value: "35+",
    label: "Karigar families",
    detail: "Partner ateliers across Jaipur, Bikaner & Jodhpur",
  },
  {
    value: "40–120 hrs",
    label: "Patient handwork",
    detail: "Dedicated adda & gota finishing per ceremonial ensemble",
  },
  {
    value: "100%",
    label: "Curated weaves",
    detail: "Pure silk, semi-pure georgette & breathable cotton silk",
  },
  {
    value: "Jaipur",
    label: "Atelier studio",
    detail: "Bespoke fittings & styling in C-Scheme since day one",
  },
] as const;

const CRAFT_PILLARS = [
  {
    number: "01",
    title: "Gota Patti & Antique Zari",
    image: mustardImg,
    alt: "Hand-embroidered mustard zari suit in sandstone courtyard",
    copy: "Fine metallic kasab, danka, and traditional gota appliqués are stitched patiently on wooden adda frames so embroidery catches candlelight gently rather than overwhelming the drape.",
  },
  {
    number: "02",
    title: "Pure & Semi-Pure Looms",
    image: roseSilkImg,
    alt: "Rose silk textile draped with woven gold zari border",
    copy: "From fluid Banarasi weaves to sun-dyed pure silk and crisp cotton-silk blends, each fabric is selected for breathability across daytime rituals and twilight pheras.",
  },
  {
    number: "03",
    title: "Balanced Royal Silhouette",
    image: tealImg,
    alt: "Teal velvet kurti set with gold borders under carved palace arch",
    copy: "Every kalidar ghagra, tailored kurti-kanchali, and weighted odhni is proportioned to move naturally — preserving regal poise without tiring weight.",
  },
] as const;

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Textile & Palette Selection",
    copy: "We source raw silks, velvets, and gossamer odhnis, custom-dyeing shades inspired by desert sandstone, marigold, sindoor, and emerald.",
  },
  {
    step: "02",
    title: "Master Karigar Handwork",
    copy: "Artisan households trace archival motifs onto stretched fabric before working zari, resham, and gota details stitch by stitch.",
  },
  {
    step: "03",
    title: "Tailoring & Proportion",
    copy: "Pattern-makers balance pleats, kiran trims, and bodice ease so each piece flatters across generations.",
  },
  {
    step: "04",
    title: "Heirloom Care & Dispatch",
    copy: "Finished pieces undergo steam inspection and arrive wrapped in breathable cotton care folds ready for celebration.",
  },
] as const;

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#fbf8f3] text-[#33251f]">
      <SiteHeader />

      <PageIntro
        eyebrow="The house of Majisavesh"
        title="A story worth wearing"
        copy="Modern Rajputi heirlooms shaped by Jaipur karigars, patient handwork, and centuries-old ceremonial grace."
      />

      <section
        aria-label="Atelier highlights"
        className="border-b border-[#e8ded2] bg-[#fffdf9]"
      >
        <div className="container mx-auto grid grid-cols-2 divide-x divide-y divide-[#eee5da] px-0 sm:px-6 lg:grid-cols-4 lg:divide-y-0">
          {ATELIER_METRICS.map((item) => (
            <div key={item.label} className="px-5 py-7 sm:px-6 sm:py-9">
              <p className="font-serif text-3xl text-[#39231e] sm:text-4xl">
                {item.value}
              </p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a44436]">
                {item.label}
              </p>
              <p className="mt-1.5 text-xs leading-5 text-[#77675d]">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 sm:px-6 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div className="relative pb-8 sm:pr-8">
            <div className="relative aspect-[4/5] overflow-hidden border border-[#e8ded2] bg-[#e6d7c4]">
              <Image
                src={heroPortrait}
                alt="Traditional maroon Rajputi poshak photographed beneath carved palace arches"
                fill
                placeholder="blur"
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover object-center"
              />
            </div>

            <div className="absolute bottom-0 right-0 hidden w-44 border-4 border-[#fbf8f3] bg-[#fffdf9] shadow-lg sm:block md:w-52">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#eee4d8]">
                <Image
                  src={kundanImg}
                  alt="Handcrafted Kundan jewellery detail from Jaipur"
                  fill
                  placeholder="blur"
                  sizes="208px"
                  className="object-cover"
                />
              </div>
              <p className="px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8d3428]">
                C-Scheme Atelier · Jaipur
              </p>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#a44436]">
              <Sparkles size={13} /> Our heritage & ethos
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-[1.12] text-[#39231e] sm:text-5xl">
              Rooted in Jaipur. Made for every milestone.
            </h2>
            <p className="mt-6 text-sm leading-8 text-[#63544b] sm:text-base sm:leading-8">
              Majisavesh began with a quiet conviction: authentic Rajasthani
              craft deserves silhouettes that feel effortless in modern life.
              Too often, ceremonial attire forced a choice between true artisan
              detail and wearable comfort.
            </p>
            <p className="mt-4 text-sm leading-8 text-[#63544b]">
              Working side by side with multi-generational weavers, gota patti
              embroiderers, and master cutters across Rajasthan, we curate pure
              and semi-pure poshaks, kurti sets, regular suits, and heirloom
              accessories built to be treasured — not tucked away after a single
              evening.
            </p>

            <div className="mt-8 grid gap-4 border-t border-[#e8ded2] pt-6 sm:grid-cols-2">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#39231e]">
                  <Gem size={14} className="text-[#a44436]" /> Honest craft
                </p>
                <p className="mt-1.5 text-xs leading-6 text-[#77675d]">
                  Every yard of fabric and border trim is inspected at our
                  Jaipur studio prior to finishing.
                </p>
              </div>
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#39231e]">
                  <Clock size={14} className="text-[#a44436]" /> Slow batches
                </p>
                <p className="mt-1.5 text-xs leading-6 text-[#77675d]">
                  Small-run releases honour artisan pace and reduce needless
                  overproduction.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/collection"
                className="inline-flex items-center gap-2 bg-[#39231e] px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#52342c]"
              >
                Explore collection <ArrowRight size={14} />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 border border-[#bca999] bg-white px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#39231e] transition hover:border-[#39231e]"
              >
                Read the journal
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e8ded2] bg-[#f3ece2] py-14 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#a44436]">
              The craft pillars
            </p>
            <h2 className="mt-3 font-serif text-3xl text-[#39231e] sm:text-5xl">
              What makes a Majisavesh piece
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#6d5d53]">
              Three disciplines guide every weave, stitch, and border finish
              leaving our workshop.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {CRAFT_PILLARS.map((pillar) => (
              <article
                key={pillar.number}
                className="group flex flex-col border border-[#e3d6c6] bg-[#fffdf9]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#eee4d8]">
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
                  <span className="font-serif text-lg text-[#a44436]">
                    {pillar.number}
                  </span>
                  <h3 className="mt-1 font-serif text-2xl text-[#39231e]">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-xs leading-6 text-[#6f5f55]">
                    {pillar.copy}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 sm:px-6 lg:py-20">
        <div className="flex flex-col justify-between gap-4 border-b border-[#e8ded2] pb-6 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#a44436]">
              From loom to celebration
            </p>
            <h2 className="mt-2 font-serif text-3xl text-[#39231e] sm:text-4xl">
              How every heirloom is made
            </h2>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#39231e] underline underline-offset-4 transition hover:text-[#a44436]"
          >
            Custom enquiries <ArrowRight size={13} />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((item) => (
            <div
              key={item.step}
              className="flex flex-col justify-between border border-[#e8ded2] bg-white p-6"
            >
              <div>
                <span className="inline-block border border-[#e8ded2] bg-[#faf7f3] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#a44436]">
                  STEP {item.step}
                </span>
                <h3 className="mt-4 font-serif text-xl text-[#39231e]">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-xs leading-6 text-[#77675d]">
                  {item.copy}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#39231e] px-5 py-16 text-center text-[#f8ede0] sm:py-20">
        <div className="mx-auto max-w-3xl">
          <div
            aria-hidden="true"
            className="mx-auto mb-6 h-px w-16 bg-[#d6af7a]"
          />
          <blockquote className="font-serif text-3xl leading-snug sm:text-4xl md:text-5xl">
            “Clothing is not just what we wear. It is the lineage, grace, and
            memory we choose to carry forward.”
          </blockquote>
          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#d6af7a]">
            House of Majisavesh · Jaipur
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 sm:px-6 lg:py-16">
        <div className="grid gap-8 border border-[#e8ded2] bg-[#fffdf9] p-7 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a44436]">
              Visit our studio
            </p>
            <h2 className="mt-2 font-serif text-3xl text-[#39231e] sm:text-4xl">
              Meet our styling team in Jaipur
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[#77675d]">
              Whether selecting a bridal poshak, matching semi-pure festive
              weaves, or requesting fabric length guidance, our C-Scheme studio
              team is delighted to assist in person or remotely.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-[#8d3428] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#70281f]"
              >
                Book a consultation <ArrowRight size={13} />
              </Link>
              <Link
                href="/collection"
                className="inline-flex items-center border border-[#d8cabc] bg-white px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#39231e] transition hover:border-[#39231e]"
              >
                Shop collection
              </Link>
            </div>
          </div>

          <div className="space-y-3 border-t border-[#e8ded2] pt-6 text-xs text-[#5d4f47] lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="flex items-start gap-2.5">
              <MapPin size={15} className="mt-0.5 shrink-0 text-[#a44436]" />
              <span>
                <strong className="block text-[#39231e]">Atelier Address</strong>
                C-Scheme, Jaipur, Rajasthan 302001
              </span>
            </p>
            <p className="flex items-start gap-2.5">
              <Clock size={15} className="mt-0.5 shrink-0 text-[#a44436]" />
              <span>
                <strong className="block text-[#39231e]">Studio Hours</strong>
                Monday – Saturday · 10:30 AM – 7:30 PM IST
              </span>
            </p>
            <p className="flex items-start gap-2.5">
              <Phone size={15} className="mt-0.5 shrink-0 text-[#a44436]" />
              <span>
                <strong className="block text-[#39231e]">Concierge</strong>
                +91 141 400 2424
              </span>
            </p>
            <p className="flex items-start gap-2.5">
              <Mail size={15} className="mt-0.5 shrink-0 text-[#a44436]" />
              <span>
                <strong className="block text-[#39231e]">Email</strong>
                hello@majisavesh.com
              </span>
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
