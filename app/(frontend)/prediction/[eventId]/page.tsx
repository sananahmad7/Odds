import Article from "@/components/prediction/Article";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

// Define the data types
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

// Server-side data fetching
const EventPredictionPage = async ({
  params,
}: {
  params: Promise<{ eventId: string }>; // UPDATED: params must be a Promise in Next.js 15+
}) => {
  // Await the `params` promise
  const { eventId } = await params;

  if (!eventId) {
    return (
      <div className="text-center">
        <p>No event ID provided in the URL.</p>
      </div>
    );
  }

  try {
    // Fetch the event data using Prisma directly
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

    // Map event data and convert `commenceTime` to string
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

    return (
      <main className="w-full bg-[#FAFAFA] min-h-screen">
        <section className="w-full py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <Article event={formattedEventData} />
          </div>
        </section>
      </main>
    );
  } catch (error) {
    console.error("Error fetching event data:", error);
    return (
      <div className="text-center">
        <p>Error loading event data. Please try again later.</p>
      </div>
    );
  }
};

export default EventPredictionPage;
