// app/(frontend)/page.tsx
import HomeHero from "@/components/Home/HomeHero";
import UpcomingGames from "@/components/Home/UpcomingGames";
import { prisma } from "@/lib/prisma"; // see singleton below

export default async function Home() {
  const articles = await prisma.article.findMany({
    where: { isFeatured: true }, // only featured (adjust if you also want published: true)
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
      league: true, // ⬅️ NEW: select league instead of categories
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
    league: a.league, // ⬅️ NEW: pass league
  }));

  return (
    <main>
      <HomeHero initialFeatured={initialFeatured} />
      <UpcomingGames />
      <div className="h-20" />
    </main>
  );
}
