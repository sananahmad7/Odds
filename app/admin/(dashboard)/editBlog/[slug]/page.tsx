// app/admin/(dashboard)/editBlog/[slug]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import BlogEditor from "@/components/admin/BlogEditor";
import { FiSave } from "react-icons/fi";

type League = "NFL" | "NBA" | "NCAAF" | "NCAAB" | "MLB" | "UFC";

type ApiContentBlock = {
  id: number;
  type: "heading" | "subheading" | "text" | "image";
  content: string;
  description: string | null;
  order: number;
};

type ApiArticle = {
  id: number;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string; // ISO
  isFeatured: boolean | null;
  published: boolean;
  league: League;
  contentBlocks: ApiContentBlock[];
  metaTags: string[];
  createdAt: string;
  updatedAt: string;
};

type EditorBlock = {
  id: string; // editor uses string ids; we’ll map from number
  type: "heading" | "subheading" | "text" | "image";
  content: string;
  description?: string;
};

export default function EditBlogPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const { register, handleSubmit, setValue, watch, reset } = useForm();
  const [imagePreview, setImagePreview] = useState<string>("");
  const [content, setContent] = useState<EditorBlock[]>([]);
  const [publishDate, setPublishDate] = useState<Date>(new Date());
  const [metaTags, setMetaTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [article, setArticle] = useState<ApiArticle | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Cloudinary (env)
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

  const leagueOptions: League[] = useMemo(
    () => ["NFL", "NBA", "NCAAF", "NCAAB", "MLB", "UFC"],
    []
  );

  // Load article by slug
  useEffect(() => {
    if (!slug) return;
    setFetching(true);
    (async () => {
      try {
        const res = await fetch(`/api/getBlog/${slug}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || "Failed to fetch article");
        }
        const a: ApiArticle = await res.json();

        setArticle(a);
        reset({
          title: a.title,
          description: a.description,
          status: a.published ? "published" : "draft",
          thumbnail: a.thumbnail,
          league: a.league,
          metaTags: a.metaTags ?? [],
        });

        setMetaTags(a.metaTags ?? []);
        setPublishDate(new Date(a.publishedAt));
        setImagePreview(a.thumbnail || "");

        // Map API blocks => editor blocks
        const mapped: EditorBlock[] = (a.contentBlocks || [])
          .sort((x, y) => x.order - y.order)
          .map((b) => ({
            id: String(b.id),
            type: b.type,
            content: b.content,
            description: b.description ?? undefined,
          }));
        setContent(mapped);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load article");
      } finally {
        setFetching(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Cloudinary upload
  const handleThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toast.error("Cloudinary env vars missing");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", UPLOAD_PRESET);
      const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
      const { data } = await axios.post(url, form);
      setValue("thumbnail", data.secure_url);
      setImagePreview(data.secure_url);
      toast.success("Image uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // tags add/remove
  const onTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const t = tagInput.trim();
      if (t && !metaTags.includes(t)) {
        const next = [...metaTags, t];
        setMetaTags(next);
        setValue("metaTags", next);
      }
      setTagInput("");
    }
  };
  const removeTag = (i: number) => {
    const next = metaTags.filter((_, idx) => idx !== i);
    setMetaTags(next);
    setValue("metaTags", next);
  };

  // submit
  const onSubmit = async (data: any) => {
    if (!article) return;
    setSubmitting(true);
    try {
      const published = data.status === "published";
      const payload = {
        title: data.title,
        description: data.description,
        thumbnail: data.thumbnail || imagePreview || "",
        publishDate,
        metaTags,
        published,
        isFeatured: article.isFeatured ?? false, // keep existing flag
        league: data.league as League,
        // Flatten editor blocks
        content: content.map((b) => ({
          type: b.type,
          content: b.content,
          description: b.description ?? null,
        })),
        // Let the server recompute slug if title changed (we also pass 'slug' if you like):
        slug: data.title
          ? data.title
              .toLowerCase()
              .trim()
              .replace(/[\s_]+/g, "-")
              .replace(/[^\w-]+/g, "")
              .replace(/--+/g, "-")
              .replace(/^-+|-+$/g, "")
          : article.slug,
      };

      const res = await axios.put(`/api/updateBlog/${article.id}`, payload);
      if (res.status >= 200 && res.status < 300) {
        toast.success("Blog updated");
        router.push("/admin/blogs");
      } else {
        throw new Error("Update failed");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.error || err?.message || "Failed to update blog"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-gray-500">
        Loading blog…
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-pink-600">
        Article not found
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 bg-white">
      <Toaster position="top-right" />
      <h1 className="font-playfair text-4xl md:text-5xl mt-10 text-[#263E4D]">
        Edit Blog
      </h1>
      <p className="font-poppins text-gray-600 mt-2 mb-8">
        Update your article details.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-poppins text-gray-700 mb-2">
            Title<span className="text-red-500"> *</span>
          </label>
          <input
            {...register("title", { required: true })}
            defaultValue={article.title}
            className="w-full font-poppins p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-white focus:border-black transition-all"
            placeholder="Enter blog title"
          />
        </div>

        {/* Content editor modal */}
        <div>
          {isOpen ? (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white shadow-2xl w-full max-w-6xl flex flex-col h-[90vh] rounded-xl overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="font-playfair text-2xl text-gray-900">
                    Edit Content
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="bg-[#263E4D] text-white px-5 py-2 rounded-lg hover:bg-[#1a2834] transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <FiSave className="text-lg" />
                    <span className="font-poppins">Save Content</span>
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  <BlogEditor content={content} setContent={setContent} />
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 px-4 py-3 w-full justify-center bg-[#263E4D] hover:bg-[#1a2834] cursor-pointer text-white rounded-lg transition-colors text-lg"
            >
              Add / Edit Content
            </button>
          )}
        </div>

        {/* League (enum) */}
        <div>
          <label className="block text-sm font-poppins text-gray-700 mb-2">
            League<span className="text-red-500"> *</span>
          </label>
          <select
            {...register("league", { required: true })}
            defaultValue={article.league}
            className="w-full font-poppins p-3 border-2 border-gray-200 rounded-lg"
          >
            {leagueOptions.map((lv) => (
              <option key={lv} value={lv}>
                {lv}
              </option>
            ))}
          </select>
        </div>

        {/* Publish date + Thumbnail */}
        <div className="flex gap-4 w-full justify-between items-start">
          <div className="w-[50%]">
            <label className="block text-sm font-medium text-gray-700 mb-2 font-orbitron">
              Publish Date
            </label>
            <DatePicker
              selected={publishDate}
              onChange={(d) => d && setPublishDate(d)}
              className="w-full py-3 pl-3 pr-20 border-2 border-gray-200 rounded-lg"
              dateFormat="MMMM d, yyyy"
            />
          </div>
          <div className="w-[50%] text-start">
            <label className="block text-sm font-medium text-gray-700 mb-2 font-orbitron">
              Thumbnail
            </label>
            <div className="flex items-center space-x-14 relative bottom-px">
              <input
                type="file"
                onChange={handleThumbnailChange}
                className="hidden"
                id="thumbnail"
                accept="image/*"
              />
              <label
                htmlFor="thumbnail"
                className={`px-16 py-3 font-orbitron rounded-md cursor-pointer transition-colors ${
                  uploading
                    ? "bg-gray-500 text-gray-200 cursor-wait"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {uploading ? "Uploading..." : "Choose Image"}
              </label>
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-md border-2 border-gray-200 relative bottom-px"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 text-xs flex items-center justify-center rounded-md border-2 border-gray-200 relative bottom-px">
                  <p className="text-center">
                    No Image <br />
                    selected
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status (published/draft) */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <label className="flex-1 cursor-pointer font-orbitron">
              <input
                type="radio"
                {...register("status")}
                value="published"
                className="hidden peer"
                defaultChecked={article.published}
              />
              <div className="p-4 text-center border-2 border-gray-200 rounded-lg peer-checked:border-white peer-checked:bg-gray-900 peer-checked:text-gray-100 transition-all hover:bg-gray-100 hover:text-gray-900">
                <span className="font-medium">Publish</span>
              </div>
            </label>
            <label className="flex-1 cursor-pointer font-orbitron">
              <input
                type="radio"
                {...register("status")}
                value="draft"
                className="hidden peer"
                defaultChecked={!article.published}
              />
              <div className="p-4 text-center border-2 border-gray-200 rounded-lg peer-checked:border-white peer-checked:bg-gray-900 peer-checked:text-gray-100 transition-all hover:bg-gray-100 hover:text-gray-900">
                <span className="font-medium">Save as Draft</span>
              </div>
            </label>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-orbitron">
            Enter Meta Description
          </label>
          <textarea
            {...register("description", { required: true })}
            defaultValue={article.description}
            rows={4}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-white focus:border-black transition-all"
            placeholder="Enter Meta description"
          />
        </div>

        {/* Meta Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-orbitron">
            Meta Tags
          </label>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={onTagKey}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-white focus:border-black transition-all"
            placeholder="Enter tags (press enter to add)"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {metaTags.map((tag, i) => (
              <span
                key={i}
                className="bg-gray-300 px-3 py-1 rounded-lg text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(i)}
                  className="text-gray-500 text-lg relative bottom-[1px] cursor-pointer hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={submitting}
            className={`px-8 py-3 font-poppins text-lg font-semibold rounded-lg flex items-center justify-center transition-all ${
              submitting
                ? "bg-gray-500 cursor-wait text-gray-200"
                : "bg-[#263E4D] hover:bg-[#1a2834] text-white cursor-pointer"
            }`}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
