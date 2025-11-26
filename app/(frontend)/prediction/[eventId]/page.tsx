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
  outcomes: DetailOutcome[];
};

export type DetailBookmaker = {
  id: string;
  title: string;
  markets: DetailMarket[];
};

export type DetailPrediction = {
  id: number;
  heading: string;
  description: string;
  oddsEventId: string;
};

export type DetailEvent = {
  id: string;
  sportKey: string;
  sportTitle: string;
  commenceTime: Date; // Keep as string, let frontend convert
  image: string;
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
  publishedAt: Date; // Keep Date as it is, frontend will convert
  league: string; // from enum League
};

// --------- Server-side page component ---------
const EventPredictionPage = async ({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) => {
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
    // 1) Fetch the main event + predictions + odds (only fields the UI needs)
    const t0 = Date.now();

    const eventData = await prisma.oddsEvent.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        sportKey: true,
        sportTitle: true,
        commenceTime: true,
        image: true,
        homeTeam: true,
        awayTeam: true,
        bookmakers: {
          take: 1,
          select: {
            id: true,
            title: true,
            markets: {
              where: {
                key: { in: ["spreads", "h2h", "totals"] }, // only markets Article.tsx uses
              },
              select: {
                id: true,
                key: true,
                outcomes: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    point: true,
                  },
                },
              },
            },
          },
        },
        eventpredictions: {
          take: 1,
          select: {
            id: true,
            heading: true,
            description: true,
            oddsEventId: true,
          },
        },
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
      "MMA",
    ] as const;

    let relatedArticlesRaw: {
      id: number;
      slug: string;
      title: string;
      thumbnail: string;
      publishedAt: Date; // Raw Date, no conversion here
      league: string;
    }[] = [];

    if (allowedLeagues.includes(leagueKey as (typeof allowedLeagues)[number])) {
      const t1 = Date.now();

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
        take: 5,
      });
    }

    // 5) Render page, passing both the event and the same-league CMS articles
    return (
      <main className="w-full bg-[#FAFAFA] min-h-screen">
        <section className="w-full py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <Article event={eventData} relatedArticles={relatedArticlesRaw} />
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
