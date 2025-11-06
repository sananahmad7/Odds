"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Head from "next/head";
import { format } from "date-fns";

// Type definitions
interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ContentBlock {
  id: number;
  type: "heading" | "subheading" | "text" | "image";
  content: string;
  description: string | null;
  order: number;
}

interface Article {
  id: number;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  isFeatured: boolean | null;
  published: boolean;
  categories: Category[];
  contentBlocks: ContentBlock[];
  metaTags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch article data
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/getBlog/${slug}`);
        if (!response.ok) {
          throw new Error("Failed to fetch article");
        }
        const data: Article = await response.json();
        setArticle(data);
        setLoading(false);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  // Update metadata when article data is loaded
  useEffect(() => {
    if (article) {
      // Update document title
      document.title = article.title || "DGenSports Article";

      // Update meta description
      const metaDescription = document.querySelector(
        'meta[name="description"]'
      );
      if (metaDescription) {
        metaDescription.setAttribute(
          "content",
          article.description || "Read the latest from DGenSports."
        );
      } else {
        const newMeta = document.createElement("meta");
        newMeta.name = "description";
        newMeta.content =
          article.description || "Read the latest from DGenSports.";
        document.head.appendChild(newMeta);
      }

      // Update meta keywords
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute(
          "content",
          article.metaTags?.join(", ") || ""
        );
      } else {
        const newMeta = document.createElement("meta");
        newMeta.name = "keywords";
        newMeta.content = article.metaTags?.join(", ") || "";
        document.head.appendChild(newMeta);
      }

      // Update Open Graph meta tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute("content", article.title || "DGenSports Article");
      } else {
        const newMeta = document.createElement("meta");
        newMeta.setAttribute("property", "og:title");
        newMeta.content = article.title || "DGenSports Article";
        document.head.appendChild(newMeta);
      }

      const ogDescription = document.querySelector(
        'meta[property="og:description"]'
      );
      if (ogDescription) {
        ogDescription.setAttribute(
          "content",
          article.description || "Read the latest from DGenSports."
        );
      } else {
        const newMeta = document.createElement("meta");
        newMeta.setAttribute("property", "og:description");
        newMeta.content =
          article.description || "Read the latest from DGenSports.";
        document.head.appendChild(newMeta);
      }

      if (article.thumbnail) {
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) {
          ogImage.setAttribute("content", article.thumbnail);
        } else {
          const newMeta = document.createElement("meta");
          newMeta.setAttribute("property", "og:image");
          newMeta.content = article.thumbnail;
          document.head.appendChild(newMeta);
        }
      }

      // Update Twitter Card meta tags
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) {
        twitterTitle.setAttribute(
          "content",
          article.title || "DGenSports Article"
        );
      } else {
        const newMeta = document.createElement("meta");
        newMeta.name = "twitter:title";
        newMeta.content = article.title || "DGenSports Article";
        document.head.appendChild(newMeta);
      }

      const twitterDescription = document.querySelector(
        'meta[name="twitter:description"]'
      );
      if (twitterDescription) {
        twitterDescription.setAttribute(
          "content",
          article.description || "Read the latest from DGenSports."
        );
      } else {
        const newMeta = document.createElement("meta");
        newMeta.name = "twitter:description";
        newMeta.content =
          article.description || "Read the latest from DGenSports.";
        document.head.appendChild(newMeta);
      }

      const twitterCard = document.querySelector('meta[name="twitter:card"]');
      if (!twitterCard) {
        const newMeta = document.createElement("meta");
        newMeta.name = "twitter:card";
        newMeta.content = "summary_large_image";
        document.head.appendChild(newMeta);
      }

      if (article.thumbnail) {
        const twitterImage = document.querySelector(
          'meta[name="twitter:image"]'
        );
        if (twitterImage) {
          twitterImage.setAttribute("content", article.thumbnail);
        } else {
          const newMeta = document.createElement("meta");
          newMeta.name = "twitter:image";
          newMeta.content = article.thumbnail;
          document.head.appendChild(newMeta);
        }
      }
    }
  }, [article]);

  if (loading) {
    return (
      <div className="w-full">
        {/* Hero Section Skeleton */}
        <div className="relative h-screen w-full">
          {/* Navbar Placeholder */}
          <div
            className="fixed top-0 left-0 right-0 z-50"
            style={{ backgroundColor: "rgba(36, 37, 124, 0.45)" }}
          >
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex gap-4">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="h-6 w-20 bg-gray-200 rounded animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Static Slide Skeleton */}
          <div className="relative h-full w-full overflow-hidden">
            <div className="absolute inset-0 w-full h-full">
              {/* Background image placeholder */}
              <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>

              {/* Content Placeholder */}
              <div className="relative z-10 h-full flex items-end">
                <div className="container mx-auto px-4 pb-16 md:pb-24">
                  <div className="max-w-2xl space-y-4">
                    <div className="h-6 w-24 bg-gray-200 rounded-sm animate-pulse"></div>
                    <div className="h-12 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section Skeleton */}
        <div
          className="container mx-auto px-4 py-10 md:py-16"
          style={{ backgroundColor: "#FAFAFA" }}
        >
          <div className="max-w-4xl mx-auto space-y-8">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="space-y-4">
                <div className="h-8 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-64 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Error Loading Article</title>
          <meta
            name="description"
            content="An error occurred while loading the article."
          />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </Head>
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ color: "#C83495" }}
        >
          {error}
        </div>
      </>
    );
  }

  if (!article) {
    return (
      <>
        <Head>
          <title>Article Not Found</title>
          <meta
            name="description"
            content="The requested article could not be found."
          />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </Head>
        <div className="min-h-screen flex items-center justify-center">
          Article not found
        </div>
      </>
    );
  }

  // Construct the share URL
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = article.title || "Check out this article on DGenSports!";

  return (
    <div className="w-full">
      {/* SEO Meta Tags */}
      <Head>
        <title>{article.title || "DGenSports Article"}</title>
        <meta
          name="description"
          content={article.description || "Read the latest from DGenSports."}
        />
        <meta name="keywords" content={article.metaTags?.join(", ") || ""} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Hero Section */}
      <div className="relative h-screen w-full">
        {/* Static Slide */}
        <div className="relative h-full w-full overflow-hidden">
          <div className="absolute inset-0 w-full h-full">
            {/* Background image with overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${article.thumbnail})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex items-end">
              <div className="container mx-auto px-4 pb-16 md:pb-24">
                {/* Article Preview */}
                <div className="text-white max-w-2xl">
                  <span
                    className="inline-block px-3 py-1 rounded-md text-sm mb-4"
                    style={{ backgroundColor: "#25818F" }}
                  >
                    {article.categories.length > 0
                      ? article.categories[0].name
                      : "General"}
                  </span>

                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
                    {article.title}
                  </h1>

                  <p className="text-sm md:text-base mb-6 text-gray-100">
                    {article.description.length > 150
                      ? `${article.description.substring(0, 150)}...`
                      : article.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-100 text-sm">
                      {format(new Date(article.publishedAt), "MMMM d, yyyy")}
                    </p>
                    {article.isFeatured && (
                      <span
                        className="text-sm px-3 py-1 rounded-full"
                        style={{ backgroundColor: "#C83495", color: "white" }}
                      >
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div
        className="container mx-auto px-4 py-10 md:py-16"
        style={{ backgroundColor: "#FAFAFA" }}
      >
        <div className="max-w-4xl mx-auto">
          {article.contentBlocks.map((block: ContentBlock) => (
            <div key={block.id} className="mb-8">
              {block.type === "heading" && (
                <h2
                  className="text-2xl md:text-3xl font-bold mb-4"
                  style={{ color: "#111827" }}
                >
                  {block.content}
                </h2>
              )}
              {block.type === "subheading" && (
                <h3
                  className="text-xl md:text-2xl font-semibold mb-3"
                  style={{ color: "#111827" }}
                >
                  {block.content}
                </h3>
              )}
              {block.type === "text" && (
                <p
                  className="text-base md:text-lg leading-relaxed mb-4"
                  style={{ color: "#111827" }}
                >
                  {block.content}
                </p>
              )}
              {block.type === "image" && (
                <div className="mb-4">
                  <img
                    src={block.content}
                    alt={block.description || "Article image"}
                    className="w-full h-auto rounded-lg shadow-md object-cover"
                  />
                  {block.description && (
                    <p className="text-gray-500 text-sm mt-2 italic text-center">
                      {block.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Meta Tags Section */}
          {article.metaTags && article.metaTags.length > 0 && (
            <div className="mb-6 mt-8">
              <div className="flex flex-wrap gap-2">
                {article.metaTags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="inline-block px-4 py-1.5 rounded-full text-sm"
                    style={{ backgroundColor: "#25818F", color: "white" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Sharing Section */}
          <div className="flex gap-4 mt-8">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                shareUrl
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-white px-4 py-2 rounded-md text-sm transition-colors"
              style={{ backgroundColor: "#24257C" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#C83495")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#24257C")
              }
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z" />
              </svg>
              Share on Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                shareUrl
              )}&text=${encodeURIComponent(shareTitle)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-white px-4 py-2 rounded-md text-sm transition-colors"
              style={{ backgroundColor: "#24257C" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#C83495")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#24257C")
              }
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
              Share on Twitter
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
