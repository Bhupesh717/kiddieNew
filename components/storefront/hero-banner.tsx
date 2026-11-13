"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BlogCoverImage } from "@/components/storefront/blog-cover-image";
import type { StoreBanner } from "@/src/lib/store/banners";
import heroBanner from "@/public/Majisavesh_Banner.png";

const DEFAULT_BANNER_ALT =
  "Majisavesh — The Royal Attire of Rajasthan. Authentic Rajasthani Dresses for Every Occasion";

function BannerImage({
  banner,
  preload,
}: {
  banner: StoreBanner;
  preload: boolean;
}) {
  if (banner.image === "/Majisavesh_Banner.png") {
    return (
      <Image
        src={heroBanner}
        alt={DEFAULT_BANNER_ALT}
        fill
        preload={preload}
        placeholder="blur"
        sizes="(max-width: 1672px) 100vw, 1672px"
        className="object-cover"
      />
    );
  }

  return (
    <BlogCoverImage
      src={banner.image}
      alt={DEFAULT_BANNER_ALT}
      preload={preload}
      sizes="(max-width: 1672px) 100vw, 1672px"
      className="object-cover"
    />
  );
}

export function HeroBanner({ banners }: { banners: StoreBanner[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = banners.length;
  const safeIndex = count > 0 ? activeIndex % count : 0;

  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [count, paused]);

  if (count === 0) return null;

  const current = banners[safeIndex];

  if (count === 1) {
    return (
      <section
        aria-label="Majisavesh featured banner"
        className="w-full bg-[#fbf8f3]"
      >
        <h1 className="sr-only">
          Majisavesh — The Royal Attire of Rajasthan | Authentic Rajasthani
          Dresses for Every Occasion
        </h1>
        <Link
          href="/collection"
          className="relative mx-auto block aspect-video w-full max-w-[1672px] overflow-hidden bg-[#f3ece2]"
        >
          <BannerImage banner={current} preload />
        </Link>
      </section>
    );
  }

  return (
    <section
      aria-label="Majisavesh featured banners"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative w-full bg-[#fbf8f3]"
    >
      <h1 className="sr-only">
        Majisavesh — The Royal Attire of Rajasthan | Authentic Rajasthani
        Dresses for Every Occasion
      </h1>

      <div className="relative mx-auto aspect-video w-full max-w-[1672px] overflow-hidden bg-[#f3ece2]">
        <Link href="/collection" className="relative block size-full">
          <BannerImage banner={current} preload={safeIndex === 0} />
        </Link>

        <button
          type="button"
          onClick={() => setActiveIndex((prev) => (prev - 1 + count) % count)}
          aria-label="Previous banner"
          className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#39231e]/75 text-white transition hover:bg-[#39231e] sm:left-5 sm:size-10"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          type="button"
          onClick={() => setActiveIndex((prev) => (prev + 1) % count)}
          aria-label="Next banner"
          className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#39231e]/75 text-white transition hover:bg-[#39231e] sm:right-5 sm:size-10"
        >
          <ChevronRight size={18} />
        </button>

        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2 sm:bottom-5">
          {banners.map((banner, idx) => (
            <button
              key={banner.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Show banner ${idx + 1}`}
              aria-current={idx === safeIndex ? "true" : undefined}
              className={`h-2 rounded-full transition-all ${
                idx === safeIndex
                  ? "w-7 bg-[#fffdf9]"
                  : "w-2 bg-[#fffdf9]/55 hover:bg-[#fffdf9]/85"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
