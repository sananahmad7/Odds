import UpcomingGames from "./UpcomingGames";
import { prisma } from "@/lib/prisma";

// League labels in our DB
const WEEKLY_LEAGUES = ["NFL", "NCAAF", "MMA"] as const; // entire upcoming week
const DAILY_LEAGUES = ["NBA", "NCAAB", "MLB"] as const; // games for today only
const LEAGUES = [...WEEKLY_LEAGUES, ...DAILY_LEAGUES] as const;

export default async function FetchUpcomingGamesSection() {
  const now = new Date();

  // Compute date windows in UTC to keep things consistent on the server
  const startOfToday = new Date(now);
  //startOfToday.setUTCHours(0, 0, 0, 0);

  const dayEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const endOfWeek = new Date(now);
  endOfWeek.setUTCDate(endOfWeek.getUTCDate() + 7); // next 7 days for weekly leagues

  // Single optimized query:
  // - Weekly leagues: all games in next 7 days
  // - Daily leagues: all games happening today
  const dbEvents = await prisma.oddsEvent.findMany({
    where: {
      OR: [
        {
          sportTitle: { in: WEEKLY_LEAGUES as unknown as string[] },
          commenceTime: {
            gte: now,
            lt: endOfWeek,
          },
        },
        {
          sportTitle: { in: DAILY_LEAGUES as unknown as string[] },
          commenceTime: {
            gte: startOfToday,
            lt: dayEnd,
          },
        },
      ],
    },
    orderBy: { commenceTime: "asc" },
    select: {
      id: true,
      sportKey: true,
      sportTitle: true,
      commenceTime: true, // Date
      homeTeam: true,
      awayTeam: true,
      bookmakers: {
        take: 3, // keep this small for performance – enough options to pick a "best" book
        select: {
          id: true,
          key: true,
          title: true,
          lastUpdate: true, // Date
          markets: {
            where: {
              key: { in: ["h2h", "spreads", "totals"] }, // only markets we actually use
            },
            select: {
              id: true,
              key: true,
              lastUpdate: true, // Date
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
  });

  // Pass all events through to the client component
  return <UpcomingGames events={dbEvents} />;
}
