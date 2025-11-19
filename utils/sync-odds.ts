// lib/sync-odds.ts
import axios, { AxiosError } from "axios";
import { prisma } from "../lib/prisma";
import OpenAI from "openai";
import { encode } from "@toon-format/toon";

type LeagueKey = "nfl" | "nba" | "ncaaf" | "ncaab" | "mlb" | "mma";

const SPORTS_CONFIG: Record<LeagueKey, { sportKey: string; name: string }> = {
  nfl: { sportKey: "americanfootball_nfl", name: "NFL" },
  nba: { sportKey: "basketball_nba", name: "NBA" },
  ncaaf: { sportKey: "americanfootball_ncaaf", name: "NCAAF" },
  ncaab: { sportKey: "basketball_ncaab", name: "NCAAB" },
  mlb: { sportKey: "baseball_mlb", name: "MLB" },

  // ✅ FIX: use the actual Odds API sport key for MMA / UFC
  // Docs list: mma_mixed_martial_arts :contentReference[oaicite:1]{index=1}
  mma: { sportKey: "mma_mixed_martial_arts", name: "MMA" },
};

const API_KEY = process.env.ODDS_API_KEY;
const BASE_URL = "https://api.the-odds-api.com/v4/sports";

// OpenAI client for prediction generation on new events
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// -----------------------------
// API response types
// -----------------------------
type ApiOutcome = {
  name: string;
  price: number;
  point?: number | null;
};

type ApiMarket = {
  key: string;
  last_update: string;
  outcomes: ApiOutcome[];
};

type ApiBookmaker = {
  key: string;
  title: string;
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

// ISO-8601 without milliseconds, as in Odds API docs examples
function toIsoNoMs(date: Date): string {
  // 2025-11-17T10:21:15.123Z -> 2025-11-17T10:21:15Z
  const iso = date.toISOString();
  const [noMs] = iso.split(".");
  return `${noMs}Z`;
}

async function fetchLeagueOdds(league: LeagueKey): Promise<ApiEvent[]> {
  requireEnv("ODDS_API_KEY", API_KEY);
  const cfg = SPORTS_CONFIG[league];

  const now = new Date();
  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(now.getDate() + 7);

  const params = new URLSearchParams({
    apiKey: API_KEY,
    regions: "us", // valid region per docs :contentReference[oaicite:2]{index=2}
    markets: "h2h,spreads,totals", // featured markets only :contentReference[oaicite:3]{index=3}
    oddsFormat: "american",
    commenceTimeFrom: toIsoNoMs(now),
    commenceTimeTo: toIsoNoMs(sevenDaysFromNow),
  });

  const url = `${BASE_URL}/${encodeURIComponent(
    cfg.sportKey
  )}/odds?${params.toString()}`;

  try {
    const { data } = await axios.get<ApiEvent[]>(url);
    return data ?? [];
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("Odds API error", {
        league,
        sportKey: cfg.sportKey,
        status: err.response?.status,
        data: err.response?.data,
        url,
      });
    } else {
      console.error("Unknown error calling Odds API", err);
    }
    throw err;
  }
}

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

// Prediction helper (used only on *new* events)
async function generateAndStorePredictionForEvent(
  oddsEventId: string
): Promise<void> {
  // Skip if prediction already exists for this event
  const existingPrediction = await prisma.eventprediction.findFirst({
    where: { oddsEventId },
    select: { id: true },
  });

  if (existingPrediction) return;

  const event = await prisma.oddsEvent.findUnique({
    where: { id: oddsEventId },
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
    },
  });

  if (!event) {
    console.warn("generateAndStorePredictionForEvent: event not found", {
      oddsEventId,
    });
    return;
  }

  const oddsData = encode(event);

  const completion = await openaiClient.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
You are a professional sports betting analyst. Given odds and match data, you write clear, well-structured prediction articles about which team is more likely to win. Base your reasoning only on the provided data. Do not mention being an AI or refer to the prompt itself.
        `.trim(),
      },
      {
        role: "user",
        content: `
Using the following data, write a detailed prediction article about which team is more likely to win.

Requirements:
- Briefly describe both teams and the context of the match.
- Start with a short, catchy introduction.
- Analyze key factors (recent form, head-to-head, odds, strengths/weaknesses, home/away, injuries if present in data).
- Clearly state which team you predict will win and *why*, based strictly on the given data.
- Mention that predictions are not guaranteed outcomes.
- Keep it within 500–800 words.
- Write in confident, engaging, sports-article style.

OUTPUT FORMAT (VERY IMPORTANT – FOLLOW EXACTLY):

heading: <a short, catchy title for the prediction article>
description: <the full 500–800 word article in plain text, with normal paragraphs>

