import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { blogArticles } from "@/dummyData";

// deterministic UTC date (prevents hydration drift)
function stableDate(iso: string) {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type PageProps = {
  // NOTE: params is a Promise in Next's new async dynamic APIs
  params: Promise<{ slug: string }>;
};

// Pre-build static routes from dummy data
export async function generateStaticParams() {
  return blogArticles.map((a) => ({ slug: a.slug }));
}

// Per-article SEO (unwrap params with await)
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = blogArticles.find((a) => a.slug === slug);
  if (!article) return { title: "Article not found" };

  const title = `${article.title} | Odds`;
  const description = article.description;
  const url = `/article/${article.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "article",
      url,
      images: [{ url: article.thumbnail }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [article.thumbnail],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params; // <-- unwrap the Promise
  const article = blogArticles.find((a) => a.slug === slug);
  if (!article) notFound();

  const tags = article.categories.map((c) => c.name);
  const shareUrl = `/article/${article.slug}`; // prefer absolute if you have site URL

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative h-72 md:h-96 w-full overflow-hidden">
        <img
          src={article.thumbnail || "/placeholder.svg"}
          alt={article.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-10 pb-6">
          <div className="flex items-center gap-2 mb-3">
            {article.categories.map((c) => (
              <span
                key={c.slug}
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/80 text-gray-900"
              >
                {c.name}
              </span>
            ))}
          </div>
          <h1 className="text-white text-2xl md:text-4xl font-bold leading-tight max-w-4xl">
            {article.title}
          </h1>
          <p className="text-gray-100 mt-2 text-sm">
            Published {stableDate(article.publishedAt)}
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="px-6 md:px-10 lg:px-20 py-8 md:py-12">
        <article className="prose max-w-3xl prose-gray">
          <p className="text-lg text-gray-700">{article.description}</p>

          {/* Placeholder body until you have full content */}
          <h2>Matchup Breakdown</h2>
          <p>
            This is placeholder content for the full article view. Replace with
            your CMS or longer body. You can include odds tables, charts, and
            tactical angles.
          </p>

          <h3>Key Angles</h3>
          <ul>
            <li>Form & recent performance</li>
            <li>Injuries and rotations</li>
            <li>Pace, efficiency, and situational splits</li>
          </ul>
        </article>

        {/* Tags */}
        <div className="mb-6 mt-8">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-block bg-gray-200 text-gray-700 px-4 py-1.5 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Share */}
        <div className="flex gap-4">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              shareUrl
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
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
            )}&text=${encodeURIComponent(article.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition-colors"
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
      </section>
    </main>
  );
}
