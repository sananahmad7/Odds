// app/(frontend)/page.tsx
import { Suspense } from "react";
import HomeHero from "@/components/Home/HomeHero";
import FetchUpcomingGamesSection from "@/components/Home/FetchUpcomingGames";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Simple skeleton while UpcomingGamesSection is loading
function UpcomingGamesSkeleton() {
  return (
    <section id="upcoming" className="w-full bg-white py-16 sm:py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="h-8 w-48 bg-gray-200 rounded mb-3 animate-pulse" />
          <div className="h-4 w-72 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Skeleton cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 sm:h-40 rounded-xl border border-gray-200 bg-gray-50 animate-pulse"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  // ----- ARTICLES (featured) -----
  //const t0 = Date.now();
  const articles = await prisma.article.findMany({
    where: { isFeatured: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      thumbnail: true,

      published: true,
      league: true,
    },
  });

  return (
    <main>
      {/* Upcoming games streamed separately; hero isn't blocked by events */}
      <Suspense fallback={<UpcomingGamesSkeleton />}>
        <FetchUpcomingGamesSection />
      </Suspense>
      {/* Hero renders immediately */}
      <HomeHero articles={articles} />

      <div className="h-5" />
    </main>
  );
}
