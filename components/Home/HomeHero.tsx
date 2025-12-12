"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

// ⬅️ REPLACED categories with league
type FeaturedArticle = {
  id: number;
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
  league: "NFL" | "NBA" | "NCAAF" | "NCAAB" | "MLB" | "UFC";

  published: boolean;
};

type HeroProps = { articles?: FeaturedArticle[] };

export default function Hero({ articles = [] }: HeroProps) {
  const [featured, setFeatured] = useState<FeaturedArticle[]>(articles);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(articles.length === 0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ROTATE_MS = 7000;

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        if (articles.length === 0) setLoading(true);
        const res = await fetch("/api/getFeaturedBlogs", { cache: "no-cache" });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || "Failed to load featured blogs");
        }
        const data: FeaturedArticle[] = await res.json();
        if (!isMounted) return;
        setFeatured(Array.isArray(data) ? data : []);
        setCurrentIndex(0);
      } catch (e: any) {
        if (isMounted) setError(e?.message || "Failed to load featured blogs");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (featured.length > 1) {
      timerRef.current = setTimeout(() => {
        setCurrentIndex((p) => (p === featured.length - 1 ? 0 : p + 1));
      }, ROTATE_MS);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, featured.length]);

  useEffect(() => {
    if (featured.length <= 1) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight")
        setCurrentIndex((p) => (p + 1) % featured.length);
      if (e.key === "ArrowLeft")
        setCurrentIndex((p) => (p - 1 + featured.length) % featured.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [featured.length]);

  const handleDotClick = (i: number) => setCurrentIndex(i);
  const handleNext = () => setCurrentIndex((p) => (p + 1) % featured.length);
  const handlePrev = () =>
    setCurrentIndex((p) => (p - 1 + featured.length) % featured.length);

  const hasData = featured.length > 0;
  const current = hasData ? featured[currentIndex] : null;
  const canNav = featured.length > 1;
  const showSkeleton = !hasData && loading;

  return (
    <section className="w-full bg-white">
      <div
        className="relative w-full h-[500px] md:h-[600px]"
        aria-busy={showSkeleton}
        aria-live="polite"
      >
        {/* image / placeholder */}
        <div className="absolute inset-0">
          {hasData && current?.thumbnail ? (
            <Image
              src={current.thumbnail}
              alt={current.title}
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>

        {/* dark veil */}
        <div className="absolute inset-0 bg-black/40" />

        {/* --- SKELETON LAYER --- */}
        {showSkeleton && (
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 lg:p-16">
            <div className="max-w-4xl ml-2 space-y-4 animate-pulse">
              <div className="h-6 w-40 rounded bg-white/60" />
              <div className="h-8 md:h-10 w-4/5 rounded bg-white/60" />
              <div className="h-8 md:h-10 w-3/5 rounded bg-white/50" />
              <div className="h-10 w-40 rounded bg-[#24257C]/80" />
            </div>
            <span className="sr-only">Loading featured analysis…</span>
          </div>
        )}

        {/* real content */}
        {!showSkeleton && (
          <>
            {/* label */}
            <div className="absolute top-4  md:top-6 left-1 z-10  px-3 md:px-6 lg:px-8">
              <span className="inline-block px-4 py-2 rounded font-neue font-semibold tracking-wide uppercase text-xs md:text-sm bg-[#24257C] text-white">
                Analysis and Angles
              </span>
            </div>

            {/* arrows */}
            {canNav && (
              <>
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

            {/* content */}
            <div className=" absolute  inset-0 flex flex-col justify-end p-3 md:p-6 lg:p-8">
              <div className="max-w-5xl  ">
                {/* ⬅️ NEW: show league badge */}
                <span className="inline-block px-3 py-1 bg-white/90 text-[#111827] text-sm font-semibold font-neue rounded mb-4">
                  {hasData ? current!.league : "SPORTS"}
                </span>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-gtsuper text-white mb-8 leading-tight">
                  {hasData ? current!.title : "Loading analysis…"}
                </h1>

                <Link href={hasData ? `/article/${current!.slug}` : `#`}>
                  <button
                    disabled={!hasData}
                    className="inline-block px-6 py-3 cursor-pointer bg-[#24257C] hover:bg-[#C83495] disabled:opacity-60 disabled:cursor-not-allowed text-white font-neue font-medium rounded transition-colors duration-300"
                  >
                    Read Analysis
                  </button>
                </Link>
              </div>
            </div>

            {/* dots */}
            {canNav && (
              <div className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2  gap-3 z-10">
                {featured.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleDotClick(i)}
                    className={`transition-all duration-300 rounded-full ${
                      i === currentIndex
                        ? "bg-[#24257C] w-10 h-3 "
                        : "bg-white/60 w-3 h-3 hover:bg-white/90 cursor-pointer"
                    }`}
                    aria-label={`Go to article ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {!showSkeleton && !hasData && error && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="rounded-md bg-black/60 text-white px-4 py-2 text-sm">
              {error}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
