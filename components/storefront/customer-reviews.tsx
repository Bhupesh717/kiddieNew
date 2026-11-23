"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  Quote,
  Sparkles,
  Star,
} from "lucide-react";
import reviewsImg from "@/public/home/reviews-family.png";
import fallbackImg from "@/public/about/about-hero.jpg";

export type CustomerReview = {
  id: string;
  name: string;
  location: string;
  title: string;
  quote: string;
  rating: number;
  date: string;
  purchasedItem: string;
  category: "Kids" | "Men" | "Women" | "Newborn";
};

const REVIEWS: CustomerReview[] = [
  {
    id: "rev-1",
    name: "Pooja & Kabir Singhania",
    location: "Mumbai, Maharashtra",
    title: "The fabric softness completely blew me away",
    quote:
      "Usually kids clothes shrink or fade after the first wash, but KiddieQuick's combed cotton quality is exceptional. My 3-year-old wore the Baba Suit set through an entire birthday party without any scratching or fuss. Highly recommend to all parents!",
    rating: 5,
    date: "2 days ago",
    purchasedItem: "Little Champ Baba Suit & Shorts Set",
    category: "Kids",
  },
  {
    id: "rev-2",
    name: "Rohit Malhotra",
    location: "Bengaluru, Karnataka",
    title: "Unmatched comfort in warm & humid weather",
    quote:
      "Finding a linen shirt that doesn't feel stiff or scratchy is rare at this price point. The cut is clean, breathable, and looks effortlessly premium for both casual Fridays and Sunday family gatherings.",
    rating: 5,
    date: "1 week ago",
    purchasedItem: "Men Premium Breathable Linen Shirt",
    category: "Men",
  },
  {
    id: "rev-3",
    name: "Dr. Shalini Verma",
    location: "New Delhi",
    title: "My daughter twirled all evening without any itchy seams",
    quote:
      "The soft 100% cotton inner lining is pure genius. Usually festive party frocks irritate children's skin, but this dress is lightweight, stunning in photos, and so comfortable that she refused to take it off at bedtime!",
    rating: 5,
    date: "2 weeks ago",
    purchasedItem: "Kids Floral Twirl Party Frock",
    category: "Kids",
  },
  {
    id: "rev-4",
    name: "Meera Rathi",
    location: "Jaipur, Rajasthan",
    title: "Graceful festive drape with modern all-day ease",
    quote:
      "Ordered this kurti set for our family festivities. The subtle gold detailing on the neckline falls so gracefully, and the fabric moves with ease. The sizing was spot-on and it arrived in just 2 days in beautiful care packaging.",
    rating: 5,
    date: "3 weeks ago",
    purchasedItem: "Women Handcrafted Floral Kurti & Palazzo Set",
    category: "Women",
  },
  {
    id: "rev-5",
    name: "Ananya & Dev Kulkarni",
    location: "Pune, Maharashtra",
    title: "The safest, gentlest clothing for our newborn",
    quote:
      "As first-time parents, we were anxious about chemical dyes and synthetic fabrics. These organic rompers are buttery soft, stretch naturally, and have smooth nickel-free snaps that make midnight diaper changes so easy.",
    rating: 5,
    date: "1 month ago",
    purchasedItem: "New Born Organic Cotton Romper Set",
    category: "Newborn",
  },
];

const AUTO_PLAY_INTERVAL = 4500; // 4.5 seconds

