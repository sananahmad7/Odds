

export interface UpcomingGame {
  id: string
  league: "NFL" | "NBA" | "MLB" | "NCAAF" | "NCAAB" | "UFC"
  homeTeam: {
    name: string
    logo: string
    seed?: number
  }
  awayTeam: {
    name: string
    logo: string
    seed?: number
  }
  kickoffTime: string
  date: string
  venue?: string
  odds: {
    spread: string
    total: string
    moneyline: string
  }
  prediction: string
  confidence: number
}

export const upcomingGames: UpcomingGame[] = [
  // NFL Games
  {
    id: "nfl-1",
    league: "NFL",
    homeTeam: { name: "Dallas Cowboys", logo: "🏈" },
    awayTeam: { name: "Philadelphia Eagles", logo: "🏈" },
    kickoffTime: "Sun, Jan 5 • 1:00 PM ET",
    date: "Jan 5, 2025",
    venue: "AT&T Stadium",
    odds: { spread: "PHI -3.5", total: "O/U 45.5", moneyline: "PHI -165" },
    prediction: "Eagles Win",
    confidence: 78,
  },
  {
    id: "nfl-2",
    league: "NFL",
    homeTeam: { name: "Kansas City Chiefs", logo: "🏈" },
    awayTeam: { name: "Buffalo Bills", logo: "🏈" },
    kickoffTime: "Sun, Jan 5 • 4:25 PM ET",
    date: "Jan 5, 2025",
    venue: "Arrowhead Stadium",
    odds: { spread: "KC -2.5", total: "O/U 47", moneyline: "KC -140" },
    prediction: "Chiefs Win",
    confidence: 82,
  },
  {
    id: "nfl-3",
    league: "NFL",
    homeTeam: { name: "San Francisco 49ers", logo: "🏈" },
    awayTeam: { name: "Detroit Lions", logo: "🏈" },
    kickoffTime: "Sun, Jan 5 • 8:20 PM ET",
    date: "Jan 5, 2025",
    venue: "Levi's Stadium",
    odds: { spread: "SF -4", total: "O/U 48", moneyline: "SF -180" },
    prediction: "49ers Win",
    confidence: 75,
  },
  {
    id: "nfl-4",
    league: "NFL",
    homeTeam: { name: "Baltimore Ravens", logo: "🏈" },
    awayTeam: { name: "Pittsburgh Steelers", logo: "🏈" },
    kickoffTime: "Mon, Jan 6 • 8:15 PM ET",
    date: "Jan 6, 2025",
    venue: "M&T Bank Stadium",
    odds: { spread: "BAL -5.5", total: "O/U 42", moneyline: "BAL -220" },
    prediction: "Ravens Win",
    confidence: 79,
  },
  {
    id: "nfl-5",
    league: "NFL",
    homeTeam: { name: "Green Bay Packers", logo: "🏈" },
    awayTeam: { name: "Chicago Bears", logo: "🏈" },
    kickoffTime: "Sun, Jan 5 • 1:00 PM ET",
    date: "Jan 5, 2025",
    venue: "Lambeau Field",
    odds: { spread: "GB -3", total: "O/U 44", moneyline: "GB -150" },
    prediction: "Packers Win",
    confidence: 71,
  },
  {
    id: "nfl-6",
    league: "NFL",
    homeTeam: { name: "New England Patriots", logo: "🏈" },
    awayTeam: { name: "Miami Dolphins", logo: "🏈" },
    kickoffTime: "Sun, Jan 5 • 1:00 PM ET",
    date: "Jan 5, 2025",
    venue: "Gillette Stadium",
    odds: { spread: "MIA -4", total: "O/U 41", moneyline: "MIA -180" },
    prediction: "Dolphins Win",
    confidence: 73,
  },

  // NBA Games
  {
    id: "nba-1",
    league: "NBA",
    homeTeam: { name: "Boston Celtics", logo: "🏀" },
    awayTeam: { name: "Los Angeles Lakers", logo: "🏀" },
    kickoffTime: "Sun, Jan 5 • 7:30 PM ET",
    date: "Jan 5, 2025",
    venue: "TD Garden",
    odds: { spread: "BOS -4.5", total: "O/U 233.5", moneyline: "BOS -180" },
    prediction: "Celtics Win",
    confidence: 81,
  },
  {
    id: "nba-2",
    league: "NBA",
    homeTeam: { name: "Denver Nuggets", logo: "🏀" },
    awayTeam: { name: "Golden State Warriors", logo: "🏀" },
    kickoffTime: "Sun, Jan 5 • 9:00 PM ET",
    date: "Jan 5, 2025",
    venue: "Ball Arena",
    odds: { spread: "DEN -2", total: "O/U 228", moneyline: "DEN -110" },
    prediction: "Nuggets Win",
    confidence: 76,
  },
  {
    id: "nba-3",
    league: "NBA",
    homeTeam: { name: "Miami Heat", logo: "🏀" },
    awayTeam: { name: "New York Knicks", logo: "🏀" },
    kickoffTime: "Sun, Jan 5 • 7:00 PM ET",
    date: "Jan 5, 2025",
    venue: "FTX Arena",
    odds: { spread: "NYK -3", total: "O/U 215", moneyline: "NYK -140" },
    prediction: "Knicks Win",
    confidence: 74,
  },
  {
    id: "nba-4",
    league: "NBA",
    homeTeam: { name: "Phoenix Suns", logo: "🏀" },
    awayTeam: { name: "Dallas Mavericks", logo: "🏀" },
    kickoffTime: "Sun, Jan 5 • 10:00 PM ET",
    date: "Jan 5, 2025",
    venue: "Footprint Center",
    odds: { spread: "PHX -1.5", total: "O/U 225", moneyline: "PHX -110" },
    prediction: "Suns Win",
    confidence: 72,
  },
  {
    id: "nba-5",
    league: "NBA",
    homeTeam: { name: "Milwaukee Bucks", logo: "🏀" },
    awayTeam: { name: "Chicago Bulls", logo: "🏀" },
    kickoffTime: "Sun, Jan 5 • 8:00 PM ET",
    date: "Jan 5, 2025",
    venue: "Fiserv Forum",
    odds: { spread: "MIL -6", total: "O/U 220", moneyline: "MIL -240" },
    prediction: "Bucks Win",
    confidence: 83,
  },
  {
    id: "nba-6",
    league: "NBA",
    homeTeam: { name: "Los Angeles Clippers", logo: "🏀" },
    awayTeam: { name: "Sacramento Kings", logo: "🏀" },
    kickoffTime: "Sun, Jan 5 • 10:30 PM ET",
    date: "Jan 5, 2025",
    venue: "Crypto.com Arena",
    odds: { spread: "LAC -2.5", total: "O/U 231", moneyline: "LAC -130" },
    prediction: "Clippers Win",
    confidence: 70,
  },

  // MLB Games
  {
    id: "mlb-1",
    league: "MLB",
    homeTeam: { name: "New York Yankees", logo: "⚾" },
    awayTeam: { name: "Houston Astros", logo: "⚾" },
    kickoffTime: "Wed, Oct 29 • 8:00 PM ET",
    date: "Oct 29, 2025",
    venue: "Yankee Stadium",
    odds: { spread: "NYY -1.5", total: "O/U 8.5", moneyline: "NYY -140" },
    prediction: "Yankees Win",
    confidence: 77,
  },
  {
    id: "mlb-2",
    league: "MLB",
    homeTeam: { name: "Los Angeles Dodgers", logo: "⚾" },
    awayTeam: { name: "Boston Red Sox", logo: "⚾" },
    kickoffTime: "Wed, Oct 29 • 8:30 PM ET",
    date: "Oct 29, 2025",
    venue: "Dodger Stadium",
    odds: { spread: "LAD -2", total: "O/U 9", moneyline: "LAD -160" },
    prediction: "Dodgers Win",
    confidence: 79,
  },
  {
    id: "mlb-3",
    league: "MLB",
    homeTeam: { name: "Atlanta Braves", logo: "⚾" },
    awayTeam: { name: "Philadelphia Phillies", logo: "⚾" },
    kickoffTime: "Wed, Oct 29 • 7:00 PM ET",
    date: "Oct 29, 2025",
    venue: "Truist Park",
    odds: { spread: "ATL -1", total: "O/U 8", moneyline: "ATL -120" },
    prediction: "Braves Win",
    confidence: 72,
  },
  {
    id: "mlb-4",
    league: "MLB",
    homeTeam: { name: "Chicago Cubs", logo: "⚾" },
    awayTeam: { name: "St. Louis Cardinals", logo: "⚾" },
    kickoffTime: "Wed, Oct 29 • 8:00 PM ET",
    date: "Oct 29, 2025",
    venue: "Wrigley Field",
    odds: { spread: "CHC -1.5", total: "O/U 8.5", moneyline: "CHC -135" },
    prediction: "Cubs Win",
    confidence: 68,
  },
  {
    id: "mlb-5",
    league: "MLB",
    homeTeam: { name: "San Francisco Giants", logo: "⚾" },
    awayTeam: { name: "San Diego Padres", logo: "⚾" },
    kickoffTime: "Wed, Oct 29 • 10:00 PM ET",
    date: "Oct 29, 2025",
    venue: "Oracle Park",
    odds: { spread: "SFG -0.5", total: "O/U 7.5", moneyline: "SFG -110" },
    prediction: "Giants Win",
    confidence: 65,
  },
  {
    id: "mlb-6",
    league: "MLB",
    homeTeam: { name: "Toronto Blue Jays", logo: "⚾" },
    awayTeam: { name: "Tampa Bay Rays", logo: "⚾" },
    kickoffTime: "Wed, Oct 29 • 7:00 PM ET",
    date: "Oct 29, 2025",
    venue: "Rogers Centre",
    odds: { spread: "TOR -1", total: "O/U 8", moneyline: "TOR -120" },
    prediction: "Blue Jays Win",
    confidence: 70,
  },

  // NCAAF Games
  {
    id: "ncaaf-1",
    league: "NCAAF",
    homeTeam: { name: "Alabama Crimson Tide", logo: "🏈" },
    awayTeam: { name: "Georgia Bulldogs", logo: "🏈" },
    kickoffTime: "Sat, Jan 4 • 3:30 PM ET",
    date: "Jan 4, 2025",
    venue: "Bryant-Denny Stadium",
    odds: { spread: "ALA -3", total: "O/U 52", moneyline: "ALA -150" },
    prediction: "Alabama Win",
    confidence: 76,
  },
  {
    id: "ncaaf-2",
    league: "NCAAF",
    homeTeam: { name: "Ohio State Buckeyes", logo: "🏈" },
    awayTeam: { name: "Michigan Wolverines", logo: "🏈" },
    kickoffTime: "Sat, Jan 4 • 7:30 PM ET",
    date: "Jan 4, 2025",
    venue: "Ohio Stadium",
    odds: { spread: "OSU -4.5", total: "O/U 54", moneyline: "OSU -180" },
    prediction: "Ohio State Win",
    confidence: 80,
  },
  {
    id: "ncaaf-3",
    league: "NCAAF",
    homeTeam: { name: "Clemson Tigers", logo: "🏈" },
    awayTeam: { name: "South Carolina Gamecocks", logo: "🏈" },
    kickoffTime: "Sat, Jan 4 • 1:00 PM ET",
    date: "Jan 4, 2025",
    venue: "Memorial Stadium",
    odds: { spread: "CLE -7", total: "O/U 50", moneyline: "CLE -260" },
    prediction: "Clemson Win",
    confidence: 84,
  },
  {
    id: "ncaaf-4",
    league: "NCAAF",
    homeTeam: { name: "Texas Longhorns", logo: "🏈" },
    awayTeam: { name: "Oklahoma Sooners", logo: "🏈" },
    kickoffTime: "Sat, Jan 4 • 4:00 PM ET",
    date: "Jan 4, 2025",
    venue: "Darrell K Royal Stadium",
    odds: { spread: "TEX -5", total: "O/U 56", moneyline: "TEX -200" },
    prediction: "Texas Win",
    confidence: 78,
  },
  {
    id: "ncaaf-5",
    league: "NCAAF",
    homeTeam: { name: "LSU Tigers", logo: "🏈" },
    awayTeam: { name: "Florida Gators", logo: "🏈" },
    kickoffTime: "Sat, Jan 4 • 2:30 PM ET",
    date: "Jan 4, 2025",
    venue: "Tiger Stadium",
    odds: { spread: "LSU -6", total: "O/U 51", moneyline: "LSU -220" },
    prediction: "LSU Win",
    confidence: 81,
  },
  {
    id: "ncaaf-6",
    league: "NCAAF",
    homeTeam: { name: "Notre Dame Fighting Irish", logo: "🏈" },
    awayTeam: { name: "USC Trojans", logo: "🏈" },
    kickoffTime: "Sat, Jan 4 • 8:00 PM ET",
    date: "Jan 4, 2025",
    venue: "Notre Dame Stadium",
    odds: { spread: "ND -2.5", total: "O/U 53", moneyline: "ND -130" },
    prediction: "Notre Dame Win",
    confidence: 74,
  },

  // NCAAB Games
  {
    id: "ncaab-1",
    league: "NCAAB",
    homeTeam: { name: "Duke Blue Devils", logo: "🏀" },
    awayTeam: { name: "North Carolina Tar Heels", logo: "🏀" },
    kickoffTime: "Sat, Jan 4 • 6:00 PM ET",
    date: "Jan 4, 2025",
    venue: "Cameron Indoor Stadium",
    odds: { spread: "DUKE -3.5", total: "O/U 155", moneyline: "DUKE -160" },
    prediction: "Duke Win",
    confidence: 77,
  },
  {
    id: "ncaab-2",
    league: "NCAAB",
    homeTeam: { name: "Kansas Jayhawks", logo: "🏀" },
    awayTeam: { name: "Texas Tech Red Raiders", logo: "🏀" },
    kickoffTime: "Sat, Jan 4 • 8:00 PM ET",
    date: "Jan 4, 2025",
    venue: "Allen Fieldhouse",
    odds: { spread: "KAN -5", total: "O/U 158", moneyline: "KAN -200" },
    prediction: "Kansas Win",
    confidence: 79,
  },
  {
    id: "ncaab-3",
    league: "NCAAB",
    homeTeam: { name: "UCLA Bruins", logo: "🏀" },
    awayTeam: { name: "USC Trojans", logo: "🏀" },
    kickoffTime: "Sat, Jan 4 • 9:00 PM ET",
    date: "Jan 4, 2025",
    venue: "Pauley Pavilion",
    odds: { spread: "UCLA -2", total: "O/U 152", moneyline: "UCLA -120" },
    prediction: "UCLA Win",
    confidence: 72,
  },
  {
    id: "ncaab-4",
    league: "NCAAB",
    homeTeam: { name: "Kentucky Wildcats", logo: "🏀" },
    awayTeam: { name: "Tennessee Volunteers", logo: "🏀" },
    kickoffTime: "Sat, Jan 4 • 7:30 PM ET",
    date: "Jan 4, 2025",
    venue: "Rupp Arena",
    odds: { spread: "KEN -4", total: "O/U 156", moneyline: "KEN -170" },
    prediction: "Kentucky Win",
    confidence: 75,
  },
  {
    id: "ncaab-5",
    league: "NCAAB",
    homeTeam: { name: "Arizona Wildcats", logo: "🏀" },
    awayTeam: { name: "Colorado Buffaloes", logo: "🏀" },
    kickoffTime: "Sat, Jan 4 • 10:00 PM ET",
    date: "Jan 4, 2025",
    venue: "McKale Center",
    odds: { spread: "ARI -6", total: "O/U 160", moneyline: "ARI -240" },
    prediction: "Arizona Win",
    confidence: 81,
  },
  {
    id: "ncaab-6",
    league: "NCAAB",
    homeTeam: { name: "Gonzaga Bulldogs", logo: "🏀" },
    awayTeam: { name: "BYU Cougars", logo: "🏀" },
    kickoffTime: "Sat, Jan 4 • 8:30 PM ET",
    date: "Jan 4, 2025",
    venue: "McCarthey Athletic Center",
    odds: { spread: "GONZ -3.5", total: "O/U 154", moneyline: "GONZ -160" },
    prediction: "Gonzaga Win",
    confidence: 76,
  },

  // UFC Events
  {
    id: "ufc-1",
    league: "UFC",
    homeTeam: { name: "Jon Jones", logo: "🥊" },
    awayTeam: { name: "Alex Pereira", logo: "🥊" },
    kickoffTime: "Sat, Jan 11 • 10:00 PM ET",
    date: "Jan 11, 2025",
    venue: "Madison Square Garden",
    odds: { spread: "JJ -2.5", total: "O/U 4.5", moneyline: "JJ -140" },
    prediction: "Jones Win",
    confidence: 78,
  },
  {
    id: "ufc-2",
    league: "UFC",
    homeTeam: { name: "Islam Makhachev", logo: "🥊" },
    awayTeam: { name: "Arman Tsarukyan", logo: "🥊" },
    kickoffTime: "Sat, Jan 11 • 8:30 PM ET",
    date: "Jan 11, 2025",
    venue: "Madison Square Garden",
    odds: { spread: "IM -3", total: "O/U 4", moneyline: "IM -160" },
    prediction: "Makhachev Win",
    confidence: 81,
  },
  {
    id: "ufc-3",
    league: "UFC",
    homeTeam: { name: "Sean Strickland", logo: "🥊" },
    awayTeam: { name: "Dricus du Plessis", logo: "🥊" },
    kickoffTime: "Sat, Jan 11 • 7:00 PM ET",
    date: "Jan 11, 2025",
    venue: "Madison Square Garden",
    odds: { spread: "SS -1.5", total: "O/U 4.5", moneyline: "SS -120" },
    prediction: "Strickland Win",
    confidence: 74,
  },
  {
    id: "ufc-4",
    league: "UFC",
    homeTeam: { name: "Ilia Topuria", logo: "🥊" },
    awayTeam: { name: "Max Holloway", logo: "🥊" },
    kickoffTime: "Sat, Jan 11 • 9:00 PM ET",
    date: "Jan 11, 2025",
    venue: "Madison Square Garden",
    odds: { spread: "IT -2", total: "O/U 4.5", moneyline: "IT -140" },
    prediction: "Topuria Win",
    confidence: 76,
  },
  {
    id: "ufc-5",
    league: "UFC",
    homeTeam: { name: "Colby Covington", logo: "🥊" },
    awayTeam: { name: "Leon Edwards", logo: "🥊" },
    kickoffTime: "Sat, Jan 11 • 6:00 PM ET",
    date: "Jan 11, 2025",
    venue: "Madison Square Garden",
    odds: { spread: "CC -1", total: "O/U 4", moneyline: "CC -110" },
    prediction: "Covington Win",
    confidence: 71,
  },
  {
    id: "ufc-6",
    league: "UFC",
    homeTeam: { name: "Khamzat Chimaev", logo: "🥊" },
    awayTeam: { name: "Kamaru Usman", logo: "🥊" },
    kickoffTime: "Sat, Jan 11 • 5:30 PM ET",
    date: "Jan 11, 2025",
    venue: "Madison Square Garden",
    odds: { spread: "KC -2.5", total: "O/U 4.5", moneyline: "KC -150" },
    prediction: "Chimaev Win",
    confidence: 79,
  },
]

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