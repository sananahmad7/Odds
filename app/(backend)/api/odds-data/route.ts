import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"; // Ensure the API logic runs fresh when called (caching is handled by the fetcher)

const LEAGUES = ["NFL", "NBA", "NCAAF", "NCAAB", "MLB", "MMA"] as const;

export async function GET() {
  try {
    const now = new Date();
    const t1 = Date.now();

    const perLeague = await Promise.all(
      LEAGUES.map((league) =>
        prisma.oddsEvent.findMany({
          where: {
            sportTitle: league,
            commenceTime: { gte: now },
          },
          orderBy: { commenceTime: "asc" },
          take: 6, // 6 upcoming events per league
          select: {
            id: true,
            sportKey: true,
            sportTitle: true,
            commenceTime: true,
            homeTeam: true,
            awayTeam: true,
            bookmakers: {
              take: 3,
              select: {
                id: true,
                key: true,
                title: true,
                lastUpdate: true,
                markets: {
                  where: {
                    key: { in: ["h2h", "spreads", "totals"] }, // only needed markets
                  },
                  select: {
                    id: true,
                    key: true,
                    lastUpdate: true,
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
          },
        })
      )
    );

    console.log("Time taken to fetch events (API):", Date.now() - t1);

    const dbEvents = perLeague.flat();

    // Shape to the DbOddsEvent type (convert Dates to ISO strings)
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

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching odds data:", error);
    return NextResponse.json(
      { error: "Failed to fetch odds data" },
      { status: 500 }
    );
  }
}
