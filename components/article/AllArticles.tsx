"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import BlogCard, { type BlogCardPost } from "@/components/article/BlogCard";
import type { BlogArticle } from "@/dummyData";
import { blogArticles } from "@/dummyData";

type SortKey = "Newest" | "Oldest";

// Deterministic date string (UTC) to avoid SSR/CSR mismatch
function stableDate(iso: string) {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`; // e.g. 2025-10-29
}

const AllArticles = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [sortBy] = useState<SortKey>("Newest"); // default to Newest; no UI needed
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Press "/" anywhere to focus the search (not inside inputs/textareas)
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target?.tagName?.toLowerCase();
      const typingInField =
        tag === "input" ||
        tag === "textarea" ||
        (target as any)?.isContentEditable;

      if (
        !typingInField &&
        e.key === "/" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Build category list from dummy data (sorted deterministically)
  const categories = useMemo<string[]>(() => {
    const set = new Set<string>();
    blogArticles.forEach((p) => p.categories.forEach((c) => set.add(c.name)));
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b, "en"))];
  }, []);

  // Filter by selected category + live title search
  const filtered: BlogArticle[] = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const byCategory =
      activeCategory === "All"
        ? blogArticles
        : blogArticles.filter((post) =>
            post.categories.some((c) => c.name === activeCategory)
          );

    if (!q) return byCategory;

    return byCategory.filter((post) => post.title.toLowerCase().includes(q));
  }, [activeCategory, searchQuery]);

  // Sort by publishedAt (stable numeric compare)
  const sorted: BlogArticle[] = useMemo(() => {
    const copy = [...filtered];
    switch (sortBy) {
      case "Newest":
        copy.sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
        );
        break;
      case "Oldest":
        copy.sort(
          (a, b) =>
            new Date(a.publishedAt).getTime() -
            new Date(b.publishedAt).getTime()
        );
        break;
    }
    return copy;
  }, [filtered, sortBy]);

  // Map to the BlogCard props shape (date is deterministic)
  const cardPosts: BlogCardPost[] = useMemo(
    () =>
      sorted.map((post) => ({
        slug: post.slug,
        title: post.title,
        excerpt:
          post.description.length > 100
            ? `${post.description.substring(0, 100)}...`
            : post.description,
        imageUrl: post.thumbnail,
        category: post.categories[0]?.name ?? "General",
        date: stableDate(post.publishedAt),
      })),
    [sorted]
  );

  return (
    <section className="w-full bg-white py-10 md:py-16 ">
      <div className="container mx-auto  px-4 md:px-6 lg:px-8">
        {/* Controls */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Search (enhanced design) */}
          <div className="flex items-center mt-5">
            <div className="relative w-full md:w-[32rem] group">
              <label htmlFor="article-search" className="sr-only">
                Search articles by title
              </label>

              {/* Icon */}
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-gray-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                />
              </svg>

              <input
                id="article-search"
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by title..."
                aria-label="Search articles"
                className="w-full rounded-full bg-gray-50 border border-gray-200 pl-10 pr-24 py-2.5 text-sm placeholder:text-gray-400 shadow-sm outline-none transition
                           focus:border-gray-300 focus:ring-2 focus:ring-gray-900/10"
              />

              {/* Right adornment: clear button or shortcut hint */}
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-gray-200 bg-white text-xs text-gray-700 hover:bg-gray-50 active:scale-[0.98]"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Clear
                </button>
              ) : (
                <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-xs text-gray-500">
                  <span>Press</span>
                  <kbd className="px-2 py-1 rounded-md border border-gray-200 bg-white font-medium text-gray-700">
                    /
                  </kbd>
                  <span>to search</span>
                </div>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => {
              const active = cat === activeCategory;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition
                    ${
                      active
                        ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                    }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
          {cardPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        {/* Empty state */}
        {cardPosts.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No articles found.
          </div>
        )}
      </div>
    </section>
  );
};

export default AllArticles;
