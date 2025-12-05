// lib/sync-odds.ts
import axios, { AxiosError } from "axios";
import { prisma } from "@/lib/prisma";
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

const heroImages: any = {
  nfl: [
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764926595/view-american-football-ball-with-helmet_khu88k.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764005864/zimrypnrhrjonxok7m1l_qotb9f.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764927297/project-290-BajUXIzm87U-unsplash_ks3e8q.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764927298/ameer-basheer-Yzef5dRpwWg-unsplash_bxqjzu.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764927298/dave-adamson--nATH0CrkMU-unsplash_s9w3cd.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764927300/deon-a-webster-pXz8Vh3gFpw-unsplash_uznl54.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764927986/ryan-reinoso-Gf0oz8mgd1Y-unsplash_sdsefl.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764927987/patrick-ogilvie-GB9XKDZWwp0-unsplash_nmkkyw.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764927984/joshua-hoehne-rWxxEgUIfIw-unsplash_fnqqow.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764927986/gene-gallin-WY4Siei3lHo-unsplash_kqtjwz.webp",
  ],
  nba: [
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764006042/yupwwib1de27oesav68o_z3ie1j.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764929243/diane-picchiottino-w_LBxBvafMM-unsplash_zekdlh.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764006041/mnmscz0pfqocfqxuuwwi_ryttsx.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764006041/ulga24zh6dbnehbp8jqm_lgruik.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764929244/side-view-basket-with-ball-it_jovjde.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764006040/pexels-jimmy-liao-3615017-12602140_nxi1ax.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764006040/m13fwawmke2hz2qansbl_uhzyyc.webp", //color
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764929991/360_F_899774739_tgiiMlPrvv648yRJ3oqMDnQKuyBz6cDs_o7n8ao.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764929993/taylor-smith-nYg4BDP86Aw-unsplash_lodt1n.webp",
    "https://res.cloudinary.com/dmlemjrcg/image/upload/v1764929992/wesley-tingey-V3fpPg7aBYI-unsplash_uxxhoo.webp",
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

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

  // Request OpenAI for prediction content
  let completion;
  try {
    completion = await openaiClient.chat.completions.create({
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
- Start with a short, catchy introduction.
- Write 3 distinct sections:
  1. **How Team 1 Can Win**: Analyze the key factors (recent form, head-to-head, odds, strengths/weaknesses, home/away, injuries) and explain why Team 1 is likely to win.
  2. **How Team 2 Can Win**: Analyze the key factors and explain why Team 2 is likely to win.
  3. **Overall Summary and Final Prediction**: Provide an overall summary with your final prediction.

OUTPUT FORMAT (VERY IMPORTANT – FOLLOW EXACTLY):

article-title: <a short, catchy title for the prediction article>
article-1-heading: <how Team 1 can win, catchy heading>
article-1-content: <detailed content about how Team 1 can win>
article-2-heading: <how Team 2 can win, catchy heading>
article-2-content: <detailed content about how Team 2 can win>
article-3-heading: <overall summary and final prediction heading>
article-3-content: <overall summary and final prediction>

FORMAT RULES:
- Do NOT use any markdown formatting at all (no #, ##, ###, *, -, _, or ---).
- Do NOT add any other fields or labels besides the ones specified.
- Do NOT put blank titles or dummy text; all fields must be meaningful.

Here is the data to use:
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

  // Parse content into structured sections
  const titleLabel = "article-title:";
  const section1HeadingLabel = "article-1-heading:";
  const section1ContentLabel = "article-1-content:";
  const section2HeadingLabel = "article-2-heading:";
  const section2ContentLabel = "article-2-content:";
  const section3HeadingLabel = "article-3-heading:";
  const section3ContentLabel = "article-3-content:";

  const titleIndex = content.indexOf(titleLabel);
  const section1HeadingIndex = content.indexOf(section1HeadingLabel);
  const section1ContentIndex = content.indexOf(section1ContentLabel);
  const section2HeadingIndex = content.indexOf(section2HeadingLabel);
  const section2ContentIndex = content.indexOf(section2ContentLabel);
  const section3HeadingIndex = content.indexOf(section3HeadingLabel);
  const section3ContentIndex = content.indexOf(section3ContentLabel);

  let articleTitle = "";
  let article1Heading = "";
  let article1Content = "";
  let article2Heading = "";
  let article2Content = "";
  let article3Heading = "";
  let article3Content = "";

  if (titleIndex !== -1) {
    articleTitle = content
      .slice(titleIndex + titleLabel.length, section1HeadingIndex)
      .trim();
  }
  if (section1HeadingIndex !== -1 && section1ContentIndex !== -1) {
    article1Heading = content
      .slice(
        section1HeadingIndex + section1HeadingLabel.length,
        section1ContentIndex
      )
      .trim();
    article1Content = content
      .slice(
        section1ContentIndex + section1ContentLabel.length,
        section2HeadingIndex
      )
      .trim();
  }
  if (section2HeadingIndex !== -1 && section2ContentIndex !== -1) {
    article2Heading = content
      .slice(
        section2HeadingIndex + section2HeadingLabel.length,
        section2ContentIndex
      )
      .trim();
    article2Content = content
      .slice(
        section2ContentIndex + section2ContentLabel.length,
        section3HeadingIndex
      )
      .trim();
  }
  if (section3HeadingIndex !== -1 && section3ContentIndex !== -1) {
    article3Heading = content
      .slice(
        section3HeadingIndex + section3HeadingLabel.length,
        section3ContentIndex
      )
      .trim();
    article3Content = content
      .slice(section3ContentIndex + section3ContentLabel.length)
      .trim();
  }

  // Store prediction in the database
  try {
    await prisma.eventprediction.create({
      data: {
        articleTitle: articleTitle,
        article1Heading: article1Heading,
        article1Description: article1Content,
        article2Heading: article2Heading,
        article2Description: article2Content,
        article3Heading: article3Heading,
        article3Description: article3Content,
        oddsEventId: oddsEventId,
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
        lt: new Date(), // anything before "now"
      },
    },
  });
}

// Main sync function
async function handler(options?: { prune?: boolean }) {
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

export async function GET() {
  const result = await handler({ prune: true });

  return Response.json(result, {
    status: result.success ? 200 : 500,
  });
}
