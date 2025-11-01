"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { BlogArticle } from "@/dummyData";
import { blogArticles } from "@/dummyData";

const Articles: React.FC = () => {
  const articles: BlogArticle[] = [...blogArticles]
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, 6);

  // Optional: handle empty dataset
  if (!articles.length) {
    return (
      <div className="bg-white text-neutral-900 min-h-[40vh] grid place-items-center">
        <p className="text-neutral-600 font-poppins">No articles available.</p>
      </div>
    );
  }

  return (
    <div className="border bg-white min-h-screen relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 via-transparent to-neutral-50 pointer-events-none border" />

      <div className="border container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 relative z-10">
        {/* Header Section - Tighter spacing */}
        <header className="mb-10 md:mb-12">
          <div className="flex flex-col items-center text-center space-y-3">
            <span className="inline-block px-4 py-1.5 text-xs font-poppins font-semibold tracking-[0.2em] uppercase bg-neutral-100 text-neutral-700 rounded-sm border border-neutral-300">
              Sports Updates
            </span>
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900">
              Latest{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#23287D] via-[#C5358C] to-[#278394]">
                Blog Posts
              </span>
            </h1>
            <p className="text-base md:text-lg text-neutral-600 font-poppins max-w-2xl">
              Stay up-to-date with the latest news and breaking stories
            </p>
          </div>
        </header>

        {/* Description Section - Reduced margin */}
        <section className="mb-10 md:mb-12">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm md:text-base leading-relaxed text-neutral-600 font-poppins">
              Catch up with our most recent articles covering live match
              updates, trending cricket news, exclusive player interviews, and
              breaking stories. We keep you informed, so you never miss out on
              the big moments.
            </p>
          </div>
        </section>

        {/* Articles Grid - Leaner cards */}
        <section className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {articles.map((article) => (
              <Link
                key={article._id}
                href={`/blog/${article.slug}`}
                className="block group"
              >
                <article className="relative rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-neutral-400/30 h-full">
                  {/* Image Container - Reduced height */}
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      fill
                      src={article.thumbnail}
                      alt={article.title}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                    {/* Category badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="inline-block px-3 py-1 text-[10px] font-poppins font-semibold uppercase tracking-wider bg-[#278394] text-white rounded">
                        {article.league ?? "Uncategorized"}
                      </span>
                    </div>
                  </div>

                  {/* Content - Tighter padding with #171717 background */}
                  <div className="p-5 bg-[#101828]">
                    <h3 className="font-playfair text-xl font-bold mb-2 leading-tight text-white  transition-colors duration-300 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-neutral-400 font-poppins text-sm mb-4 line-clamp-2 leading-relaxed">
                      {article.description}
                    </p>

                    {/* Read more link */}
                    <div className="flex items-center text-sm font-poppins font-medium text-white  transition-colors">
                      <span>Read Article</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="ml-1.5 transition-transform duration-300 group-hover:translate-x-1"
                      >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        {/* View All Button - Sleeker design */}
        <div className="text-center">
          <Link
            href="/article"
            className="inline-flex items-center px-6 py-3 font-poppins font-semibold text-sm uppercase tracking-wider bg-[#278394] text-white rounded transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105"
          >
            View All Articles
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-2"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Articles;
