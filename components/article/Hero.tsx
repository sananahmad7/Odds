"use client";

import type { BlogArticle } from "@/dummyData";
import { blogArticles } from "@/dummyData";
import { useState, useRef, useEffect, useMemo } from "react";

export default function Hero() {
  // only featured posts
  const featured = useMemo(() => blogArticles.filter((a) => a.isFeatured), []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? (featured.length ? featured.length - 1 : 0) : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === (featured.length ? featured.length - 1 : 0) ? 0 : prev + 1
    );
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      const scrollAmount = currentIndex * (500 + 24);
      scrollContainerRef.current.scrollTo({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  }, [currentIndex]);

  if (featured.length === 0) {
    return null; // or show a fallback UI
  }

  return (
    <section className="w-full bg-white">
      {/* Featured Article Carousel */}
      <div className="relative w-full h-96 md:h-160">
        {/* Main Featured Article */}
        <div className="relative w-full h-full">
          <img
            src={featured[currentIndex].thumbnail || "/placeholder.svg"}
            alt={featured[currentIndex].title}
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
            <div className="max-w-3xl">
              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold font-playfair text-white mb-3 text-balance leading-tight">
                {featured[currentIndex].title}
              </h1>

              {/* Subtitle */}
              <p className="text-md md:text-lg text-gray-200 font-inter mb-6 max-w-2xl">
                {featured[currentIndex].description}
              </p>

              {/* CTA Button */}
              <button className="inline-block px-5 py-1.5 bg-[#278394] hover:scale-105 text-black font-inter rounded-lg transition-colors duration-200">
                Read Full Analysis
              </button>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-colors duration-200 z-10 backdrop-blur-sm"
            aria-label="Previous article"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={handleNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-colors duration-200 z-10 backdrop-blur-sm"
            aria-label="Next article"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {featured.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? "bg-[#B64E10] w-8 h-2"
                    : "bg-white/50 w-2 h-2 hover:bg-white/75"
                }`}
                aria-label={`Go to article ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
