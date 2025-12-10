"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import Select from "react-select"; // ⬅️ use non-creatable single-select
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiSave } from "react-icons/fi";
import BlogEditor from "@/components/admin/BlogEditor";
import axios from "axios";

type Option = { value: string; label: string };

// Prisma enum values (keep in sync with schema)
type League = "NFL" | "NBA" | "NCAAF" | "NCAAB" | "MLB" | "UFC";

const LEAGUE_OPTIONS: Option[] = [
  { value: "NFL", label: "NFL" },
  { value: "NBA", label: "NBA" },
  { value: "NCAAF", label: "NCAAF" },
  { value: "NCAAB", label: "NCAAB" },
  { value: "MLB", label: "MLB" },
  { value: "UFC", label: "UFC" },
];

export default function AdminAddBlogPage() {
  const { register, handleSubmit, setValue, watch, reset } = useForm();
  const [imagePreview, setImagePreview] = useState<string>("");
  const [content, setContent] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [publishDate, setPublishDate] = useState<Date>(new Date());
  const [metaTags, setMetaTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // modal for rich editor
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string
      );

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string;
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

      const response = await axios.post(uploadUrl, formData);

      setValue("thumbnail", response.data.secure_url);
      setImagePreview(response.data.secure_url);
      toast.success("Image uploaded successfully!");
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      toast.error("Image upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Meta tags input
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !metaTags.includes(newTag)) {
        const next = [...metaTags, newTag];
        setMetaTags(next);
        setValue("metaTags", next);
      }
      setTagInput("");
    }
  };

  const removeTag = (indexToRemove: number) => {
    const next = metaTags.filter((_, i) => i !== indexToRemove);
    setMetaTags(next);
    setValue("metaTags", next);
  };

  // Submit form data to API — now REQUIRES league (enum)
  const onSubmit = async (data: any) => {
    setSubmitting(true);

    // league comes from react-select via setValue/watch (not a native input)
    const leagueOpt = watch("league") as Option | undefined;

    if (!data.title || !leagueOpt) {
      toast.error("Please fill out the title and choose a league.");
      setSubmitting(false);
      return;
    }

    const league = leagueOpt.value as League;

    const draft = data.status === "draft";
    const published = !draft;
    const slug = data.title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");

    const payload = {
      ...data,
      slug,
      league, // ⬅️ send league (enum)
      published,
      content, // editor blocks (your API will map to contentBlocks)
      publishedAt: publishDate.toISOString(), // ⬅️ send as publishedAt
      metaTags,
      thumbnail: data.thumbnail || "https://via.placeholder.com/400x300",
    };

    try {
      await axios.post("/api/addBlog", payload);
      toast.success("Blog created successfully!");
      reset();
      setImagePreview("");
      setMetaTags([]);
      setContent([]);
      setPublishDate(new Date());
      setValue("league", null); // clear league select
    } catch (error) {
      toast.error("Failed to create blog");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 bg-white mb-5">
      <Toaster position="top-right" />

      {/* Header */}
      <h1 className="font-playfair text-4xl md:text-5xl mt-10 text-[#263E4D]">
        Create New Blog
      </h1>
      <p className="font-poppins text-gray-600 mt-2 mb-8">
        Compose your article content, set <strong>league</strong>, meta, and
        schedule the publish date.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-poppins text-gray-700 mb-2">
            Title<span className="text-red-500"> *</span>
          </label>
          <input
            {...register("title", { required: true })}
            className="w-full font-poppins p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-white focus:border-black transition-all"
            placeholder="Enter blog title"
          />
        </div>

        {/* Content (Quill/blocks) */}
        <div>
          {isOpen ? (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white shadow-2xl w-full max-w-6xl flex flex-col h-[90vh] rounded-xl overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="font-playfair text-2xl text-gray-900">
                    Add Blog Content
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
              {/* icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
              <span className="font-poppins">Add Blog Content</span>
            </button>
          )}
        </div>

        {/* League (replaces Categories) */}
        {isClient && (
          <div>
            <label className="block text-sm font-poppins text-gray-700 mb-2">
              League<span className="text-red-500"> *</span>
            </label>
            <Select
              options={LEAGUE_OPTIONS}
              isSearchable
              onChange={(opt) => setValue("league", opt ?? null)}
              value={(watch("league") as Option | null) ?? null}
              placeholder="Select a league…"
              // simple light styles to match your UI
              styles={{
                control: (base) => ({
                  ...base,
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  minHeight: "48px",
                  boxShadow: "none",
                }),
                menu: (base) => ({
                  ...base,
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                }),
              }}
            />
          </div>
        )}

        <div className="flex gap-4 w-full justify-between items-start">
          <div className="w-[50%]">
            <label className="block text-sm font-medium text-gray-700 mb-2 font-orbitron">
              Publish Date
            </label>
            <DatePicker
              selected={publishDate}
              onChange={(date) => {
                if (date) {
                  setPublishDate(date);
                  setValue("publishDate", date);
                }
              }}
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
                  isLoading
                    ? "bg-gray-500 text-gray-200 cursor-wait"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {isLoading ? "Uploading..." : "Choose Image"}
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

        {/* Publish/Draft */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <label className="flex-1 cursor-pointer font-orbitron">
              <input
                type="radio"
                {...register("status")}
                value="published"
                className="hidden peer"
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
            onKeyDown={handleTagInput}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-white focus:border-black transition-all"
            placeholder="Enter tags (press enter to add)"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {metaTags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-300 px-3 py-1 rounded-lg text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="text-gray-500 text-lg relative bottom-[1px] cursor-pointer hover:text-gray-700"
                  aria-label={`Remove tag ${tag}`}
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
            } focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2`}
          >
            {submitting && (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {submitting ? "Submitting..." : "Submit (Demo)"}
          </button>
        </div>
      </form>
    </div>
  );
}
