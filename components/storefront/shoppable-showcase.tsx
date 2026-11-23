"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function ShoppableShowcase() {
  return (
    <section className="w-full bg-popover border-y border-border overflow-hidden">
      {/* Row 1: Video Left, Text Right (Kids Collection) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch min-h-[500px]">
        {/* Video Column */}
        <div className="relative w-full min-h-[380px] lg:min-h-full overflow-hidden bg-secondary">
          <video
            src="/KiddieQuick.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 size-full object-cover transition-transform duration-1000 hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-sm backdrop-blur-sm">
              <Sparkles size={11} />
              Kids Play &amp; Party
            </span>
          </div>
        </div>

        {/* Text Content */}
        <div className="flex flex-col justify-center px-8 sm:px-16 lg:px-20 xl:px-28 py-16 space-y-6 bg-popover">
          <span className="text-[10px] tracking-[0.28em] uppercase text-accent font-semibold">
            01 / Playful &amp; Gentle
          </span>
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-primary leading-tight">
            Smart Kids &amp; Toddler Wear
          </h3>
          <div className="h-[2px] w-16 bg-accent" />
          <p className="text-muted-foreground leading-relaxed text-sm sm:text-base font-light max-w-md">
            Crafted from 100% bio-washed combed cottons and breathable natural
            fabrics. Playful baba suits, twirling party frocks, and everyday
            graphic sets engineered for all-day smiles and carefree movement.
          </p>
          <div className="pt-2">
            <Link
              href="/collection"
              className="inline-flex items-center gap-2 text-[10px] tracking-[0.24em] font-semibold text-primary uppercase border-b-2 border-primary/30 hover:border-accent hover:text-accent pb-1.5 transition-all duration-300 group"
            >
              <span>Explore Kids Collection</span>
              <ArrowRight
                size={14}
                className="transform group-hover:translate-x-1.5 transition-transform duration-300 text-accent"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Row 2: Text Left, Video Right (Men & Women / Family Collection) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch min-h-[500px] border-t border-border">
        {/* Text Content (first on desktop, second on mobile) */}
        <div className="flex flex-col justify-center px-8 sm:px-16 lg:px-20 xl:px-28 py-16 space-y-6 bg-popover order-2 lg:order-1">
          <span className="text-[10px] tracking-[0.28em] uppercase text-accent font-semibold">
            02 / Modern &amp; Festive
          </span>
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-primary leading-tight">
            Men &amp; Women Family Wear
          </h3>
          <div className="h-[2px] w-16 bg-accent" />
          <p className="text-muted-foreground leading-relaxed text-sm sm:text-base font-light max-w-md">
            From crisp breathable linen button-downs and classic pique polos to
            flowing celebratory Indian kurtas and salwar suit sets — elevated
            silhouettes designed for special milestones and daily comfort.
          </p>
          <div className="pt-2">
            <Link
              href="/collection"
              className="inline-flex items-center gap-2 text-[10px] tracking-[0.24em] font-semibold text-primary uppercase border-b-2 border-primary/30 hover:border-accent hover:text-accent pb-1.5 transition-all duration-300 group"
            >
              <span>Explore Men &amp; Women</span>
              <ArrowRight
                size={14}
                className="transform group-hover:translate-x-1.5 transition-transform duration-300 text-accent"
              />
            </Link>
          </div>
        </div>

        {/* Video Column (second on desktop, first on mobile) */}
        <div className="relative w-full min-h-[380px] lg:min-h-full overflow-hidden bg-secondary order-1 lg:order-2">
          <video
            src="/KiddieQuick-Family.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 size-full object-cover transition-transform duration-1000 hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          <div className="absolute top-4 right-4 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-sm backdrop-blur-sm">
              <Sparkles size={11} />
              Contemporary &amp; Ethnic
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