FORMAT RULES:
- Do NOT use any markdown formatting at all (no #, ##, ###, *, -, _, or ---).
- Do NOT add any other fields or labels besides "heading:" and "description:".
- Do NOT put blank titles or dummy text; both fields must be meaningful.
- The "description" must contain the full article, not just a sentence.

Here is the data to use:
${oddsData}
        `.trim(),
      },
    ],
  });

  if (!completion || !completion.choices || completion.choices.length === 0) {
    throw new Error("Error: No choices found in OpenAI response.");
  }

  const content = completion.choices[0].message.content ?? "";

  if (typeof content !== "string") {
    throw new Error("Unexpected OpenAI response format.");
  }

  // Parse heading and description (same strategy as in route)
  const headingLabel = "heading:";
  const descriptionLabel = "description:";

  let heading = "Match Prediction";
  let description = content.trim();

  const headingIndex = content.indexOf(headingLabel);
  const descriptionIndex = content.indexOf(descriptionLabel);

  if (headingIndex !== -1 && descriptionIndex !== -1) {
    heading = content
      .slice(headingIndex + headingLabel.length, descriptionIndex)
      .trim();
    description = content
      .slice(descriptionIndex + descriptionLabel.length)
      .trim();
  }

  await prisma.eventprediction.create({
    data: {
      heading,
      description,
      oddsEventId,
    },
  });
}

// Safe wrapper so OpenAI errors don't break odds syncing
async function safelyGeneratePredictionForNewEvent(
  isNewEvent: boolean,
  oddsEventId: string
) {
  if (!isNewEvent) return;

  try {
    await generateAndStorePredictionForEvent(oddsEventId);
  } catch (error) {
    console.error("Error generating prediction for new odds event", {
      oddsEventId,
      error,
    });
  }
}

async function upsertEventWithChildren(e: ApiEvent) {
  // Check if the event already exists — we only generate predictions for *new* events
  const existing = await prisma.oddsEvent.findUnique({
    where: { id: e.id },
    select: { id: true },
  });

  const isNewEvent = !existing;
  const randomNumber = Math.floor(Math.random() * 10) + 1;

  const imageKey = `${e.sport_title}-${randomNumber}`;

  const eventRow = await prisma.oddsEvent.upsert({
    where: { id: e.id },
    create: {
      id: e.id,
      sportKey: e.sport_key,
      sportTitle: e.sport_title,
      commenceTime: new Date(e.commence_time),
      homeTeam: e.home_team,
      awayTeam: e.away_team,
      image: imageKey,
    },
    update: {
      sportKey: e.sport_key,
      sportTitle: e.sport_title,
      commenceTime: new Date(e.commence_time),
      homeTeam: e.home_team,
      awayTeam: e.away_team,
    },
  });

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

      // Replace outcomes for this market
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
          skipDuplicates: true,
        });
      }
    });
  }

  // 🔮 Generate prediction only when the event is newly created (not on updates)
  //    IMPORTANT CHANGE: do NOT await this, so the sync API can respond promptly.
  void safelyGeneratePredictionForNewEvent(isNewEvent, eventRow.id);
}

async function upsertOddsPayload(events: ApiEvent[]) {
  await inBatches(events, 2, (e) => upsertEventWithChildren(e));
}

// delete events whose commenceTime has passed
async function prunePastEvents() {
  await prisma.eventprediction.deleteMany({
    where: {
      event: {
        commenceTime: {
          lt: new Date(), // anything before "now"
        },
      },
    },
  });
}

// Main sync function
export async function handleSyncOdds(options?: { prune?: boolean }) {
  const { prune = false } = options ?? {};

  try {
    requireEnv("ODDS_API_KEY", API_KEY);

    const leagues: LeagueKey[] = Object.keys(SPORTS_CONFIG) as LeagueKey[];
    const allData: Record<string, ApiEvent[]> = {};

    for (const lg of leagues) {
      const data = await fetchLeagueOdds(lg);
      allData[lg] = data;
      await upsertOddsPayload(data);
    }

    if (prune) {
      await prunePastEvents();
    }

    const summary = leagues.map((lg) => ({
      league: SPORTS_CONFIG[lg].name,
      events: allData[lg]?.length ?? 0,
    }));

    return { success: true, summary };
  } catch (error) {
    const axiosErr = error as AxiosError | Error;

    if ("isAxiosError" in axios && axios.isAxiosError(axiosErr)) {
      console.error("Error in odds-sync (Axios):", {
        message: axiosErr.message,
        status: axiosErr.response?.status,
        data: axiosErr.response?.data,
      });
    } else {
      console.error("Error in odds-sync:", error);
    }

    return {
      success: false,
      error:
        axios.isAxiosError(axiosErr) && axiosErr.response?.data
          ? JSON.stringify(axiosErr.response.data)
          : axiosErr instanceof Error
          ? axiosErr.message
          : "Internal server error",
    };
  }
}
