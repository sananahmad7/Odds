// app/(frontend)/page.tsx
import HomeHero from "@/components/Home/HomeHero";
import UpcomingGames from "@/components/Home/UpcomingGames";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
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

  // Direct DB read (same shape as your /api/odds-data)
  const dbEvents = await prisma.oddsEvent.findMany({
    include: {
      bookmakers: {
        include: {
          markets: { include: { outcomes: true } },
        },
      },
    },
    orderBy: { commenceTime: "asc" },
  });

  const events = dbEvents.map((e) => ({
    id: e.id,
    sportKey: e.sportKey,
    sportTitle: e.sportTitle,
    commenceTime: e.commenceTime.toISOString(),
    homeTeam: e.homeTeam,
    awayTeam: e.awayTeam,
    bookmakers: e.bookmakers.map((b) => ({
      id: b.id,
      key: b.key,
      title: b.title,
      lastUpdate: b.lastUpdate.toISOString(),
      markets: b.markets.map((m) => ({
        id: m.id,
        key: m.key,
        lastUpdate: m.lastUpdate.toISOString(),
        outcomes: m.outcomes.map((o) => ({
          id: o.id,
          name: o.name,
          price: o.price,
          point: o.point ?? null,
        })),
      })),
    })),
  }));

  console.log("events", dbEvents);

  return (
    <main>
      <HomeHero initialFeatured={initialFeatured} />
      <UpcomingGames events={events} />
      <div className="h-20" />
    </main>
  );
}
