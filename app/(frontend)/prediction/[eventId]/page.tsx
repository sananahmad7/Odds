import Article from "@/components/prediction/Article";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

// ---- Optimized Types ----
// These types now accurately reflect the PRISMA RETURN SHAPE (Arrays, not objects)

export type DetailOutcome = {
  id: string;
  name: string;
  price: number;
  point: number | null;
};

export type DetailMarket = {
  id: string;
  key: string;
  outcomes: DetailOutcome[]; // Prisma returns an array of outcomes
};

export type DetailBookmaker = {
  id: string;
  title: string;
  markets: DetailMarket[]; // Prisma returns an array of markets
};

export type DetailPrediction = {
  id: number;
  heading: string;
  description: string;
};

// This matches exactly what Prisma selects
export type DetailEvent = {
  id: string;
  sportKey: string;
  sportTitle: string;
  commenceTime: Date | string; // Date from DB, String after transformation
  image: string | null; // Handle potential nulls
  homeTeam: string;
  awayTeam: string;
  bookmakers: DetailBookmaker[]; // Prisma returns an array
  eventpredictions: DetailPrediction[];
};

// Shape of the Optimized Prop passed to Client
export type OptimizedOdds = {
  bookmakerName: string | null;
  home: {
    name: string;
    spread: { point: string; price: string } | null;
    ml: { price: string } | null;
  };
  away: {
    name: string;
    spread: { point: string; price: string } | null;
    ml: { price: string } | null;
  };
  total: {
    over: { point: string; price: string } | null;
    under: { point: string; price: string } | null;
  } | null;
};

export type RelatedArticle = {
  id: number;
  slug: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  league: string;
};

const EventPredictionPage = async ({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) => {
  // Await params as per Next.js 15 breaking changes
  const { eventId } = await params;

  if (!eventId) return notFound();

  // 1) Fetch Data
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
              key: { in: ["spreads", "h2h", "totals"] },
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
        select: {
          id: true,
          heading: true,
          description: true,
        },
      },
    },
  });

  if (!eventData) return notFound();

  // 2) Fetch Related Articles
  const leagueKey = eventData.sportTitle.toUpperCase();
  // FIX: Added the array literal before 'as const'
  const allowedLeagues = [
    "NFL",
    "NBA",
    "MLB",
    "NHL",
    "NCAAF",
    "NCAAB",
  ] as const;

  // Initialize as empty array to match RelatedArticle[] type roughly
  let relatedArticlesRaw: any[] = [];

  if (allowedLeagues.includes(leagueKey as (typeof allowedLeagues)[number])) {
    relatedArticlesRaw = await prisma.article.findMany({
      where: {
        league: leagueKey as any, // Cast to avoid specific enum issues if strict
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
      orderBy: { publishedAt: "desc" },
      take: 6,
    });
  }

  // 3) Server-Side Transformation
  const formattedEventData: DetailEvent = {
    ...eventData,
    // Convert Date to string for Serialization
    commenceTime: eventData.commenceTime.toISOString(),
  };

  // Helper function logic
  const transformOdds = (event: DetailEvent): OptimizedOdds => {
    const requiredMarkets = ["spreads", "h2h", "totals"];

    // Logic: Find a bookmaker that has all markets, or fallback to the first one available
    const book =
      event.bookmakers.find((b) => {
        const keys = b.markets.map((m) => m.key);
        return requiredMarkets.every((k) => keys.includes(k));
      }) || event.bookmakers[0];

    if (!book) {
      return {
        bookmakerName: null,
        home: { name: event.homeTeam, spread: null, ml: null },
        away: { name: event.awayTeam, spread: null, ml: null },
        total: null,
      };
    }

    const getMkt = (key: string) => book.markets.find((m) => m.key === key);
    // Explicitly typed 'o' as DetailOutcome
    const getOut = (m: DetailMarket | undefined, n: string) =>
      m?.outcomes.find((o) => o.name === n || n.includes(o.name));

    const fmt = (p: number) => (p > 0 ? `+${p}` : `${p}`);

    const spreadM = getMkt("spreads");
    const mlM = getMkt("h2h");
    const totM = getMkt("totals");

    const fmtSpread = (team: string) => {
      const o = getOut(spreadM, team);
      return o
        ? {
            point: o.point && o.point > 0 ? `+${o.point}` : `${o.point || ""}`,
            price: fmt(o.price),
          }
        : null;
    };
    const fmtMl = (team: string) => {
      const o = getOut(mlM, team);
      return o ? { price: fmt(o.price) } : null;
    };

    return {
      bookmakerName: book.title,
      home: {
        name: event.homeTeam,
        spread: fmtSpread(event.homeTeam),
        ml: fmtMl(event.homeTeam),
      },
      away: {
        name: event.awayTeam,
        spread: fmtSpread(event.awayTeam),
        ml: fmtMl(event.awayTeam),
      },
      total: {
        over: (() => {
          const o = totM?.outcomes.find((x) => x.name.includes("Over"));
          return o ? { point: `O ${o.point}`, price: fmt(o.price) } : null;
        })(),
        under: (() => {
          const o = totM?.outcomes.find((x) => x.name.includes("Under"));
          return o ? { point: `U ${o.point}`, price: fmt(o.price) } : null;
        })(),
      },
    };
  };

  const optimizedOdds = transformOdds(formattedEventData);

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
  console.log(optimizedOdds);
  return (
    <main className="w-full bg-[#FAFAFA] min-h-screen">
      <section className="w-full py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <Article
            event={formattedEventData}
            odds={optimizedOdds}
            relatedArticles={formattedRelatedArticles}
          />
        </div>
      </section>
    </main>
  );
};

export default EventPredictionPage;
