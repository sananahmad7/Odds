"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type CategoryChip = { name: string; slug: string };
type FeaturedArticle = {
  id: number;
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
  categories: CategoryChip[];
  publishedAt: string; // ISO
  isFeatured: boolean;
  published: boolean;
};

export default function Hero() {
  const [featured, setFeatured] = useState<FeaturedArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // NEW: single-shot timer that we can reset
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ROTATE_MS = 7000;

  // Fetch featured from API
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/getFeaturedBlogs", { cache: "no-store" });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || "Failed to load featured blogs");
        }
        const data: FeaturedArticle[] = await res.json();
        if (isMounted) {
          setFeatured(Array.isArray(data) ? data : []);
          setCurrentIndex(0);
        }
      } catch (e: any) {
        if (isMounted) setError(e?.message || "Failed to load featured blogs");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-rotate with reset on any index change
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) clearTimeout(timerRef.current);

    if (featured.length > 1) {
      // Start a fresh timer
      timerRef.current = setTimeout(() => {
        setCurrentIndex((prev) =>
          prev === featured.length - 1 ? 0 : prev + 1
        );
      }, ROTATE_MS);
    }

    // Cleanup on unmount / dep change
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, featured.length]); // <— depends on index, so it resets after manual changes too

  // Keyboard navigation (← / →)
  useEffect(() => {
    if (featured.length <= 1) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev + 1) % featured.length);
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex(
          (prev) => (prev - 1 + featured.length) % featured.length
        );
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [featured.length]);

  const handleDotClick = (index: number) => setCurrentIndex(index);
  const handleNext = () =>
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  const handlePrev = () =>
    setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length);

  // Nothing to show
  if (loading || error || featured.length === 0) return null;

  const currentArticle = featured[currentIndex];
  const canNav = featured.length > 1;

  return (
    <section className="w-full bg-white">
      <div className="relative w-full h-[500px] md:h-[600px]">
        {/* Background Image */}
        <img
          src={currentArticle.thumbnail || "/placeholder.svg"}
          alt={currentArticle.title}
          className="w-full h-full object-cover"
        />

        {/* Subtle Dark Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Top-left label */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
          <span className="inline-block px-4 py-2 rounded font-inter font-semibold tracking-wide uppercase text-xs md:text-sm bg-[#24257C] text-white">
            Analysis of the Day
          </span>
        </div>

        {/* Arrow Buttons */}
        {canNav && (
          <>
            {/* Prev */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous article"
              className="absolute cursor-pointer left-3 md:left-3 top-1/2 -translate-y-1/2 z-10 grid place-items-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 hover:bg-white focus:outline-none backdrop-blur"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <path
                  d="M15 19l-7-7 7-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Next */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next article"
              className="absolute cursor-pointer right-3 md:right-3 top-1/2 -translate-y-1/2 z-10 grid place-items-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 hover:bg-white focus:outline-none backdrop-blur"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <path
                  d="M9 5l7 7-7 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}

        {/* Content */}
        <div className=" absolute inset-0 flex flex-col justify-end p-6 md:p-12 lg:p-16">
          <div className="max-w-4xl">
            <div className="ml-2">
              {/* League Tag */}
              <span className="inline-block px-3 py-1 bg-white/90 text-[#111827] text-sm font-semibold font-inter rounded mb-4">
                {currentArticle.categories.find((c) =>
                  ["nfl", "nba", "mlb", "ufc", "ncaaf", "ncaab"].includes(
                    c.slug.toLowerCase()
                  )
                )?.name ||
                  currentArticle.categories[0]?.name ||
                  "SPORTS"}
              </span>

              {/* Title */}
              <Link href={`/article/${currentArticle.slug}`}>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-playfair text-white mb-8 leading-tight">
                  {currentArticle.title}
                </h1>
              </Link>

              {/* CTA */}
              <Link href={`/article/${currentArticle.slug}`}>
                <button className="inline-block cursor-pointer px-6 py-3 bg-[#24257C] hover:bg-[#C83495] text-white font-inter font-medium rounded transition-colors duration-300">
                  Read Analysis
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Dot Indicators */}
        {canNav && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
            {featured.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? "bg-[#24257C] w-10 h-3 cursor-pointer"
                    : "bg-white/60 w-3 h-3 hover:bg-white/90 cursor-pointer"
                }`}
                aria-label={`Go to article ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
