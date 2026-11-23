"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { BrandLoader } from "@/components/ui/brand-loader";

type LoaderContextType = {
  isLoading: boolean;
  showLoader: (message?: string) => void;
  hideLoader: () => void;
  withLoading: <T>(promise: Promise<T>, message?: string) => Promise<T>;
};

const LoaderContext = createContext<LoaderContextType>({
  isLoading: false,
  showLoader: () => {},
  hideLoader: () => {},
  withLoading: (p) => p,
});

export const useGlobalLoader = () => useContext(LoaderContext);

// Global custom events for non-React files or utility functions
export function triggerGlobalLoading(active: boolean, message?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("kiddiequick:loader", {
      detail: { active, message },
    })
  );
}

export function GlobalLoaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initial site visit preloader state
  const [initialLoading, setInitialLoading] = useState(true);
  const [fadeInitial, setFadeInitial] = useState(false);

  // Manual or API loading state
  const [manualLoading, setManualLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Preparing your experience...");

  // Top progress bar during route transitions
  const [routeTransitioning, setRouteTransitioning] = useState(false);

  const activeRequestsRef = useRef(0);
  const previousPathRef = useRef<string | null>(null);

  // 1. Initial Page Load Experience
  useEffect(() => {
    // Graceful brief splash screen so fonts and styles are loaded
    const minTimer = setTimeout(() => {
      setFadeInitial(true);
      const removeTimer = setTimeout(() => {
        setInitialLoading(false);
      }, 400); // fade out duration
      return () => clearTimeout(removeTimer);
    }, 450);

    return () => clearTimeout(minTimer);
  }, []);

  // 2. Next.js Route Navigation Detection
  useEffect(() => {
    const currentUrl = `${pathname}?${searchParams?.toString() ?? ""}`;
    if (previousPathRef.current && previousPathRef.current !== currentUrl) {
      setRouteTransitioning(true);
      const timer = setTimeout(() => {
        setRouteTransitioning(false);
      }, 500);
      return () => clearTimeout(timer);
    }
    previousPathRef.current = currentUrl;
  }, [pathname, searchParams]);

  // 3. Global window.fetch Auto-Interceptor for API calls
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = typeof args[0] === "string" ? args[0] : args[0] instanceof Request ? args[0].url : "";
      const isApiCall = url.includes("/api/") || url.includes(":8000");

      if (isApiCall) {
        activeRequestsRef.current += 1;
        // If an API call takes longer than 150ms, activate subtle loading state
        const delayTimer = setTimeout(() => {
          if (activeRequestsRef.current > 0) {
            setRouteTransitioning(true);
          }
        }, 150);

        try {
          const res = await originalFetch(...args);
          return res;
        } finally {
          clearTimeout(delayTimer);
          activeRequestsRef.current = Math.max(0, activeRequestsRef.current - 1);
          if (activeRequestsRef.current === 0) {
            setRouteTransitioning(false);
          }
        }
      }

      return originalFetch(...args);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // 4. Custom Event Listener (kiddiequick:loader)
  useEffect(() => {
    function handleLoaderEvent(event: Event) {
      const custom = event as CustomEvent<{ active: boolean; message?: string }>;
      if (custom.detail) {
        setManualLoading(Boolean(custom.detail.active));
        if (custom.detail.message) {
          setLoadingText(custom.detail.message);
        }
      }
    }

    window.addEventListener("kiddiequick:loader", handleLoaderEvent);
    return () => {
      window.removeEventListener("kiddiequick:loader", handleLoaderEvent);
    };
  }, []);

  const showLoader = useCallback((message?: string) => {
    if (message) setLoadingText(message);
    setManualLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    setManualLoading(false);
  }, []);

  const withLoading = useCallback(
    async <T,>(promise: Promise<T>, message?: string): Promise<T> => {
      showLoader(message);
      try {
        return await promise;
      } finally {
        hideLoader();
      }
    },
    [showLoader, hideLoader]
  );

  return (
    <LoaderContext.Provider
      value={{
        isLoading: initialLoading || manualLoading,
        showLoader,
        hideLoader,
        withLoading,
      }}
    >
      {/* Top route & API progress bar */}
      {routeTransitioning && (
        <div
          role="progressbar"
          aria-label="Page loading"
          className="fixed top-0 inset-x-0 z-[99999] h-[3px] bg-border overflow-hidden"
        >
          <div
            className="h-full bg-gradient-to-r from-accent via-amber-400 to-accent animate-pulse"
            style={{
              animation: "topBarSlide 1.2s ease-in-out infinite",
            }}
          />
          <style jsx>{`
            @keyframes topBarSlide {
              0% {
                transform: translateX(-100%);
              }
              50% {
                transform: translateX(40%);
              }
              100% {
                transform: translateX(100%);
              }
            }
          `}</style>
        </div>
      )}

      {/* Fullscreen Initial Preloader with smooth fade-out */}
      {initialLoading && (
        <div
          className={`fixed inset-0 z-[99999] transition-opacity duration-400 ease-out ${
            fadeInitial ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <BrandLoader fullscreen text="KiddieQuick" subtext="Welcome to KiddieQuick" />
        </div>
      )}

      {/* Manual Fullscreen Loader */}
      {manualLoading && !initialLoading && (
        <BrandLoader fullscreen text="KiddieQuick" subtext={loadingText} />
      )}

      {children}
    </LoaderContext.Provider>
  );
}
