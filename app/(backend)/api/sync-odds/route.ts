// lib/sync-odds.ts
import axios, { AxiosError } from "axios";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { encode } from "@toon-format/toon";
import { NextResponse } from "next/server";

type LeagueKey = "nfl" | "nba" | "ncaaf" | "ncaab" | "mlb" | "mma";

const SPORTS_CONFIG: Record<LeagueKey, { sportKey: string; name: string }> = {
  nfl: { sportKey: "americanfootball_nfl", name: "NFL" },
  nba: { sportKey: "basketball_nba", name: "NBA" },
  ncaaf: { sportKey: "americanfootball_ncaaf", name: "NCAAF" },
  ncaab: { sportKey: "basketball_ncaab", name: "NCAAB" },
  mlb: { sportKey: "baseball_mlb", name: "MLB" },
  mma: { sportKey: "mma_mixed_martial_arts", name: "MMA" },
};

const heroImages: any = {
  nfl: [
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1762769368/gr8lv0brdyz22lvji2mi.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764005864/zimrypnrhrjonxok7m1l_qotb9f.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764005863/h8zitmphyhg6dnynxrbb_g9amkv.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764005864/tbjumwwgnkdkd9rdxhhh_utynji.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764005863/c7po6p9cn3blm3guvoze_te6fpl.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764005863/qkuj9qdacmvc6s5tzbza_odymbb.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764005862/gfzx6kbmovenniivmcmm_qlicy3.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764005862/ehmhx4gtkhqcosym5cya_zacwfz.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764005862/yqzjndtzm2q07wwpfhcd_virbbz.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764005862/gy1ws21ulyk3cjzbpo5j_jzo4em.webp",
  ],
  nba: [
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764006042/yupwwib1de27oesav68o_z3ie1j.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764006041/vt3iqeff2umiql52768q_co3yak.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764006041/mnmscz0pfqocfqxuuwwi_ryttsx.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764006041/ulga24zh6dbnehbp8jqm_lgruik.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764006041/pizsgv1cs3fdo1msfjr4_tbo9mt.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764006040/pexels-jimmy-liao-3615017-12602140_nxi1ax.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764006040/m13fwawmke2hz2qansbl_uhzyyc.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764006039/athmvh7pt4cpmh6gi8cw_qcvwgm.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764006039/fngbkyakqcj9y0zbig9z_yy7cm8.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764006038/e1b869nhhe3kq00vw1ts_ybj9be.webp",
  ],
  ncaaf: [
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764045705/male-american-football-player-uniform-field_gmq2to.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764045704/gene-gallin-zZgq0_SqPtU-unsplash_r3gueo.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764045703/sean-benesh-6FoEb9vW2kY-unsplash_gyufn1.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764045704/emma-dau-5o8vbsN6ryA-unsplash_zlrlxb.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764045704/male-american-football-player-uniform-field_1_dcqlnl.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764045704/emma-dau-dR_sfyYVy2o-unsplash_dkwis5.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764045702/steve-dimatteo-Rj4KVEdn7TA-unsplash_dlmanw.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764045702/dave-adamson-XXqNsborcjU-unsplash_ttgwao.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764045702/details-ball-sport_gx7mki.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764045702/jake-weirick-k0KToO3CoaE-unsplash_gfwnvg.webp",
  ],
  ncaab: [
    " https://res.cloudinary.com/dmlemjrcg/image/upload/v1764045935/svnxjzbym7jyrk2so9bu_o9im9f.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764045935/nnxnajqa9eesmhfjewqx_eldbxi.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764045933/jyf4qqqilzps2l7sfbxv_gvr8pt.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764045929/crtxg5mqcktqtpk3jjyl_up4p3i.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764045929/duevqrlfev4obtattoh1_rcre2o.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764045928/xjdrvdkesx9zwlyiyfse_sas4gg.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764045928/kqno4dygau7rx7pazjqx_nfhvfb.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764045928/vhbqovrs3eoenzeeizvp_ovksfq.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764045928/l7uosokmyjlzu6kwygzn_jpin6x.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764045928/vqygpnskdwiq2qvcbc6i_c9wei1.webp",
  ],
  mlb: [
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764046098/ylioiovyp35vxv4ip9gq_znh96a.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764046099/zydixdsi0km4ly2rb7ay_pot9ah.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764046096/o6qd1pkodph5xm5buhij_pjyr2j.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764046097/vqxruy2k9ya3azlktyiy_makn1d.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764046097/sk9n0gcezegzftgokf0z_xw9hu3.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764046096/cgtj5r4uqda7lb7dfsae_gxjzkl.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764046096/uqoksaqmyciqls0bat07_erdkls.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764046096/bbhj8c8etq2wwa3ai0rh_thoeoh.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764046097/tbryxvmal0mxmgyxgvjc_ywojai.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764046095/jtsowgbrmni60xi1guxd_mnud3p.webp",
  ],
  mma: [
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764046950/wwgyqwatddzeuntjomih_afcjda.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764046951/za0escs8bxdtfcchkrr9_rvef7z.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764046946/st5xdspo6ebaihrwybo9_vsg3cu.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764046945/jtbz3wssaathezvtfuru_mob34y.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764046945/uxpp4mw51ms8tdiwrkvj_ci5xto.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764046945/dsa3aq9kqtbl4s0dhx2q_mehf7p.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764046945/z2r4l8u7dyefa7fhnqhl_qoscxd.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764046945/kvaggrbof0lufk2m7ab0_fw0rns.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764046944/ppgvn1b7rbftiswnk0gg_d0ilox.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764046942/csse08tm1ykclqh0oduc_vamwki.webp",
  ],
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
    regions: "us",
    markets: "h2h,spreads,totals",
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

// NOTE: this client is unused here but left as–is to avoid changing other code paths.
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// -----------------------------
// Prediction generation
// -----------------------------
async function generateAndStorePredictionForEvent(
  oddsEventId: string
): Promise<void> {
  // Skip if prediction already exists for this event
  const existingPrediction = await prisma.eventprediction.findFirst({
    where: { oddsEventId },
    select: { id: true },
  });

  if (existingPrediction) return;

  // Fetch event details with bookmakers and markets
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

  // Prepare the odds data for the prediction
  const oddsData = encode(event);

  // Request OpenAI for prediction content (enhanced prompt + 400-word sections)
  let completion;
  try {
    completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are a seasoned, sharp, slightly degenerate sports bettor — a mix of film junkie, data nerd, and Vegas insider. You talk in confident sportsbook language. You never mention being an AI. Base reasoning ONLY on the provided odds data.
`.trim(),
        },
        {
          role: "user",
          content: `
Write a prediction article using this structure:

1. Game Overview — 1–2 sentences.
2. Team A Season Snapshot — record, ATS/O-U, identity, trends.
3. Team B Season Snapshot — same but contrasting.
4. Matchup Breakdown — who has the edge and why.
5. Predictions:
   - Spread Pick
   - Over/Under Pick
   - Player Prop Pick

IMPORTANT LENGTH RULE:
Every content section (every field ending with "-content") MUST be AT LEAST 400 words.
No summaries. No short answers. Provide deep, detailed, analytical breakdowns.

OUTPUT FORMAT (NO MARKDOWN, FOLLOW EXACTLY):

article-title: <title>

game-overview-heading: <heading>
game-overview-content: <content>

team-a-season-heading: <heading>
team-a-season-content: <content>

team-b-season-heading: <heading>
team-b-season-content: <content>

matchup-breakdown-heading: <heading>
matchup-breakdown-content: <content>

spread-pick-heading: <heading>
spread-pick-content: <content>

over-under-pick-heading: <heading>
over-under-pick-content: <content>

player-prop-pick-heading: <heading>
player-prop-pick-content: <content>

DATA:
${oddsData}
`.trim(),
        },
      ],
    });
  } catch (error) {
    console.error("Error calling OpenAI API for event prediction", {
      oddsEventId,
      error,
    });
    throw new Error("Error generating prediction with OpenAI.");
  }

  if (!completion || !completion.choices || completion.choices.length === 0) {
    throw new Error("Error: No choices found in OpenAI response.");
  }

  const content = completion.choices[0].message.content ?? "";

  if (typeof content !== "string") {
    throw new Error("Unexpected OpenAI response format.");
  }

  // Helper to extract content between labels
  const extract = (label: string, nextLabel?: string) => {
    const start = content.indexOf(label);
    if (start === -1) return "";
    const begin = start + label.length;

    if (!nextLabel) {
      return content.slice(begin).trim();
    }

    const end = content.indexOf(nextLabel);
    if (end === -1) {
      return content.slice(begin).trim();
    }

    return content.slice(begin, end).trim();
  };

  // Parse all sections
  const articleTitle = extract("article-title:", "game-overview-heading:");

  const gameOverviewHeading = extract(
    "game-overview-heading:",
    "game-overview-content:"
  );
  const gameOverviewDescription = extract(
    "game-overview-content:",
    "team-a-season-heading:"
  );

  const teamASeasonHeading = extract(
    "team-a-season-heading:",
    "team-a-season-content:"
  );
  const teamASeasonDescription = extract(
    "team-a-season-content:",
    "team-b-season-heading:"
  );

  const teamBSeasonHeading = extract(
    "team-b-season-heading:",
    "team-b-season-content:"
  );
  const teamBSeasonDescription = extract(
    "team-b-season-content:",
    "matchup-breakdown-heading:"
  );

  const matchupBreakdownHeading = extract(
    "matchup-breakdown-heading:",
    "matchup-breakdown-content:"
  );
  const matchupBreakdownDescription = extract(
    "matchup-breakdown-content:",
    "spread-pick-heading:"
  );

  const spreadPickHeading = extract(
    "spread-pick-heading:",
    "spread-pick-content:"
  );
  const spreadPickDescription = extract(
    "spread-pick-content:",
    "over-under-pick-heading:"
  );

  const overUnderPickHeading = extract(
    "over-under-pick-heading:",
    "over-under-pick-content:"
  );
  const overUnderPickDescription = extract(
    "over-under-pick-content:",
    "player-prop-pick-heading:"
  );

  const playerPropPickHeading = extract(
    "player-prop-pick-heading:",
    "player-prop-pick-content:"
  );
  const playerPropPickDescription = extract("player-prop-pick-content:");

  // Store prediction in the database using the new schema
  try {
    await prisma.eventprediction.create({
      data: {
        articleTitle,
        gameOverviewHeading,
        gameOverviewDescription,
        teamASeasonHeading,
        teamASeasonDescription,
        teamBSeasonHeading,
        teamBSeasonDescription,
        matchupBreakdownHeading,
        matchupBreakdownDescription,
        spreadPickHeading,
        spreadPickDescription,
        overUnderPickHeading,
        overUnderPickDescription,
        playerPropPickHeading,
        playerPropPickDescription,
        oddsEventId,
      },
    });
  } catch (error) {
    console.error("Error saving event prediction to the database", {
      oddsEventId,
      error,
    });
  }
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
  const existing = await prisma.oddsEvent.findUnique({
    where: { id: e.id },
    select: { id: true },
  });

  const isNewEvent = !existing;
  const randomNumber = Math.floor(Math.random() * 10) + 1;

  const sportKey = e.sport_title.toLowerCase();

  const imagehero = heroImages[sportKey][randomNumber];
  const eventRow = await prisma.oddsEvent.upsert({
    where: { id: e.id },
    create: {
      id: e.id,
      sportKey: e.sport_key,
      sportTitle: e.sport_title,
      commenceTime: new Date(e.commence_time),
      homeTeam: e.home_team,
      awayTeam: e.away_team,
      image: imagehero,
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
          lt: new Date(),
        },
      },
    },
  });

  await prisma.oddsEvent.findMany({
    where: {
      commenceTime: {
        lt: new Date(),
      },
    },
  });
}

// Main sync function
export async function POST(options?: { prune?: boolean }) {
  const { prune = true } = options ?? {};

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

    return NextResponse.json(
      {
        success: true,
        message: "Odds processed successfully",
      },
      { status: 200 }
    );
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
