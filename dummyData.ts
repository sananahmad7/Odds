  

export type SpreadSide = { point: number; price: number };
export type TotalOdds = { point: number; over: number; under: number };
export type MoneylineOdds = { away: number; home: number };


export interface UpcomingGame {
id: string;
league: League;
kickoffIso?: string; // preferred
// Legacy support (your component still understands these if present)
date?: string;
kickoffTime?: string;
venue?: string;
awayTeam: { name: string; logo?: string };
homeTeam: { name: string; logo?: string };
odds?: {
spread?: { away: SpreadSide; home: SpreadSide } | unknown; // robust extractor handles unknown
total?: TotalOdds;
moneyline?: MoneylineOdds;
};
}

export const upcomingGames: UpcomingGame[] = [
  {
    id: "32ec2bd4ac9e4c40f9f5cbed7e67f837",
    league: "NFL",
    kickoffIso: "2025-11-14T01:15:00Z",
    venue: "Gillette Stadium",
    awayTeam: { name: "New York Jets" },
    homeTeam: { name: "New England Patriots" },
    odds: {
      spread: { away: { point: 11.5, price: -110 }, home: { point: -11.5, price: -110 } },
      total: { point: 43.5, over: -110, under: -110 },
      moneyline: { away: 550, home: -720 },
    },
  },
  {
    id: "265f0188945bb81ec64751571eb724cb",
    league: "NFL",
    kickoffIso: "2025-11-16T14:30:00Z",
    venue: "Hard Rock Stadium",
    awayTeam: { name: "Washington Commanders" },
    homeTeam: { name: "Miami Dolphins" },
    odds: {
      spread: { away: { point: 3.0, price: -110 }, home: { point: -3.0, price: -105 } },
      total: { point: 47.5, over: -110, under: -110 },
      moneyline: { away: 135, home: -150 },
    },
  },
  {
    id: "0ae85bbc3711ad0cb94475a40e2364f0",
    league: "NFL",
    kickoffIso: "2025-11-16T18:00:00Z",
    venue: "Mercedes-Benz Stadium",
    awayTeam: { name: "Carolina Panthers" },
    homeTeam: { name: "Atlanta Falcons" },
    odds: {
      spread: { away: { point: 3.5, price: -110 }, home: { point: -3.5, price: -110 } },
      total: { point: 42.5, over: -110, under: -110 },
      moneyline: { away: 165, home: -190 },
    },
  },
  {
    id: "96377d2fb55e3cef733cecccdecaed5f",
    league: "NFL",
    kickoffIso: "2025-11-16T18:00:00Z",
    venue: "Highmark Stadium",
    awayTeam: { name: "Tampa Bay Buccaneers" },
    homeTeam: { name: "Buffalo Bills" },
    odds: {
      spread: { away: { point: 5.5, price: -110 }, home: { point: -5.5, price: -110 } },
      total: { point: 49.0, over: -110, under: -110 },
      moneyline: { away: 215, home: -250 },
    },
  },
  {
    id: "229a5e9ce60dcb344a8cc3c97121154e",
    league: "NFL",
    kickoffIso: "2025-11-16T18:00:00Z",
    venue: "U.S. Bank Stadium",
    awayTeam: { name: "Chicago Bears" },
    homeTeam: { name: "Minnesota Vikings" },
    odds: {
      spread: { away: { point: 3.0, price: -110 }, home: { point: -3.0, price: -110 } },
      total: { point: 48.5, over: -110, under: -110 },
      moneyline: { away: 140, home: -165 },
    },
  },

  // ---- Added 5 more random games ----
  {
    id: "7f8a3d9b1e7c4a0db2ca1f9f8c3a5d10",
    league: "NFL",
    kickoffIso: "2025-11-16T21:05:00Z",
    venue: "AT&T Stadium",
    awayTeam: { name: "Philadelphia Eagles" },
    homeTeam: { name: "Dallas Cowboys" },
    odds: {
      spread: { away: { point: 1.5, price: -105 }, home: { point: -1.5, price: -115 } },
      total: { point: 51.5, over: -110, under: -110 },
      moneyline: { away: 105, home: -125 },
    },
  },
  {
    id: "b3c5f2e4a19d4e0a86c2d1f3a7b9c6de",
    league: "NFL",
    kickoffIso: "2025-11-16T21:25:00Z",
    venue: "Levi's Stadium",
    awayTeam: { name: "New York Giants" },
    homeTeam: { name: "San Francisco 49ers" },
    odds: {
      spread: { away: { point: 9.5, price: -110 }, home: { point: -9.5, price: -110 } },
      total: { point: 45.0, over: -110, under: -110 },
      moneyline: { away: 360, home: -480 },
    },
  },
  {
    id: "5c9130a2ef7d4a1b8c6de1f24ab9c7e1",
    league: "NFL",
    kickoffIso: "2025-11-16T18:00:00Z",
    venue: "Acrisure Stadium",
    awayTeam: { name: "Baltimore Ravens" },
    homeTeam: { name: "Pittsburgh Steelers" },
    odds: {
      spread: { away: { point: -2.0, price: -112 }, home: { point: 2.0, price: -108 } },
      total: { point: 41.5, over: -110, under: -110 },
      moneyline: { away: -130, home: 115 },
    },
  },
  {
    id: "e2a4f6b8c0d94f13a7b2c6d1e9f38a75",
    league: "NFL",
    kickoffIso: "2025-11-16T18:00:00Z",
    venue: "Lambeau Field",
    awayTeam: { name: "New Orleans Saints" },
    homeTeam: { name: "Green Bay Packers" },
    odds: {
      spread: { away: { point: 4.0, price: -110 }, home: { point: -4.0, price: -110 } },
      total: { point: 44.5, over: -110, under: -110 },
      moneyline: { away: 165, home: -190 },
    },
  },
  {
    id: "a18f0c2b9d3046d2b8c7e1f4a9c3d5e7",
    league: "NFL",
    kickoffIso: "2025-11-17T01:20:00Z",
    venue: "Allegiant Stadium",
    awayTeam: { name: "Kansas City Chiefs" },
    homeTeam: { name: "Las Vegas Raiders" },
    odds: {
      spread: { away: { point: -7.0, price: -110 }, home: { point: 7.0, price: -110 } },
      total: { point: 52.0, over: -110, under: -110 },
      moneyline: { away: -300, home: 245 },
    },
  },
];




