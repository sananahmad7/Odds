"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import CreatableSelect from "react-select/creatable";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiSave } from "react-icons/fi";
import BlogEditor from "@/components/admin/BlogEditor";
import { blogArticles, type BlogArticle } from "@/dummyData";

type Option = { value: string; label: string };

export default function AdminAddBlogPage() {
  const { register, handleSubmit, setValue, watch, reset } = useForm();
  const [imagePreview, setImagePreview] = useState<string>("");
  const [content, setContent] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [publishDate, setPublishDate] = useState<Date>(new Date());
  const [metaTags, setMetaTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Derive existing categories from dummyData
  const existingCategories: Option[] = useMemo(() => {
    const set = new Set<string>();
    blogArticles.forEach((b) => b.categories.forEach((c) => set.add(c.name)));
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b, "en"))
      .map((name) => ({ value: name, label: name }));
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Thumbnail picker (frontend only – no upload). Stores object URL.
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    // Revoke previous preview to avoid memory leaks
    if (imagePreview) URL.revokeObjectURL(imagePreview);

    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setValue("thumbnail", url);
    setUploading(false);
    toast.success("Image selected!");
  };

  // Add new category option inline
  const handleCreateCategory = (inputValue: string) => {
    const newCategory = { value: inputValue, label: inputValue };
    const current = (watch("categories") as Option[] | undefined) ?? [];
    setValue("categories", [...current, newCategory]);
  };

  // Meta tags input (Enter/Comma to add)
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

  // Demo-only submit
  const onSubmit = (data: any) => {
    setSubmitting(true);

    // Basic validation (mirror your prev logic)
    if (
      !data.title ||
      !data.categories ||
      !data.status ||
      !data.thumbnail ||
      !metaTags.length ||
      !publishDate
    ) {
      toast.error("Please fill out all required fields");
      setSubmitting(false);
      return;
    }

    // Normalize categories for your eventual backend
    const categories = (data.categories as Option[]).map((c) => ({
      name: c.label,
      slug: c.label
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, ""),
    }));
    const draft = data.status === "draft";
    const published = !draft;

    const payload = {
      ...data,
      categories,
      published,
      draft,
      content,
      publishDate,
      metaTags,
    };

    // No backend call now. Just log + toast.
    console.log("📦 Demo submit payload:", payload);
    toast.success("(Demo) Blog ready to submit!");
    setSubmitting(false);

    // Optional: reset the form for demo
    reset();
    setImagePreview("");
    setMetaTags([]);
    setContent([]);
    setPublishDate(new Date());
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 bg-white">
      <Toaster position="top-right" />

      {/* Header */}
      <h1 className="font-playfair text-4xl md:text-5xl mt-10 text-[#263E4D]">
        Create New Blog
      </h1>
      <p className="font-poppins text-gray-600 mt-2 mb-8">
        Compose your article content, set categories, meta, and schedule the
        publish date.
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

        {/* Content (Quill) */}
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

        {/* Categories */}
        {isClient && (
          <div>
            <label className="block text-sm font-poppins text-gray-700 mb-2">
              Categories<span className="text-red-500"> *</span>
            </label>
            <CreatableSelect
              isMulti
              options={existingCategories}
              onCreateOption={handleCreateCategory}
              onChange={(selected) => setValue("categories", selected)}
              value={watch("categories") as Option[] | undefined}
              placeholder="Search or add categories..."
              styles={{
                control: (base) => ({
                  ...base,
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  minHeight: "48px",
                  boxShadow: "none",
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: "#f3f4f6",
                  borderRadius: "6px",
                }),
                multiValueLabel: (base) => ({ ...base, color: "#111827" }),
                menu: (base) => ({
                  ...base,
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }),
              }}
            />
          </div>
        )}

        {/* Date + Thumbnail */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            <label className="block text-sm font-poppins text-gray-700 mb-2">
              Publish Date<span className="text-red-500"> *</span>
            </label>
            <DatePicker
              selected={publishDate}
              onChange={(date) => {
                const d = date || new Date();
                setPublishDate(d);
                setValue("publishDate", d);
              }}
              className="w-full font-poppins py-3 px-3 border-2 border-gray-200 rounded-lg"
              dateFormat="MMMM d, yyyy"
            />
          </div>

          <div className="md:w-1/2">
            <label className="block text-sm font-poppins text-gray-700 mb-2">
              Thumbnail<span className="text-red-500"> *</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                onChange={handleThumbnailChange}
                className="hidden"
                id="thumbnail"
                accept="image/*"
              />
              <label
                htmlFor="thumbnail"
                className={`px-5 py-2 font-poppins rounded-md cursor-pointer transition-colors ${
                  uploading
                    ? "bg-gray-500 text-gray-200 cursor-wait"
                    : "bg-[#263E4D] text-white hover:bg-[#1a2834]"
                }`}
              >
                {uploading ? "Uploading..." : "Choose Image"}
              </label>

              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-md border-2 border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 text-xs flex items-center justify-center rounded-md border-2 border-gray-200">
                  <p className="text-center font-poppins">
                    No Image <br /> selected
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-3">
          <label className="block text-sm font-poppins text-gray-700">
            Status<span className="text-red-500"> *</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex-1 cursor-pointer">
              <input
                type="radio"
                {...register("status")}
                value="published"
                className="hidden peer"
              />
              <div className="p-4 text-center border-2 border-gray-200 rounded-lg peer-checked:border-white peer-checked:bg-[#263E4D] peer-checked:text-white transition-all hover:bg-gray-50">
                <span className="font-poppins font-medium">Publish</span>
              </div>
            </label>
            <label className="flex-1 cursor-pointer">
              <input
                type="radio"
                {...register("status")}
                value="draft"
                className="hidden peer"
              />
              <div className="p-4 text-center border-2 border-gray-200 rounded-lg peer-checked:border-white peer-checked:bg-[#263E4D] peer-checked:text-white transition-all hover:bg-gray-50">
                <span className="font-poppins font-medium">Save as Draft</span>
              </div>
            </label>
          </div>
        </div>

        {/* Meta Description */}
        <div>
          <label className="block text-sm font-poppins text-gray-700 mb-2">
            Meta Description<span className="text-red-500"> *</span>
          </label>
          <textarea
            {...register("description", { required: true })}
            rows={4}
            className="w-full font-poppins p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-white focus:border-black transition-all"
            placeholder="Enter meta description"
          />
        </div>

        {/* Meta Tags */}
        <div>
          <label className="block text-sm font-poppins text-gray-700 mb-2">
            Meta Tags<span className="text-red-500"> *</span>
          </label>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInput}
            className="w-full font-poppins p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-white focus:border-black transition-all"
            placeholder="Enter tags (press Enter or , to add)"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {metaTags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-200 px-3 py-1 rounded-lg text-sm flex items-center gap-2 font-poppins"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="text-gray-600 text-lg leading-none hover:text-gray-800 cursor-pointer"
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
            aria-label="Submit blog form"
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