export function CustomerReviews() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageSrc, setImageSrc] = useState(reviewsImg);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const count = REVIEWS.length;
  const current = REVIEWS[activeIndex];

  // Helper to change slide with fade animation
  const goToSlide = (index: number) => {
    setAnimating(true);
    setTimeout(() => {
      setActiveIndex(index);
      setAnimating(false);
    }, 150);
  };

  const nextReview = () => {
    goToSlide((activeIndex + 1) % count);
  };

  const prevReview = () => {
    goToSlide((activeIndex - 1 + count) % count);
  };

  // Continuous reliable auto-play timer that resets whenever activeIndex changes
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      goToSlide((activeIndex + 1) % count);
    }, AUTO_PLAY_INTERVAL);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeIndex, count]);

  return (
    <section
      aria-label="Customer Reviews & Testimonials"
      className="border-t border-border bg-stone-50/60 py-16 sm:py-24"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Fixed Lifestyle Image (does not change on slide) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              {/* Outer decorative card frame */}
              <div
                aria-hidden="true"
                className="absolute -bottom-3 -left-3 size-full rounded-2xl border border-accent/25 bg-accent/5 sm:-bottom-4 sm:-left-4"
              />

              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border bg-secondary shadow-md">
                <Image
                  src={imageSrc}
                  alt="Happy family wearing KiddieQuick"
                  fill
                  placeholder="blur"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  onError={() => setImageSrc(fallbackImg)}
                  className="object-cover object-center"
                />

                {/* Top Floating Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary shadow-sm backdrop-blur-md">
                    <Heart size={12} className="fill-accent text-accent" />
                    Loved by 15,000+ Patrons
                  </span>
                </div>

                {/* Bottom Trust Glassmorphic Card */}
                <div className="absolute inset-x-4 bottom-4 z-10 rounded-xl border border-white/40 bg-white/90 p-4 shadow-lg backdrop-blur-md sm:p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className="fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                      <p className="mt-1 text-xs font-semibold text-primary">
                        4.9 / 5.0 Rating
                      </p>
                    </div>
                    <span className="rounded bg-accent/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-accent">
                      98% Recommend
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                    Based on verified parent reviews for kids playwear, festive
                    kurtas &amp; daily family essentials.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Customer Reviews Interactive Slider */}
          <div className="flex flex-col justify-center lg:col-span-7">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
                  <Sparkles size={12} /> Real Stories
                </span>
                <h2 className="mt-2 font-serif text-3xl sm:text-4xl lg:text-5xl text-primary leading-tight">
                  What Families Say
                </h2>
              </div>

              {/* Slider Controls (Top on Desktop) */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevReview}
                  aria-label="Previous review"
                  className="flex size-10 items-center justify-center rounded-full border border-border bg-white text-primary transition duration-200 hover:border-accent hover:bg-accent hover:text-white active:scale-95 shadow-sm"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={nextReview}
                  aria-label="Next review"
                  className="flex size-10 items-center justify-center rounded-full border border-border bg-white text-primary transition duration-200 hover:border-accent hover:bg-accent hover:text-white active:scale-95 shadow-sm"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Active Review Card with Live Animated Progress Bar */}
            <div className="relative mt-8 overflow-hidden rounded-2xl border border-border bg-white p-7 sm:p-10 shadow-sm">
              {/* Auto-Slide Progress Bar */}
              <div className="absolute top-0 inset-x-0 h-1 bg-stone-100 overflow-hidden">
                <div
                  key={`progress-${activeIndex}`}
                  className="h-full bg-accent"
                  style={{
                    animation: `slideProgress ${AUTO_PLAY_INTERVAL}ms linear forwards`,
                  }}
                />
              </div>

              <Quote
                size={48}
                className="absolute top-6 right-6 text-accent/10 pointer-events-none"
              />

              <div
                className={`transition-all duration-300 ${
                  animating
                    ? "opacity-0 translate-y-2"
                    : "opacity-100 translate-y-0"
                }`}
              >
                {/* Rating Stars & Category Tag */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {[...Array(current.rating)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className="fill-amber-400 text-amber-400"
                      />
                    ))}
                    <span className="ml-1 text-xs font-semibold text-primary">
                      5.0
                    </span>
                  </div>

                  <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
                    {current.category} Collection
                  </span>
                </div>

                {/* Review Title */}
                <h3 className="mt-4 font-serif text-2xl sm:text-3xl font-medium text-primary leading-snug">
                  &ldquo;{current.title}&rdquo;
                </h3>

                {/* Review Quote */}
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground min-h-[72px]">
                  {current.quote}
                </p>

                {/* Product Purchased Tag */}
                <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border/80 bg-stone-50/80 px-3.5 py-1.5 text-xs text-muted-foreground">
                  <span className="font-semibold text-primary">Purchased:</span>
                  <span>{current.purchasedItem}</span>
                </div>

                {/* Author Info Footer */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-serif text-lg font-semibold text-primary">
                        {current.name}
                      </p>
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        <CheckCircle2 size={11} /> Verified Buyer
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {current.location} · {current.date}
                    </p>
                  </div>

                  {/* Slide Counter */}
                  <div className="font-mono text-xs text-muted-foreground">
                    <span className="font-semibold text-primary">
                      0{activeIndex + 1}
                    </span>{" "}
                    / 0{count}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls & Dots */}
            <div className="mt-6 flex items-center justify-between">
              {/* Dot Indicators with Auto-Advance Progress */}
              <div className="flex items-center gap-2">
                {REVIEWS.map((r, idx) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => goToSlide(idx)}
                    aria-label={`Go to review ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === activeIndex
                        ? "w-8 bg-accent"
                        : "w-2 bg-border hover:bg-accent/40"
                    }`}
                  />
                ))}
              </div>

              {/* Mobile Arrows */}
              <div className="flex items-center gap-2 sm:hidden">
                <button
                  type="button"
                  onClick={prevReview}
                  aria-label="Previous review"
                  className="flex size-9 items-center justify-center rounded-full border border-border bg-white text-primary"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={nextReview}
                  aria-label="Next review"
                  className="flex size-9 items-center justify-center rounded-full border border-border bg-white text-primary"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Keyframes for Progress Bar Animation */}
      <style jsx>{`
        @keyframes slideProgress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
