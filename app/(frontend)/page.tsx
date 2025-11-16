// app/(frontend)/page.tsx
import HomeHero from "@/components/Home/HomeHero";
import UpcomingGames from "@/components/Home/UpcomingGames";
import { prisma } from "@/lib/prisma";

// Small helper so this works in dev & prod
function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  );
}

export default async function Home() {
  // Featured articles (unchanged)
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
      publishedAt: true,
      isFeatured: true,
      published: true,
      league: true,
    },
  });

  const initialFeatured = articles.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    description: a.description,
    thumbnail: a.thumbnail,
    publishedAt: a.publishedAt.toISOString(),
    isFeatured: !!a.isFeatured,
    published: !!a.published,
    league: a.league,
  }));

  // 🔥 Fetch DB events from your own API
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/odds-data`, { cache: "no-store" });
  const events = res.ok ? await res.json() : [];
  // console.log(events);
  // console.log(events.length);

  return (
    <main>
      <HomeHero initialFeatured={initialFeatured} />
      {/* Pass DB events to UpcomingGames */}
      <UpcomingGames events={events} />
      <div className="h-20" />
    </main>
  );
}
