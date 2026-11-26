"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { BlogCoverImage } from "@/components/storefront/blog-cover-image";
import type { StoreCategory } from "@/src/lib/store/catalog";

type SliderState = {
  canPrev: boolean;
  canNext: boolean;
};

const INITIAL_SLIDER_STATE: SliderState = {
  canPrev: false,
  canNext: true,
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

    setSliderState({
      canPrev: el.scrollLeft > 4,
      canNext: el.scrollLeft < maxScroll - 4,
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
      className="border-y border-border bg-secondary py-10 sm:py-14"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-accent">
              Find your style
            </p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
              Explore Categories
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/collection"
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] underline underline-offset-4 transition hover:text-accent"
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
                className="flex size-9 items-center justify-center border border-input bg-popover text-primary transition hover:border-primary hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-input disabled:hover:bg-popover disabled:hover:text-primary"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scrollByDirection(1)}
                disabled={!sliderState.canNext}
                aria-label="Next categories"
                className="flex size-9 items-center justify-center border border-input bg-popover text-primary transition hover:border-primary hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-input disabled:hover:bg-popover disabled:hover:text-primary"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [-ms-overflow-style:none] sm:gap-4 [&::-webkit-scrollbar]:hidden"
        >
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className={`group relative overflow-hidden bg-secondary ${SLIDE_SIZE_CLASSES}`}
            >
              <BlogCoverImage
                src={category.image}
                alt={category.name}
                sizes="(max-width: 639px) 46vw, (max-width: 1023px) 33vw, 25vw"
                className="object-cover object-center transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/15 to-transparent" />
              <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 sm:inset-x-4 sm:bottom-4">
                <span className="font-serif text-base leading-tight text-white sm:text-xl">
                  {category.name}
                </span>
                <ArrowRight
                  size={14}
                  className="shrink-0 text-amber-200/90 opacity-80 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                />
              </div>
            </Link>
          ))}

          <Link
            href="/collection"
            aria-label="Explore All Collections"
            className={`group relative overflow-hidden bg-secondary ${SLIDE_SIZE_CLASSES}`}
          >
            <Image
              src="/Explore-All-Collections.png"
              alt="Explore All Collections"
              fill
              sizes="(max-width: 639px) 46vw, (max-width: 1023px) 33vw, 25vw"
              className="object-cover object-center transition duration-500 group-hover:scale-105"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
