// app/(frontend)/league/ncaaf/page.tsx
import { prisma } from "@/lib/prisma";
import LeagueEventsNCAAF from "@/components/league/NcaafEvents";

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
  sportTitle: string; // "NCAAF"
  commenceTime: string; // ISO
  homeTeam: string;
  awayTeam: string;
  bookmakers: SerializableBookmaker[];
};

export default async function NCAAFLeaguePage() {
  // Pull ONLY NCAAF events from DB
  const dbEvents = await prisma.oddsEvent.findMany({
    where: { sportTitle: "NCAAF" },
    include: {
      bookmakers: {
        include: {
          markets: { include: { outcomes: true } },
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

  return (
    <div className="w-full bg-[#FAFAFA] min-h-screen">
      <section className="w-full bg-[#FAFAFA] py-12 sm:py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111827] tracking-tight font-playfair">
              NCAAF — All Upcoming Games
            </h1>
            <p className="mt-2 text-base sm:text-lg text-gray-600 font-inter">
              Complete schedule and odds
            </p>
          </div>

          {/* Client component: search/filter + render with GameCard */}
          <LeagueEventsNCAAF events={events} />
        </div>
      </section>
    </div>
  );
}
