"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FiPlus, FiX, FiTrash2, FiChevronDown } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { MdOutlineOpenInNew } from "react-icons/md";
import toast, { Toaster } from "react-hot-toast";

import { blogArticles as initialArticles } from "@/dummyData";

// ----- Types (local) -----
type Category = { id: string; name: string; slug: string };

export default function AdminCategoriesPage() {
  // Clone articles locally so we can mutate (feature/publish/delete) in-memory
  const [articles, setArticles] = useState(() => [...initialArticles]);
  const [isMounted, setIsMounted] = useState(false);

  // Categories derived from articles initially (you can add more later)
  const derivedCategories: Category[] = useMemo(() => {
    const set = new Map<string, Category>();
    for (const a of initialArticles) {
      for (const c of a.categories) {
        const slug =
          c.slug ||
          c.name
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "");
        if (!set.has(slug)) {
          set.set(slug, { id: slug, name: c.name, slug });
        }
      }
    }
    return Array.from(set.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "en")
    );
  }, []);

  // Local categories state (start with derived list)
  const [categories, setCategories] = useState<Category[]>(derivedCategories);

  // UI State
  const [hoverDropdown, setHoverDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState<Category>({
    id: "",
    name: "",
    slug: "",
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Button-level “loading” indicators (purely cosmetic)
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [deleteLoadingBlogIds, setDeleteLoadingBlogIds] = useState<Set<string>>(
    new Set()
  );
  const [featuredLoadingBlogIds, setFeaturedLoadingBlogIds] = useState<
    Set<string>
  >(new Set());
  const [toggleDraftLoadingBlogIds, setToggleDraftLoadingBlogIds] = useState<
    Set<string>
  >(new Set());

  // Derive slug on newCategory.name change
  useEffect(() => {
    setNewCategory((prev) => ({
      ...prev,
      slug: prev.name
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^a-z0-9-]/g, ""),
      id:
        prev.slug ||
        prev.name
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/[^a-z0-9-]/g, ""),
    }));
  }, [newCategory.name]);

  // Mount gate (prevents hydration mismatch in some setups)
  useEffect(() => setIsMounted(true), []);

  // useEffect(() => {
  //   const expiryStr = localStorage.getItem("expiryTime");
  //   const token = localStorage.getItem("token");
  //   const expiry = expiryStr ? Number(expiryStr) : undefined; // number | undefined

  //   if (
  //     !token ||
  //     !expiry ||                // guard before comparing
  //     expiry < Date.now() ||
  //     token !== "7a8342f9c1b6e45d8f3a0b2c5e789d3f"
  //   ) {
  //     localStorage.clear();
  //     window.location.href = "/admin/login";
  //   }
  // }, []);

  // Blogs for selected category
  const blogs = useMemo(() => {
    if (!selectedCategory) return [];
    return articles.filter((b) =>
      b.categories.some((c) => {
        const slug =
          c.slug ||
          c.name
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "");
        return slug === selectedCategory;
      })
    );
  }, [articles, selectedCategory]);

  // Utils for setting loading sets
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

  // ----- Category Actions (local only) -----
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const exists = categories.some((c) => c.slug === newCategory.slug);
    if (!newCategory.name.trim()) {
      toast.error("Category name is required.");
      return;
    }
    if (exists) {
      toast.error("A category with this slug already exists.");
      return;
    }
    setCategories((prev) => [
      ...prev,
      { id: newCategory.slug, name: newCategory.name, slug: newCategory.slug },
    ]);
    toast.success("Category created!");
    setShowAddModal(false);
    setNewCategory({ id: "", name: "", slug: "" });
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (!confirm("Delete this category? (Blogs remain untouched)")) return;
    setDeletingCategory(categoryId);
    setTimeout(() => {
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      if (selectedCategory === categoryId) setSelectedCategory(null);
      setDeletingCategory(null);
      toast.success("Category deleted (frontend only).");
    }, 500);
  };

  const handleCategorySelect = (categoryId: string) => {
    setLoadingCategory(categoryId);
    setTimeout(() => {
      setSelectedCategory(categoryId);
      setLoadingCategory(null);
    }, 300);
  };

  // ----- Blog Actions (local only) -----
  const handleDeleteBlog = (blogId: string) => {
    if (!confirm("Permanently remove this blog from the list?")) return;
    withSet(setDeleteLoadingBlogIds, blogId, true);
    setTimeout(() => {
      setArticles((prev) => prev.filter((b) => b._id !== blogId));
      withSet(setDeleteLoadingBlogIds, blogId, false);
      toast.success("Blog removed (frontend only).");
    }, 500);
  };

  const toggleFeatured = (blogId: string) => {
    withSet(setFeaturedLoadingBlogIds, blogId, true);
    setTimeout(() => {
      setArticles((prev) =>
        prev.map((b) =>
          b._id === blogId ? { ...b, isFeatured: !b.isFeatured } : b
        )
      );
      withSet(setFeaturedLoadingBlogIds, blogId, false);
    }, 400);
  };

  const toggleDraft = (blogId: string) => {
    withSet(setToggleDraftLoadingBlogIds, blogId, true);
    setTimeout(() => {
      setArticles((prev) =>
        prev.map((b) =>
          b._id === blogId ? { ...b, published: !b.published } : b
        )
      );
      withSet(setToggleDraftLoadingBlogIds, blogId, false);
    }, 400);
  };

  if (!isMounted) return null;

  return (
    <div>
      <Toaster position="top-right" />
      <div className="min-h-screen max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="font-playfair text-4xl md:text-5xl mt-10 text-[#263E4D]">
              Categories & Blogs Management
            </h1>
            <p className="font-poppins text-gray-600 mt-2 max-w-2xl">
              Manage categories and blog posts. This page uses local dummy data
              only.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#263E4D] text-white px-6 py-3 rounded-xl hover:bg-[#1a2834] transition-all flex items-center gap-2 cursor-pointer mt-2 md:mt-10"
          >
            <FiPlus className="text-lg" />
            <span className="font-poppins">Add Category</span>
          </button>
        </div>

        {/* Categories Dropdown */}
        <div
          className="relative mb-12 max-w-2xl mx-auto"
          onMouseEnter={() => setHoverDropdown(true)}
          onMouseLeave={() => setHoverDropdown(false)}
        >
          <div className="border-2 border-gray-200 h-14 rounded-xl flex items-center justify-between px-6 bg-white cursor-pointer hover:border-[#263E4D] transition-colors select-none">
            <span className="text-gray-700 font-poppins">
              {categories.length
                ? "Select a category"
                : "No categories available"}
            </span>
            <FiChevronDown className="text-gray-500 text-xl" />
          </div>

          {hoverDropdown && (
            <div className="absolute top-full left-0 w-full mt-0 z-50 bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden">
              <div className="max-h-96 overflow-y-auto p-4">
                {categories.length ? (
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((c) => (
                      <div
                        key={c.id}
                        className="p-4 hover:bg-gray-50 rounded-lg transition-all border border-gray-100 relative cursor-pointer flex justify-between items-center"
                        onClick={() => handleCategorySelect(c.id)}
                      >
                        <div>
                          <h3 className="font-poppins font-semibold text-gray-800">
                            {c.name}
                          </h3>
                          <p className="text-sm text-gray-500 font-poppins">
                            {c.slug}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {loadingCategory === c.id ? (
                            <Spinner />
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(c.id);
                              }}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              aria-label={`Delete category ${c.name}`}
                              disabled={deletingCategory === c.id}
                            >
                              {deletingCategory === c.id ? (
                                <Spinner />
                              ) : (
                                <FiTrash2 />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 font-poppins">
                    Create your first category
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Blog Grid */}
        {selectedCategory && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {blogs.length === 0 ? (
              <div className="col-span-full text-center py-24 text-gray-400 text-lg font-poppins">
                No blogs found in this category
              </div>
            ) : (
              blogs.map((blog) => {
                const isDeleting = deleteLoadingBlogIds.has(blog._id);
                const isTogglingFeatured = featuredLoadingBlogIds.has(blog._id);
                const isTogglingDraft = toggleDraftLoadingBlogIds.has(blog._id);
                return (
                  <div
                    key={blog._id}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden flex flex-col"
                  >
                    {/* Thumbnail + overlay */}
                    <div className="relative group">
                      <img
                        src={blog.thumbnail || "/placeholder.svg"}
                        alt={blog.title}
                        className="w-full h-56 object-cover border-b border-gray-200"
                      />
                      <div className="absolute inset-x-0 top-0 px-3 py-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition bg-black/40">
                        {/* Feature */}
                        <button
                          onClick={() => toggleFeatured(blog._id)}
                          disabled={isTogglingFeatured}
                          title={
                            blog.isFeatured
                              ? "Remove Featured"
                              : "Mark as Featured"
                          }
                          className="rounded-md bg-white/90 hover:bg-white shadow px-2 py-1"
                        >
                          {isTogglingFeatured ? (
                            <Spinner tiny />
                          ) : blog.isFeatured ? (
                            <FaStar className="text-yellow-500 h-5 w-5" />
                          ) : (
                            <IconStarOutline />
                          )}
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteBlog(blog._id)}
                          disabled={isDeleting}
                          title="Delete"
                          className="rounded-md bg-white/90 hover:bg-white shadow px-2 py-1"
                        >
                          {isDeleting ? <Spinner tiny /> : <IconTrash />}
                        </button>
                        {/* View */}
                        <Link
                          href={`/article/${blog.slug}`}
                          className="rounded-md bg-white/90 hover:bg-white shadow px-2 py-1"
                          title="Open article"
                          target="_blank"
                        >
                          <MdOutlineOpenInNew className="h-5 w-5" />
                        </Link>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-playfair text-xl text-[#263E4D] mb-2">
                        {blog.title}
                      </h3>
                      <p className="font-poppins text-gray-600 line-clamp-3">
                        {blog.description || "No description available"}
                      </p>

                      {/* Publish/Draft */}
                      <button
                        onClick={() => toggleDraft(blog._id)}
                        disabled={isTogglingDraft}
                        className={`mt-4 w-full rounded-md py-2.5 font-poppins font-semibold transition
                          ${
                            blog.published
                              ? "bg-[#278394] text-white hover:bg-[#227280]"
                              : "bg-gray-500 text-white hover:bg-gray-400"
                          }`}
                      >
                        {isTogglingDraft ? (
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
                );
              })
            )}
          </div>
        )}

        {/* Add Category Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md relative">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close add category modal"
              >
                <FiX className="text-xl text-gray-700 cursor-pointer" />
              </button>
              <h2 className="font-playfair text-2xl mb-6 text-gray-800">
                New Category
              </h2>
              <form onSubmit={handleAddCategory} className="space-y-6">
                <div>
                  <label
                    htmlFor="categoryName"
                    className="block text-sm font-poppins mb-2 text-gray-700"
                  >
                    Category Name
                  </label>
                  <input
                    id="categoryName"
                    type="text"
                    required
                    className="w-full font-poppins p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-white focus:border-black transition-all"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="categorySlug"
                    className="block text-sm font-poppins mb-2 text-gray-700"
                  >
                    Slug
                  </label>
                  <input
                    id="categorySlug"
                    type="text"
                    readOnly
                    className="w-full font-poppins p-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                    value={newCategory.slug}
                    aria-readonly="true"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#263E4D] text-white p-3 rounded-xl hover:bg-[#1a2834] transition-colors font-poppins"
                >
                  Create Category
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- UI helpers ---------------- */

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

function IconStarOutline() {
  return (
    <svg
      className="h-5 w-5"
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
