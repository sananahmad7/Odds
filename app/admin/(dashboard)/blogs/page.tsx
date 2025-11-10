"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type FilterKey = "all" | "published" | "draft";

// NEW: League union (matches your Prisma enum)
type League = "NFL" | "NBA" | "NCAAF" | "NCAAB" | "MLB" | "UFC";

// Final, normalized shape used by the UI
type ApiBlog = {
  id: number; // ✅ numeric id
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
  league: League; // ⬅️ replaced categories[]
  isFeatured: boolean;
  published: boolean;
  publishedAt: string; // ISO
};

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<ApiBlog[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [toggleLoadingIds, setToggleLoadingIds] = useState<Set<number>>(
    new Set()
  );
  const [deleteLoadingIds, setDeleteLoadingIds] = useState<Set<number>>(
    new Set()
  );
  const [featuredLoadingIds, setFeaturedLoadingIds] = useState<Set<number>>(
    new Set()
  );

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState<string>("");

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        // NOTE: keep your existing path. If your API is under /api/v1/blog, change here accordingly.
        const res = await fetch("/api/getAllBlogs", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load blogs");

        const raw: any[] = await res.json();

        const ALLOWED: League[] = [
          "NFL",
          "NBA",
          "NCAAF",
          "NCAAB",
          "MLB",
          "UFC",
        ];

        const safeData: ApiBlog[] = raw
          .map((b) => {
            const idCandidate = b?.id ?? b?._id ?? b?.articleId;

            const idNum =
              typeof idCandidate === "number"
                ? idCandidate
                : typeof idCandidate === "string" &&
                  idCandidate.trim() &&
                  /^\d+$/.test(idCandidate.trim())
                ? parseInt(idCandidate.trim(), 10)
                : NaN;

            if (!Number.isInteger(idNum)) {
              console.warn("Skipping blog with invalid id:", idCandidate, b);
              return null;
            }

            // coerce league to our union
            const leagueRaw = String(b.league ?? "").toUpperCase();
            const league: League = (
              ALLOWED.includes(leagueRaw as League) ? leagueRaw : "NFL"
            ) as League;

            return {
              id: idNum,
              slug: String(b.slug ?? ""),
              title: String(b.title ?? ""),
              description: String(b.description ?? ""),
              thumbnail: b.thumbnail ?? "",
              league, // ⬅️ use league
              isFeatured: Boolean(b.isFeatured),
              published: Boolean(b.published),
              publishedAt: String(b.publishedAt ?? ""),
            } as ApiBlog;
          })
          .filter((x): x is ApiBlog => Boolean(x));

        setBlogs(safeData);
      } catch (e: any) {
        console.error(e);
        setErrorMsg(e?.message || "Failed to load blogs.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
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

  const truncate = (str: string, max = 30) =>
    str.length > max ? str.slice(0, max) + "…" : str;

  const withSet = (
    setter: React.Dispatch<React.SetStateAction<Set<number>>>,
    id: number,
    add: boolean
  ) =>
    setter((prev) => {
      const s = new Set(prev);
      add ? s.add(id) : s.delete(id);
      return s;
    });

  const togglePublished = async (id: number) => {
    withSet(setToggleLoadingIds, id, true);
    try {
      const res = await fetch(`/api/togglePublished/${id}`, { method: "PUT" });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to update published status.");
      }

      const updated: { id: number; published: boolean } = await res.json();
      setBlogs((prev) =>
        prev.map((b) =>
          b.id === updated.id ? { ...b, published: updated.published } : b
        )
      );
    } catch (err: any) {
      alert(err?.message || "Failed to update published status.");
    } finally {
      withSet(setToggleLoadingIds, id, false);
    }
  };

  const toggleFeatured = async (id: number) => {
    withSet(setFeaturedLoadingIds, id, true);
    try {
      const res = await fetch(`/api/toggleFeatured/${id}`, { method: "PUT" });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = body?.error || "Failed to update featured status.";
        alert(msg);
        return;
      }

      const updated: { id: number; isFeatured: boolean } = await res.json();
      setBlogs((prev) =>
        prev.map((b) =>
          b.id === updated.id ? { ...b, isFeatured: updated.isFeatured } : b
        )
      );
    } catch (err: any) {
      alert(err?.message || "Failed to update featured status.");
    } finally {
      withSet(setFeaturedLoadingIds, id, false);
    }
  };

  const deleteBlog = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;

    const intId = Number(id);
    if (!Number.isInteger(intId)) {
      alert("Invalid numeric id on this blog; cannot delete.");
      return;
    }

    withSet(setDeleteLoadingIds, intId, true);
    try {
      const res = await fetch(`/api/deleteBlog/${intId}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to delete blog.");
      }
      setBlogs((prev) => prev.filter((b) => b.id !== intId));
    } catch (err: any) {
      alert(err?.message || "Failed to delete blog.");
    } finally {
      withSet(setDeleteLoadingIds, intId, false);
    }
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
      <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl mt-10 text-[#263E4D]">
        Blogs Management
      </h1>
      <p className="font-poppins text-gray-600 mt-2 mb-8 max-w-2xl">
        Filter, edit, feature, publish or delete your content. This admin view
        reads from your API.
      </p>

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

      {loading ? (
        <div className="flex items-center gap-3 py-24 text-gray-500 font-poppins">
          <Spinner />
          Loading blogs…
        </div>
      ) : errorMsg ? (
        <div className="text-red-600 py-24 font-poppins">{errorMsg}</div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center text-gray-600 py-24 font-poppins">
          No blogs found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden flex flex-col"
            >
              <div className="relative group">
                <img
                  src={blog.thumbnail || "/placeholder.svg"}
                  alt={blog.title}
                  className="w-full h-56 object-cover"
                />
                <div className="absolute inset-x-0 top-0 px-3 py-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => toggleFeatured(blog.id)}
                    disabled={featuredLoadingIds.has(blog.id)}
                    title={
                      blog.isFeatured ? "Remove Featured" : "Mark as Featured"
                    }
                    className="rounded-md bg-white/90 hover:bg-white shadow px-2 py-1"
                  >
                    {featuredLoadingIds.has(blog.id) ? (
                      <Spinner tiny />
                    ) : blog.isFeatured ? (
                      <IconStarSolid className="text-yellow-500" />
                    ) : (
                      <IconStarOutline />
                    )}
                  </button>
                  <button
                    onClick={() => deleteBlog(blog.id, blog.title)}
                    disabled={deleteLoadingIds.has(blog.id)}
                    title="Delete"
                    className="rounded-md bg-white/90 hover:bg-white shadow px-2 py-1"
                  >
                    {deleteLoadingIds.has(blog.id) ? (
                      <Spinner tiny />
                    ) : (
                      <IconTrash />
                    )}
                  </button>
                </div>
              </div>

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

                {/* ⬇️ League pill (replaces categories chips) */}
                <div className="mt-4">
                  <span className="font-poppins text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {blog.league}
                  </span>
                </div>

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
                    href={`/admin/editBlog/${blog.slug}`}
                    className="font-poppins inline-flex items-center cursor-pointer justify-center gap-2 rounded-md bg-[#263E4D] text-white py-2.5 hover:bg-[#1a2834]"
                  >
                    <IconEdit />
                    Edit
                  </Link>
                </div>

                <button
                  onClick={() => togglePublished(blog.id)}
                  disabled={toggleLoadingIds.has(blog.id)}
                  className={`mt-4 w-full rounded-md py-2.5 font-poppins font-semibold transition
                    ${
                      blog.published
                        ? "bg-[#278394] text-white hover:bg-[#227280]"
                        : "bg-gray-500 text-white hover:bg-gray-400"
                    }`}
                >
                  {toggleLoadingIds.has(blog.id) ? (
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
