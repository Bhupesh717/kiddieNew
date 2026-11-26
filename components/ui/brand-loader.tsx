"use client";

import React from "react";
import Image from "next/image";

interface BrandLoaderProps {
  fullscreen?: boolean;
  text?: string;
  subtext?: string;
  size?: "sm" | "md" | "lg";
}

export function BrandLoader({
  fullscreen = true,
  text = "KiddieQuick",
  subtext = "Preparing your experience...",
  size = "md",
}: BrandLoaderProps) {
  const isSm = size === "sm";
  const isLg = size === "lg";

  const ringSize = isSm ? "size-16" : isLg ? "size-28" : "size-24";
  const innerRingSize = isSm ? "size-14" : isLg ? "size-24" : "size-20";
  const logoBoxSize = isSm ? "size-11" : isLg ? "size-18" : "size-16";
  const logoImgSize = isSm ? 26 : isLg ? 44 : 36;

  const content = (
    <div className="flex flex-col items-center justify-center p-6 text-center select-none">
      {/* Animated Orb with Dual Concentric Rings & k-logo */}
      <div className={`relative flex items-center justify-center ${ringSize}`}>
        {/* Outer clockwise spinning accent ring */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent border-r-accent animate-spin"
          style={{ animationDuration: "1.1s" }}
        />

        {/* Middle counter-clockwise spinning amber glow ring */}
        <div
          aria-hidden="true"
          className={`absolute rounded-full border-2 border-transparent border-b-amber-500/60 border-l-amber-500/60 ${innerRingSize}`}
          style={{ animation: "reverseSpin 1.6s linear infinite" }}
        />

        {/* Ambient subtle glowing pulse backdrop */}
        <div
          aria-hidden="true"
          className="absolute size-14 rounded-full bg-accent/10 blur-md animate-pulse"
        />

        {/* Center Logo Container with Shadow */}
        <div
          className={`relative z-10 flex items-center justify-center rounded-full bg-white shadow-md border border-border/80 ${logoBoxSize}`}
        >
          <Image
            src="/k-logo.png"
            alt="KiddieQuick"
            width={logoImgSize}
            height={logoImgSize}
            priority
            className="object-contain animate-pulse"
            style={{ animationDuration: "1.8s" }}
          />
        </div>
      </div>

      {/* Brand Label & Typography */}
      {text && (
        <div className="mt-5 flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <span className="font-serif text-lg sm:text-xl font-bold tracking-[0.24em] text-primary uppercase">
              {text}
            </span>

          </div>

          {/* Micro Progress Bar */}
          <div className="mt-3 h-[2.5px] w-32 overflow-hidden rounded-full bg-border/80">
            <div
              className="h-full bg-gradient-to-r from-accent via-amber-400 to-accent"
              style={{
                animation: "loaderShimmer 1.4s ease-in-out infinite",
              }}
            />
          </div>

          {/* Subtext description */}
          {subtext && (
            <p className="mt-2.5 text-[11px] font-medium tracking-wide text-muted-foreground animate-pulse">
              {subtext}
            </p>
          )}
        </div>
      )}

      {/* Inline Keyframes */}
      <style jsx>{`
        @keyframes reverseSpin {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        @keyframes loaderShimmer {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(30%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );

  if (!fullscreen) {
    return content;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading KiddieQuick"
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md transition-all duration-300"
    >
      {content}
    </div>
  );
}
