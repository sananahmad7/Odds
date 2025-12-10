// app/league/nfl/page.tsx
import { prisma } from "@/lib/prisma";
import LeagueEvents from "@/components/league/LeagueEvents";

/** What we send to the client (serialize Dates -> strings) */
export type SerializableOutcome = {
  id: string;
  name: string;
  price: number;
  point: number | null;
};
export type SerializableMarket = {
  id: string;
  key: string;
  lastUpdate: string; // ISO
  outcomes: SerializableOutcome[];
};
export type SerializableBookmaker = {
  id: string;
  key: string;
  title: string;
  lastUpdate: string; // ISO
  markets: SerializableMarket[];
};
export type SerializableOddsEvent = {
  id: string;
  sportKey: string;
  sportTitle: string; // "NFL"
  commenceTime: string; // ISO
  homeTeam: string;
  awayTeam: string;
  bookmakers: SerializableBookmaker[];
};

export default async function NFLLeaguePage() {
  // Pull ONLY NFL events from DB
  const dbEvents = await prisma.oddsEvent.findMany({
    where: { sportTitle: "NFL" },
    include: {
      bookmakers: {
        include: {
          markets: {
            include: { outcomes: true },
          },
        },
      },
    },

    orderBy: { commenceTime: "asc" },
  });

  // Serialize dates for client component
  const events: SerializableOddsEvent[] = dbEvents.map((e) => ({
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
  // console.log("dbEvents", dbEvents.length, "dbEvents", dbEvents);
  return (
    <div className="w-full bg-[#FAFAFA] min-h-screen">
      <section className="w-full bg-[#FAFAFA] py-12 sm:py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Client component: search/filter + render with GameCard */}
          <LeagueEvents events={events} />
        </div>
      </section>
    </div>
  );
}
