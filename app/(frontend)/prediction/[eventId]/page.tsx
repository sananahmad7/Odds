// app/(frontend)/prediction/[eventId]/page.tsx

import Article from "@/components/prediction/Article";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

// ---- Types used by the prediction page ----
export type DetailOutcome = {
  id: string;
  name: string;
  price: number;
  point: number | null;
};

export type DetailMarket = {
  id: string;
  key: string;
  lastUpdate: string;
  outcomes: DetailOutcome[];
};

export type DetailBookmaker = {
  id: string;
  key: string;
  title: string;
  lastUpdate: string;
  markets: DetailMarket[];
};

export type DetailPrediction = {
  id: number;
  heading: string;
  description: string;
  oddsEventId: string;
  createdAt: string;
  updatedAt: string;
};

export type DetailEvent = {
  id: string;
  sportKey: string;
  sportTitle: string;
  commenceTime: string;
  homeTeam: string;
  awayTeam: string;
  bookmakers: DetailBookmaker[];
  eventpredictions: DetailPrediction[];
};

// Articles from your CMS (Article model)
export type RelatedArticle = {
  id: number;
  slug: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  league: string; // from enum League
};

// --------- Server-side page component ---------
const EventPredictionPage = async ({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) => {
  // Next.js 15 typed params as a Promise, so we await it:
  const { eventId } = await params;

  if (!eventId) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 font-inter">
          No event ID provided in the URL.
        </p>
      </div>
    );
  }

  try {
    // 1) Fetch the main event + predictions + odds
    const eventData = await prisma.oddsEvent.findUnique({
      where: { id: eventId },
      include: {
        bookmakers: {
          include: {
            markets: {
              include: {
                outcomes: true,
              },
            },
          },
        },
        eventpredictions: true,
      },
    });

    if (!eventData) {
      return notFound();
    }

    // 2) Fetch related CMS articles for the same league (sportTitle -> Article.league)
    const leagueKey = eventData.sportTitle.toUpperCase();
    const allowedLeagues = [
      "NFL",
      "NBA",
      "NCAAF",
      "NCAAB",
      "MLB",
      "UFC",
    ] as const;

    let relatedArticlesRaw: {
      id: number;
      slug: string;
      title: string;
      thumbnail: string;
      publishedAt: Date;
      league: string;
    }[] = [];

    if (allowedLeagues.includes(leagueKey as (typeof allowedLeagues)[number])) {
      relatedArticlesRaw = await prisma.article.findMany({
        where: {
          league: leagueKey as any, // cast to Prisma enum
          published: true,
        },
        select: {
          id: true,
          slug: true,
          title: true,
          thumbnail: true,
          publishedAt: true,
          league: true,
        },
        orderBy: {
          publishedAt: "desc",
        },
        take: 10,
      });
    }

    // 3) Map event data and convert dates to strings
    const formattedEventData: DetailEvent = {
      ...eventData,
      commenceTime: eventData.commenceTime.toISOString(),
      bookmakers: eventData.bookmakers.map((bookmaker) => ({
        ...bookmaker,
        lastUpdate: bookmaker.lastUpdate.toISOString(),
        markets: bookmaker.markets.map((market) => ({
          ...market,
          lastUpdate: market.lastUpdate.toISOString(),
          outcomes: market.outcomes.map((outcome) => ({
            ...outcome,
            point: outcome.point ?? null,
          })),
        })),
      })),
      eventpredictions: eventData.eventpredictions.map((prediction) => ({
        ...prediction,
        createdAt: prediction.createdAt.toISOString(),
        updatedAt: prediction.updatedAt.toISOString(),
      })),
    };

    // 4) Format related articles (convert Date -> string)
    const formattedRelatedArticles: RelatedArticle[] = relatedArticlesRaw.map(
      (article) => ({
        id: article.id,
        slug: article.slug,
        title: article.title,
        thumbnail: article.thumbnail,
        publishedAt: article.publishedAt.toISOString(),
        league: article.league,
      })
    );

    // 5) Render page, passing both the event and the same-league CMS articles
    return (
      <main className="w-full bg-[#FAFAFA] min-h-screen">
        <section className="w-full py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <Article
              event={formattedEventData}
              relatedArticles={formattedRelatedArticles}
            />
          </div>
        </section>
      </main>
    );
  } catch (error) {
    console.error("Error fetching event data or related articles:", error);
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 font-inter">
          Error loading event data. Please try again later.
        </p>
      </div>
    );
  }
};

export default EventPredictionPage;
