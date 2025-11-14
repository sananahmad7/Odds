// app/api/odds-sync/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "@/lib/prisma";
import { MakeOddsPrediction } from "@/lib/odds-prediction";

type LeagueKey = "nfl" | "nba" | "ncaaf" | "ncaab" | "mlb" | "ufc";

const SPORTS_CONFIG: Record<LeagueKey, { apiKey: string; name: string }> = {
  nfl: { apiKey: "americanfootball_nfl", name: "NFL" },
  nba: { apiKey: "basketball_nba", name: "NBA" },
  ncaaf: { apiKey: "americanfootball_ncaaf", name: "NCAAF" },
  ncaab: { apiKey: "basketball_ncaab", name: "NCAAB" },
  mlb: { apiKey: "baseball_mlb", name: "MLB" },
  ufc: { apiKey: "mma_ufc", name: "UFC" },
};

const API_KEY = process.env.ODDS_API_KEY!;
const BASE_URL = "https://api.the-odds-api.com/v4/sports";

// -----------------------------
// API response types
// -----------------------------
type ApiOutcome = {
  name: string;
  price: number;
  point?: number | null;
};

type ApiMarket = {
  key: string; // e.g., "h2h" | "spreads" | "totals"
  last_update: string;
  outcomes: ApiOutcome[];
};

type ApiBookmaker = {
  key: string; // e.g., "draftkings"
  title: string; // e.g., "DraftKings"
  last_update: string;
  markets: ApiMarket[];
};

type ApiEvent = {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: ApiBookmaker[];
};

// -----------------------------
// Helpers
// -----------------------------
function requireEnv(
  name: string,
  value: string | undefined
): asserts value is string {
  if (!value) throw new Error(`Missing required env var: ${name}`);
}

async function fetchLeagueOdds(league: LeagueKey): Promise<ApiEvent[]> {
  const cfg = SPORTS_CONFIG[league];
  const params = new URLSearchParams({
    apiKey: API_KEY,
    regions: "us",
    markets: "h2h,spreads,totals",
    oddsFormat: "american",
  });

  const { data } = await axios.get<ApiEvent[]>(
    `${BASE_URL}/${cfg.apiKey}/odds?${params.toString()}`
  );
  return data ?? [];
}

/**
 * Simple concurrency limiter using batch windows.
 */
async function inBatches<T>(
  items: T[],
  size: number,
  fn: (item: T) => Promise<any>
) {
  for (let i = 0; i < items.length; i += size) {
    const slice = items.slice(i, i + size);
    await Promise.all(slice.map((it) => fn(it)));
  }
}

// -----------------------------
// Upsert logic without long interactive transactions
// -----------------------------
async function upsertEventWithChildren(e: ApiEvent) {
  // 1) Event
  const eventRow = await prisma.oddsEvent.upsert({
    where: { id: e.id },
    create: {
      id: e.id,
      sportKey: e.sport_key,
      sportTitle: e.sport_title,
      commenceTime: new Date(e.commence_time),
      homeTeam: e.home_team,
      awayTeam: e.away_team,
    },
    update: {
      sportKey: e.sport_key,
      sportTitle: e.sport_title,
      commenceTime: new Date(e.commence_time),
      homeTeam: e.home_team,
      awayTeam: e.away_team,
    },
  });

  // 2) Bookmakers (sequential is fine to keep load modest)
  for (const b of e.bookmakers ?? []) {
    const bookRow = await prisma.oddsBookmaker.upsert({
      where: { eventId_key: { eventId: eventRow.id, key: b.key } },
      create: {
        eventId: eventRow.id,
        key: b.key,
        title: b.title,
        lastUpdate: new Date(b.last_update),
      },
      update: {
        title: b.title,
        lastUpdate: new Date(b.last_update),
      },
    });

    // 3) Markets (limit concurrency to avoid too many round-trips at once)
    await inBatches(b.markets ?? [], 3, async (m) => {
      const marketRow = await prisma.oddsMarket.upsert({
        where: { bookmakerId_key: { bookmakerId: bookRow.id, key: m.key } },
        create: {
          bookmakerId: bookRow.id,
          key: m.key,
          lastUpdate: new Date(m.last_update),
        },
        update: {
          lastUpdate: new Date(m.last_update),
        },
      });

      // 4) Outcomes: replace set instead of upserting one-by-one
      await prisma.oddsOutcome.deleteMany({
        where: { marketId: marketRow.id },
      });

      const toCreate =
        (m.outcomes ?? []).map((o) => ({
          marketId: marketRow.id,
          name: o.name,
          price: o.price,
          point: o.point ?? null,
        })) ?? [];

      if (toCreate.length) {
        await prisma.oddsOutcome.createMany({
          data: toCreate,
          skipDuplicates: true, // safe even with unique (marketId, name)
        });
      }
    });
  }
}

async function upsertOddsPayload(events: ApiEvent[]) {
  // Limit concurrent events to keep DB healthy (tune as needed)
  await inBatches(events, 2, (e) => upsertEventWithChildren(e));
}

async function pruneMissingEvents(presentEventIds: string[]) {
  await prisma.oddsEvent.deleteMany({
    where: { id: { notIn: presentEventIds } },
  });
}

// -----------------------------
// Route
// -----------------------------
export async function POST(req: Request) {
  try {
    requireEnv("ODDS_API_KEY", API_KEY);

    const body = (await req.json().catch(() => ({}))) as {
      league?: LeagueKey; // if undefined → sync all leagues
      prune?: boolean; // optional: mirror DB to feed by pruning old events
    };

    const leagues: LeagueKey[] = body.league
      ? [body.league]
      : (Object.keys(SPORTS_CONFIG) as LeagueKey[]);

    const allData: Record<string, ApiEvent[]> = {};

    // Process leagues sequentially to avoid external/API and DB spikes
    for (const lg of leagues) {
      const data = await fetchLeagueOdds(lg);
      allData[lg] = data;
      await upsertOddsPayload(data);
    }

    if (body.prune) {
      const keepIds = Object.values(allData)
        .flat()
        .map((e) => e.id);
      await pruneMissingEvents(keepIds);
    }

    const summary = Object.entries(allData).map(([lg, arr]) => ({
      league: SPORTS_CONFIG[lg as LeagueKey].name,
      events: arr.length,
    }));

    // Create predictions for each league AFTER events are created/updated.
    // Important: pass the SPORT TITLE ("NFL", "NBA"), not the league key ("nfl", "nba").
    for (const lg of leagues) {
      const sportTitle = SPORTS_CONFIG[lg].name; // e.g. "NFL"
      const resp = await MakeOddsPrediction(sportTitle);

      if (!resp || resp.status !== 200) {
        console.error("Prediction creation failed for league:", lg);
        return NextResponse.json(
          {
            success: false,
            summary,
            message:
              "Events were created/updated but some predictions were not created.",
          },
          { status: 200 }
        );
      }
    }

    return NextResponse.json({ success: true, summary }, { status: 200 });
  } catch (error) {
    console.error("Error in odds-sync API:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