export interface NavLink {
  label: string
  href: string
}

export const navLinks: NavLink[] = [
  { label: "Predictions", href: "/predictions" },
  { label: "Leagues", href: "/leagues" },
  { label: "Analysis", href: "/analysis" },
]



export type League = "NFL" | "NBA" | "NCAAF" | "NCAAB" | "MLB" | "UFC";

export type ContentBlock = {
  type: "heading" | "subheading" | "text" | "image";
  content: string;       // text content or image URL
  description?: string;  // optional caption for images
};

export type BlogArticle = {
 
  slug: string;
  title: string;
  description: string;
  thumbnail: string; // Pexels images for all
  league: League;    // ⬅️ replaces categories
  publishedAt: string; // ISO
  isFeatured?: boolean;
  published: boolean;
  content: ContentBlock[];
};

// ---------- Articles (all published; exactly 3 featured) ----------
export const blogArticles: BlogArticle[] = [
  // NFL
  {
    slug: "why-the-49ers-are-undervalued-this-week",
    title: "Why the 49ers Are Undervalued This Week",
    description:
      "San Francisco could exploit a key matchup advantage on early downs. We break down the numbers and how to play it.",
    thumbnail:
      "https://images.pexels.com/photos/32911056/pexels-photo-32911056.jpeg?auto=compress&cs=tinysrgb&w=1200",
    league: "NFL",
    publishedAt: "2025-01-02T15:10:00.000Z",
    isFeatured: false,
    published: true,
    content: [
      { type: "heading", content: "Matchup Overview" },
      {
        type: "text",
        content:
          "The 49ers’ early-down run efficiency creates favorable second-and-short situations that limit obvious passing downs.",
      },
      {
        type: "image",
        content:
          "https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=1600",
        description: "Inside zone rep — clean second-level access.",
      },
      { type: "subheading", content: "Trenches & Scheme" },
      {
        type: "text",
        content:
          "Outside zone with split-flow looks stress the second level; expect motion to force linebackers to declare.",
      },
      {
        type: "image",
        content:
          "https://images.pexels.com/photos/1618269/pexels-photo-1618269.jpeg?auto=compress&cs=tinysrgb&w=1600",
        description: "Motion to widen the hook/curl defenders.",
      },
      {
        type: "text",
        content:
          "If San Francisco sustains drives, explosive play rate rises off play-action crossers.",
      },
    ],
  },
  {
    slug: "eagles-vs-cowboys-primer-odds-and-picks",
    title: "Eagles vs Cowboys Primer: Odds & Picks",
    description:
      "Updated lines, matchup edges, and our favorite prop angles for the NFC clash.",
    thumbnail:
      "https://images.pexels.com/photos/29424198/pexels-photo-29424198.jpeg?auto=compress&cs=tinysrgb&w=1200",
    league: "NFL",
    publishedAt: "2025-01-03T12:00:00.000Z",
    isFeatured: true,   // ⭐ featured #1
    published: true,
    content: [
      { type: "heading", content: "How the Lines Moved" },
      {
        type: "text",
        content:
          "Market opened near a field goal and tightened as injury reports favored the home front seven.",
      },
      {
        type: "image",
        content:
          "https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=1600",
        description: "Warmups on the sideline before kickoff.",
      },
      { type: "subheading", content: "Attack Surfaces" },
      {
        type: "text",
        content:
          "Dallas can leverage quick game to neutralize edge pressure; look for slant/flat combos and RB angle routes.",
      },
      {
        type: "text",
        content:
          "Prop lean: WR targets over if single-high shells persist on early downs.",
      },
    ],
  },

  // NBA
  {
    slug: "best-bets-for-lakers-vs-nuggets",
    title: "Best Bets for Lakers vs Nuggets",
    description:
      "Our model favors Denver on the glass and pace. Here’s how that translates into value on the spread and total.",
    thumbnail:
      "https://images.pexels.com/photos/30555514/pexels-photo-30555514.jpeg?auto=compress&cs=tinysrgb&w=1200",
    league: "NBA",
    publishedAt: "2025-01-04T09:30:00.000Z",
    isFeatured: true,   // ⭐ featured #2
    published: true,
    content: [
      { type: "heading", content: "Glass Advantage" },
      {
        type: "image",
        content:
          "https://images.pexels.com/photos/358042/pexels-photo-358042.jpeg?auto=compress&cs=tinysrgb&w=1600",
        description: "Crash rate on the offensive glass matters here.",
      },
      {
        type: "text",
        content:
          "Second-chance points swing the median outcome; Denver’s ORB% edge pushes the total upward.",
      },
      { type: "subheading", content: "Tempo & Shot Quality" },
      {
        type: "text",
        content:
          "If transition frequency rises, Lakers’ rim attempts go up but midrange volume also increases.",
      },
      {
        type: "text",
        content:
          "Spread model: Nuggets -3.5 fair; total leans over if FT rate climbs above league average.",
      },
    ],
  },
  {
    slug: "knicks-defense-and-the-under-trend",
    title: "The Knicks’ Defense and the Under Trend",
    description:
      "Why New York’s drop coverage continues to cash unders against elite guards.",
    thumbnail:
      "https://images.pexels.com/photos/1301315/pexels-photo-1301315.jpeg?auto=compress&cs=tinysrgb&w=1200",
    league: "NBA",
    publishedAt: "2025-01-05T11:45:00.000Z",
    isFeatured: false,
    published: true,
    content: [
      { type: "heading", content: "Drop Coverage Discipline" },
      {
        type: "text",
        content:
          "New York concedes pull-up midrange while walling off the rim; star guards settle for low-EV looks.",
      },
      {
        type: "image",
        content:
          "https://images.pexels.com/photos/159011/basketball-dunk-silhouette-sunset-159011.jpeg?auto=compress&cs=tinysrgb&w=1600",
        description: "Drop big sitting at the level: keep everything in front.",
      },
      { type: "subheading", content: "Rotation Tightening" },
      {
        type: "text",
        content:
          "Shorter rotations reduce defensive mistakes and foul variance, supporting unders in tight games.",
      },
    ],
  },

  // NCAAF
  {
    slug: "betting-on-a-low-scoring-affair-in-the-sfc",
    title: "Betting on a Low-Scoring Affair in the SFC?",
    description:
      "Two top-10 defenses collide. We dig into pace, finishing drives, and red-zone rates.",
    thumbnail:
      "https://images.pexels.com/photos/15338952/pexels-photo-15338952.jpeg?auto=compress&cs=tinysrgb&w=1200",
    league: "NCAAF",
    publishedAt: "2025-01-04T14:05:00.000Z",
    isFeatured: true,   // ⭐ featured #3
    published: true,
    content: [
      { type: "heading", content: "Pace & Possessions" },
      {
        type: "text",
        content:
          "Both teams rank bottom-third in seconds per snap; fewer drives support a lower total.",
      },
      {
        type: "image",
        content:
          "https://images.pexels.com/photos/1618261/pexels-photo-1618261.jpeg?auto=compress&cs=tinysrgb&w=1600",
        description: "Field position battle shapes total outcomes.",
      },
      { type: "subheading", content: "Finishing Drives" },
      {
        type: "text",
        content:
          "Red-zone TD% trends down when facing top-25 havoc rates; field goals become more likely.",
      },
    ],
  },

  // NCAAB
  {
    slug: "big-ten-clash-live-dog-on-the-road",
    title: "Big Ten Clash: Live Dog on the Road",
    description:
      "Tempo edge and rim defense point to value on the visiting side.",
    thumbnail:
      "https://images.pexels.com/photos/32965264/pexels-photo-32965264.jpeg?auto=compress&cs=tinysrgb&w=1200",
    league: "NCAAB",
    publishedAt: "2025-01-06T10:20:00.000Z",
    isFeatured: false,
    published: true,
    content: [
      { type: "heading", content: "Road Dog Profile" },
      {
        type: "text",
        content:
          "Superior rim deterrence and defensive rebounding keep games within one or two possessions late.",
      },
      {
        type: "image",
        content:
          "https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=1600",
        description: "Contest without fouling: the visiting blueprint.",
      },
      { type: "subheading", content: "Half-Court Offense" },
      {
        type: "text",
        content:
          "Backdoor sets vs. overplays generate layups; expect late shot-clock post touches to slow tempo.",
      },
    ],
  },

  // MLB
  {
    slug: "strikeout-props-to-target-on-tuesday",
    title: "Strikeout Props to Target on Tuesday",
    description:
      "Pitcher whiff rates and opponent chase profiles highlight two plus-EV K props.",
    thumbnail:
      "https://images.pexels.com/photos/17724027/pexels-photo-17724027.jpeg?auto=compress&cs=tinysrgb&w=1200",
    league: "MLB",
    publishedAt: "2025-01-07T08:00:00.000Z",
    isFeatured: false,
    published: true,
    content: [
      { type: "heading", content: "Pitch Model Signals" },
      {
        type: "text",
        content:
          "High CSW% sliders vs. elevated chase rates create pathways to 7+ Ks at modest pitch counts.",
      },
      {
        type: "image",
        content:
          "https://images.pexels.com/photos/311040/pexels-photo-311040.jpeg?auto=compress&cs=tinysrgb&w=1600",
        description: "Glove-side slider tunneling off four-seam.",
      },
      { type: "subheading", content: "Opposition Swing Paths" },
      {
        type: "text",
        content:
          "Uppercut tendencies meet elevated four-seamers; whiffs spike when ahead in the count.",
      },
    ],
  },

  // UFC
  {
    slug: "co-main-event-stylistic-breakdown",
    title: "Co-Main Event: Stylistic Breakdown",
    description:
      "Southpaw countering vs. wrestle-heavy pressure — who dictates terms in the pocket?",
    thumbnail:
      "https://images.pexels.com/photos/28560745/pexels-photo-28560745.jpeg?auto=compress&cs=tinysrgb&w=1200",
    league: "UFC",
    publishedAt: "2025-01-08T18:30:00.000Z",
    isFeatured: false,
    published: true,
    content: [
      { type: "heading", content: "Range Management" },
      {
        type: "text",
        content:
          "Southpaw counters punish squared entries; level changes must be disguised behind feints.",
      },
      {
        type: "image",
        content:
          "https://images.pexels.com/photos/4761797/pexels-photo-4761797.jpeg?auto=compress&cs=tinysrgb&w=1600",
        description: "Counter-left timing the step-in jab.",
      },
      { type: "subheading", content: "Cardio & Minute-Winning" },
      {
        type: "text",
        content:
          "If the pressure fighter can chain wrestle past R2, control time becomes decisive on the cards.",
      },
    ],
  },
  {
    slug: "three-underdogs-live-on-saturday",
    title: "Three Underdogs Live on Saturday",
    description:
      "Cardio durability and minute-winning tools make these dogs interesting.",
    thumbnail:
      "https://images.pexels.com/photos/4761663/pexels-photo-4761663.jpeg?auto=compress&cs=tinysrgb&w=1200",
    league: "UFC",
    publishedAt: "2025-01-08T20:10:00.000Z",
    isFeatured: false,
    published: true,
    content: [
      { type: "heading", content: "Live Dog Criteria" },
      {
        type: "text",
        content:
          "Durability plus attritional offense (low output, high accuracy) can flip rounds late.",
      },
      {
        type: "image",
        content:
          "https://images.pexels.com/photos/4761797/pexels-photo-4761797.jpeg?auto=compress&cs=tinysrgb&w=1600",
        description: "Octagon control and cage wrestling exchanges.",
      },
      { type: "subheading", content: "Paths to Upsets" },
      {
        type: "text",
        content:
          "Counter-lefts and body work tax forward pressure; look for late momentum swings in R3.",
      },
    ],
  },
];