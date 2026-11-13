"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { StoreCategory } from "@/src/lib/store/catalog";

type SliderState = {
  canPrev: boolean;
  canNext: boolean;
  thumbWidthPct: number;
  thumbOffsetPct: number;
};

const INITIAL_SLIDER_STATE: SliderState = {
  canPrev: false,
  canNext: true,
  thumbWidthPct: 50,
  thumbOffsetPct: 0,
};

const SLIDE_SIZE_CLASSES =
  "w-[46%] flex-none snap-start aspect-[4/5] sm:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)]";

export function CategorySlider({
  categories,
}: {
  categories: StoreCategory[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [sliderState, setSliderState] =
    useState<SliderState>(INITIAL_SLIDER_STATE);

  const syncSliderState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;

    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    const visibleRatio =
      el.scrollWidth > 0 ? Math.min(1, el.clientWidth / el.scrollWidth) : 1;
    const progress =
      maxScroll > 0
        ? Math.min(1, Math.max(0, el.scrollLeft / maxScroll))
        : 0;
    const thumbWidthPct = Math.max(15, visibleRatio * 100);

    setSliderState({
      canPrev: el.scrollLeft > 4,
      canNext: el.scrollLeft < maxScroll - 4,
      thumbWidthPct,
      thumbOffsetPct: progress * (100 - thumbWidthPct),
    });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    syncSliderState();

    const onScroll = () => syncSliderState();
    el.addEventListener("scroll", onScroll, { passive: true });

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => syncSliderState())
        : null;
    observer?.observe(el);
    window.addEventListener("resize", syncSliderState);

    return () => {
      el.removeEventListener("scroll", onScroll);
      observer?.disconnect();
      window.removeEventListener("resize", syncSliderState);
    };
  }, [syncSliderState, categories.length]);

  function scrollByDirection(direction: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;

    const children = Array.from(el.children) as HTMLElement[];
    if (children.length === 0) return;

    const viewportLeft = el.scrollLeft;
    const viewportRight = viewportLeft + el.clientWidth;

    if (direction === 1) {
      const nextChild = children.find(
        (child) => child.offsetLeft + child.offsetWidth > viewportRight + 4,
      );
      el.scrollTo({
        left: nextChild ? nextChild.offsetLeft : el.scrollWidth,
        behavior: "smooth",
      });
      return;
    }

    const targetEstimate = Math.max(0, viewportLeft - el.clientWidth);
    const closestPrev = children.reduce((best, child) => {
      if (child.offsetLeft >= viewportLeft - 4) return best;
      return Math.abs(child.offsetLeft - targetEstimate) <
        Math.abs(best.offsetLeft - targetEstimate)
        ? child
        : best;
    }, children[0]);

    el.scrollTo({ left: closestPrev.offsetLeft, behavior: "smooth" });
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Shop by category"
      className="border-y border-[#e8ded2] bg-[#f3ece2] py-10 sm:py-14"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#a44436]">
              Shop by craft
            </p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
              Find your occasion
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/collection"
              className="hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] underline underline-offset-4 transition hover:text-[#a44436] sm:inline-flex"
            >
              View all <ArrowRight size={13} />
            </Link>
            <div
              role="group"
              aria-label="Category slider controls"
              className="flex items-center gap-1.5"
            >
              <button
                type="button"
                onClick={() => scrollByDirection(-1)}
                disabled={!sliderState.canPrev}
                aria-label="Previous categories"
                className="flex size-9 items-center justify-center border border-[#d9cbbd] bg-[#fffdf9] text-[#39231e] transition hover:border-[#39231e] hover:bg-[#39231e] hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[#d9cbbd] disabled:hover:bg-[#fffdf9] disabled:hover:text-[#39231e]"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scrollByDirection(1)}
                disabled={!sliderState.canNext}
                aria-label="Next categories"
                className="flex size-9 items-center justify-center border border-[#d9cbbd] bg-[#fffdf9] text-[#39231e] transition hover:border-[#39231e] hover:bg-[#39231e] hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[#d9cbbd] disabled:hover:bg-[#fffdf9] disabled:hover:text-[#39231e]"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden"
        >
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className={`group relative overflow-hidden bg-[#d6bda4] ${SLIDE_SIZE_CLASSES}`}
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(max-width: 639px) 46vw, (max-width: 1023px) 33vw, 25vw"
                className="object-cover object-center transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#39231e]/80 via-[#39231e]/15 to-transparent" />
              <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 sm:inset-x-4 sm:bottom-4">
                <span className="font-serif text-base leading-tight text-white sm:text-xl">
                  {category.name}
                </span>
                <ArrowRight
                  size={14}
                  className="shrink-0 text-[#f2d9b6] opacity-80 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                />
              </div>
            </Link>
          ))}

          <Link
            href="/collection"
            className={`group relative flex flex-col justify-between overflow-hidden bg-[#39231e] p-4 text-[#f8ede0] transition hover:bg-[#4b2f28] sm:p-5 ${SLIDE_SIZE_CLASSES}`}
          >
            <span className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#d6af7a]">
              All {categories.length} edits
            </span>
            <div>
              <span className="block font-serif text-base leading-snug sm:text-xl">
                Explore full collection
              </span>
              <span className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f2d9b6] transition group-hover:translate-x-0.5">
                Shop all <ArrowRight size={12} />
              </span>
            </div>
          </Link>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div
            aria-hidden="true"
            className="relative h-[2px] flex-1 overflow-hidden bg-[#dfd3c3]"
          >
            <div
              className="absolute inset-y-0 bg-[#39231e]"
              style={{
                width: `${sliderState.thumbWidthPct}%`,
                left: `${sliderState.thumbOffsetPct}%`,
              }}
            />
          </div>
          <Link
            href="/collection"
            className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] underline underline-offset-4 sm:hidden"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </section>
  );
}

