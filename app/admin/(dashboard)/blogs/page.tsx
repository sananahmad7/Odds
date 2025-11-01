"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { BlogArticle } from "@/dummyData";
import { blogArticles } from "@/dummyData";

type FilterKey = "all" | "published" | "draft";

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [loading, setLoading] = useState(false);

  // button-level spinners
  const [toggleLoadingIds, setToggleLoadingIds] = useState<Set<string>>(
    new Set()
  );
  const [deleteLoadingIds, setDeleteLoadingIds] = useState<Set<string>>(
    new Set()
  );
  const [featuredLoadingIds, setFeaturedLoadingIds] = useState<Set<string>>(
    new Set()
  );

  // popup for truncated text
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState<string>("");

  useEffect(() => {
    // Load from dummy data (clone so we can mutate locally)
    setLoading(true);
    const timer = setTimeout(() => {
      const sorted = [...blogArticles].sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
      setBlogs(sorted);
      setLoading(false);
    }, 200); // tiny delay to show loading state
    return () => clearTimeout(timer);
  }, []);

  const filteredBlogs = useMemo(() => {
    switch (filter) {
      case "published":
        return blogs.filter((b) => b.published === true);
      case "draft":
        return blogs.filter((b) => b.published === false);
      default:
        return blogs;
    }
  }, [blogs, filter]);

  // helpers
  const truncate = (str: string, max = 30) =>
    str.length > max ? str.slice(0, max) + "…" : str;

  const withSet = (
    setter: React.Dispatch<React.SetStateAction<Set<string>>>,
    id: string,
    add: boolean
  ) =>
    setter((prev) => {
      const s = new Set(prev);
      add ? s.add(id) : s.delete(id);
      return s;
    });

  // actions (local state only)
  const togglePublished = (id: string) => {
    withSet(setToggleLoadingIds, id, true);
    setTimeout(() => {
      setBlogs((prev) =>
        prev.map((b) => (b._id === id ? { ...b, published: !b.published } : b))
      );
      withSet(setToggleLoadingIds, id, false);
    }, 300);
  };

  const toggleFeatured = (id: string) => {
    withSet(setFeaturedLoadingIds, id, true);
    setTimeout(() => {
      setBlogs((prev) =>
        prev.map((b) =>
          b._id === id ? { ...b, isFeatured: !b.isFeatured } : b
        )
      );
      withSet(setFeaturedLoadingIds, id, false);
    }, 300);
  };

  const deleteBlog = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    withSet(setDeleteLoadingIds, id, true);
    setTimeout(() => {
      setBlogs((prev) => prev.filter((b) => b._id !== id));
      withSet(setDeleteLoadingIds, id, false);
    }, 300);
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
      {/* Heading */}
      <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl mt-10 text-[#263E4D]">
        Blogs Management
      </h1>
      <p className="font-poppins text-gray-600 mt-2 mb-8 max-w-2xl">
        Filter, edit, feature, publish or delete your content. This admin view
        reads from local dummy data.
      </p>

      {/* Filters */}
      <div className="flex gap-3 mb-8 w-full sm:w-auto">
        {(["all", "published", "draft"] as FilterKey[]).map((key) => {
          const active = filter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`font-poppins rounded-md px-4 py-2 border transition
                ${
                  active
                    ? "bg-[#263E4D] text-white border-[#263E4D]"
                    : "bg-white text-[#263E4D] border-[#263E4D] hover:bg-[#263E4D] hover:text-white"
                }`}
            >
              {key === "all"
                ? "All Blogs"
                : key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Loading / Empty / Grid */}
      {loading ? (
        <div className="flex items-center gap-3 py-24 text-gray-500 font-poppins">
          <Spinner />
          Loading blogs…
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center text-gray-600 py-24 font-poppins">
          No blogs found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlogs.map((blog) => (
            <div
              key={blog._id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden flex flex-col"
            >
              {/* Thumbnail + overlay actions */}
              <div className="relative group">
                <img
                  src={blog.thumbnail || "/placeholder.svg"}
                  alt={blog.title}
                  className="w-full h-56 object-cover"
                />
                <div className="absolute inset-x-0 top-0 px-3 py-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                  {/* Feature */}
                  <button
                    onClick={() => toggleFeatured(blog._id)}
                    disabled={featuredLoadingIds.has(blog._id)}
                    title={
                      blog.isFeatured ? "Remove Featured" : "Mark as Featured"
                    }
                    className="rounded-md bg-white/90 hover:bg-white shadow px-2 py-1"
                  >
                    {featuredLoadingIds.has(blog._id) ? (
                      <Spinner tiny />
                    ) : blog.isFeatured ? (
                      <IconStarSolid className="text-yellow-500" />
                    ) : (
                      <IconStarOutline />
                    )}
                  </button>
                  {/* Delete */}
                  <button
                    onClick={() => deleteBlog(blog._id, blog.title)}
                    disabled={deleteLoadingIds.has(blog._id)}
                    title="Delete"
                    className="rounded-md bg-white/90 hover:bg-white shadow px-2 py-1"
                  >
                    {deleteLoadingIds.has(blog._id) ? (
                      <Spinner tiny />
                    ) : (
                      <IconTrash />
                    )}
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-playfair text-xl text-[#263E4D] mb-2">
                  {blog.title.length > 36 ? (
                    <>
                      {truncate(blog.title, 36)}{" "}
                      <button
                        onClick={() => {
                          setPopupContent(blog.title);
                          setPopupOpen(true);
                        }}
                        className="text-[#3DA35D] underline"
                        aria-label={`Show full title for ${blog.title}`}
                      >
                        more
                      </button>
                    </>
                  ) : (
                    blog.title
                  )}
                </h3>

                <p className="font-poppins text-gray-600 flex-1">
                  {blog.description.length > 96 ? (
                    <>
                      {truncate(blog.description, 96)}{" "}
                      <button
                        onClick={() => {
                          setPopupContent(blog.description);
                          setPopupOpen(true);
                        }}
                        className="text-[#3DA35D] underline"
                        aria-label={`Show full description for ${blog.title}`}
                      >
                        more
                      </button>
                    </>
                  ) : (
                    blog.description
                  )}
                </p>

                {/* Chips */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {blog.categories.map((c) => (
                    <span
                      className="font-poppins text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700"
                      key={c.slug}
                    >
                      {c.name}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Link
                    href={`/article/${blog.slug}`}
                    target="_blank"
                    className="font-poppins cursor-pointer inline-flex items-center justify-center gap-2 rounded-md bg-[#c5368f] text-white py-2.5 hover:brightness-95"
                  >
                    <IconExternal />
                    Visit
                  </Link>
                  <Link
                    href={`/admin/addBlogs?edit=${blog.slug}`}
                    className="font-poppins inline-flex items-center cursor-pointer justify-center gap-2 rounded-md bg-[#263E4D] text-white py-2.5 hover:bg-[#1a2834]"
                  >
                    <IconEdit />
                    Edit
                  </Link>
                </div>

                {/* Publish/Draft toggle */}
                <button
                  onClick={() => togglePublished(blog._id)}
                  disabled={toggleLoadingIds.has(blog._id)}
                  className={`mt-4 w-full rounded-md py-2.5 font-poppins font-semibold transition
                    ${
                      blog.published
                        ? "bg-[#278394] text-white hover:bg-[#227280]"
                        : "bg-gray-500 text-white hover:bg-gray-400"
                    }`}
                >
                  {toggleLoadingIds.has(blog._id) ? (
                    <div className="flex justify-center">
                      <Spinner tiny />
                    </div>
                  ) : blog.published ? (
                    "Published"
                  ) : (
                    "Draft"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {popupOpen && (
        <>
          <button
            aria-hidden
            onClick={() => setPopupOpen(false)}
            className="fixed inset-0 bg-black/40 z-40"
          />
          <div className="fixed z-50 top-1/2 left-1/2 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow p-6">
            <h2 className="font-playfair text-xl text-[#263E4D] mb-3">
              Full Text
            </h2>
            <p className="font-poppins text-gray-700 whitespace-pre-line">
              {popupContent}
            </p>
            <div className="mt-6 text-right">
              <button
                onClick={() => setPopupOpen(false)}
                className="font-poppins rounded-md bg-[#263E4D] text-white px-4 py-2 hover:bg-[#1a2834]"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* --------------------- UI helpers --------------------- */

function Spinner({ tiny = false }: { tiny?: boolean }) {
  const size = tiny ? "h-4 w-4" : "h-6 w-6";
  return (
    <svg
      className={`animate-spin ${size}`}
      viewBox="0 0 24 24"
      aria-label="spinner"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
      />
    </svg>
  );
}

/* Inline icons — no extra dependencies */
function IconStarOutline({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`h-5 w-5 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeWidth="2"
        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
      />
    </svg>
  );
}
function IconStarSolid({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`h-5 w-5 ${className}`}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeWidth="2"
        d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 6V4h4v2"
      />
    </svg>
  );
}
function IconExternal() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path strokeWidth="2" d="M14 3h7v7M10 14L21 3M21 10v11H3V3h11" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path strokeWidth="2" d="M12 20h9" />
      <path
        strokeWidth="2"
        d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
      />
    </svg>
  );
}
