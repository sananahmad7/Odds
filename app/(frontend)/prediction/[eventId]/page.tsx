// app/(frontend)/league/[eventId]/page.tsx  (or prediction/[eventId]/page.tsx)
import Link from "next/link";
import { notFound } from "next/navigation";

function getBaseUrl() {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000";

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`; // Vercel URLs are https
  }

  return url;
}

/* ===== Types matching /api/odds-detail response ===== */
type DetailOutcome = {
  id: string;
  name: string;
  price: number;
  point: number | null;
};

type DetailMarket = {
  id: string;
  key: string; // "h2h" | "spreads" | "totals"
  lastUpdate: string;
  outcomes: DetailOutcome[];
};

type DetailBookmaker = {
  id: string;
  key: string;
  title: string;
  lastUpdate: string;
  markets: DetailMarket[];
};

type DetailPrediction = {
  id: number;
  heading: string;
  description: string;
  oddsEventId: string;
  createdAt: string;
  updatedAt: string;
};

type DetailEvent = {
  id: string;
  sportKey: string;
  sportTitle: string;
  commenceTime: string;
  homeTeam: string;
  awayTeam: string;
  bookmakers: DetailBookmaker[];
  eventpredictions: DetailPrediction[];
};

/* ===== Helper functions ===== */

function pickBestBookmaker(books?: DetailBookmaker[]) {
  if (!books || books.length === 0) return undefined;

  const fanduel = books.find(
    (b) =>
      b.key?.toLowerCase() === "fanduel" || b.title?.toLowerCase() === "fanduel"
  );
  if (fanduel) return fanduel;

  return books.reduce((best, b) =>
    Date.parse(b.lastUpdate) > Date.parse(best.lastUpdate) ? b : best
  );
}

function getMarket(book: DetailBookmaker | undefined, key: string) {
  return book?.markets?.find((m) => m.key === key);
}

function findTeamOutcome(outcomes: DetailOutcome[] | undefined, team: string) {
  if (!outcomes || outcomes.length === 0) return undefined;
  const exact = outcomes.find((o) => o.name === team);
  if (exact) return exact;
  return outcomes.find((o) => !/over|under|draw/i.test(o.name));
}

function signPoint(n?: number | null) {
  if (typeof n !== "number" || Number.isNaN(n)) return "-";
  return n > 0 ? `+${n}` : `${n}`;
}
function fmtAmerican(n?: number | null) {
  if (typeof n !== "number" || Number.isNaN(n)) return "";
  return n > 0 ? `+${n}` : `\u2212${Math.abs(n)}`;
}

function buildUiOdds(e: DetailEvent) {
  const book = pickBestBookmaker(e.bookmakers);
  const h2h = getMarket(book, "h2h");
  const spreads = getMarket(book, "spreads");
  const totals = getMarket(book, "totals");

  const homeMl = findTeamOutcome(h2h?.outcomes, e.homeTeam)?.price ?? null;
  const awayMl = findTeamOutcome(h2h?.outcomes, e.awayTeam)?.price ?? null;

  const homeSpread = findTeamOutcome(spreads?.outcomes, e.homeTeam);
  const awaySpread = findTeamOutcome(spreads?.outcomes, e.awayTeam);

  const over = totals?.outcomes?.find((o) => /over/i.test(o.name));
  const under = totals?.outcomes?.find((o) => /under/i.test(o.name));

  return {
    bookmakerTitle: book?.title ?? "Latest Market",
    spread: {
      homePointText: signPoint(homeSpread?.point ?? null),
      homePriceText: fmtAmerican(homeSpread?.price ?? null) || "—",
      awayPointText: signPoint(awaySpread?.point ?? null),
      awayPriceText: fmtAmerican(awaySpread?.price ?? null) || "—",
    },
    total: {
      pointText:
        typeof (over?.point ?? under?.point) === "number"
          ? String(over?.point ?? under?.point)
          : "-",
      overText: fmtAmerican(over?.price ?? null) || "—",
      underText: fmtAmerican(under?.price ?? null) || "—",
    },
    moneyline: {
      homeMl: fmtAmerican(homeMl) || "—",
      awayMl: fmtAmerican(awayMl) || "—",
    },
  };
}

/* ===== Page component ===== */

// 👇 params is a Promise now
type PageProps = {
  params: Promise<{ eventId: string }>;
};

export default async function EventPredictionPage({ params }: PageProps) {
  // unwrap it
  const { eventId } = await params;

  const baseUrl = getBaseUrl();
  const res = await fetch(
    `${baseUrl}/api/odds-detail?eventId=${encodeURIComponent(eventId)}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error("Failed to load odds detail");
  }

  const events = (await res.json()) as DetailEvent[];
  const event = events[0];
  if (!event) {
    notFound();
  }

  const prediction = event.eventpredictions?.[0] ?? null;
  const odds = buildUiOdds(event);

  const kickoff = new Date(event.commenceTime);
  const kickoffLabel = kickoff.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const leagueSlug = event.sportTitle.toLowerCase();

  return (
    <main className="w-full bg-[#FAFAFA] min-h-screen">
      <section className="w-full py-10 sm:py-14">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="mb-6 text-xs text-gray-500 font-inter space-x-1">
            <Link href="/" className="hover:text-[#24257C]">
              Home
            </Link>
            <span>/</span>
            <Link
              href={`/league/${leagueSlug}`}
              className="hover:text-[#24257C]"
            >
              {event.sportTitle}
            </Link>
            <span>/</span>
            <span className="text-gray-700">Game Preview</span>
          </nav>

          {/* Heading */}
          <header className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#24257C] mb-2 font-inter">
              {event.sportTitle} · {kickoffLabel}
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111827] tracking-tight font-playfair">
              {event.awayTeam} vs {event.homeTeam} Odds &amp; Prediction
            </h1>
          </header>

          {/* Odds summary card */}
          <section className="mb-10">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase text-gray-500 font-inter">
                    Line from
                  </p>
                  <p className="text-sm font-semibold text-[#111827]">
                    {odds.bookmakerTitle}
                  </p>
                </div>
                <div className="text-right text-xs text-gray-500 font-inter">
                  <p className="font-medium">Kickoff</p>
                  <p>{kickoffLabel}</p>
                </div>
              </div>

              {/* Team odds */}
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 sm:p-4">
                <div className="grid grid-cols-[1fr_minmax(92px,auto)_minmax(64px,auto)] items-center gap-3 text-[11px] uppercase tracking-wide text-gray-500 font-inter mb-2">
                  <span>Team</span>
                  <span>Spread</span>
                  <span>ML</span>
                </div>

                <div className="space-y-2">
                  {/* Away row */}
                  <div className="grid grid-cols-[1fr_minmax(92px,auto)_minmax(64px,auto)] items-center gap-3">
                    <span className="text-sm text-[#111827] font-medium truncate">
                      {event.awayTeam}
                    </span>
                    <span className="text-sm font-semibold text-[#111827] font-inter [font-variant-numeric:tabular-nums]">
                      {odds.spread.awayPointText}{" "}
                      <span className="text-xs text-gray-600">
                        {odds.spread.awayPriceText}
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-[#111827] font-inter [font-variant-numeric:tabular-nums]">
                      {odds.moneyline.awayMl}
                    </span>
                  </div>

                  {/* Home row */}
                  <div className="grid grid-cols-[1fr_minmax(92px,auto)_minmax(64px,auto)] items-center gap-3">
                    <span className="text-sm text-[#111827] font-medium truncate">
                      {event.homeTeam}
                    </span>
                    <span className="text-sm font-semibold text-[#111827] font-inter [font-variant-numeric:tabular-nums]">
                      {odds.spread.homePointText}{" "}
                      <span className="text-xs text-gray-600">
                        {odds.spread.homePriceText}
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-[#111827] font-inter [font-variant-numeric:tabular-nums]">
                      {odds.moneyline.homeMl}
                    </span>
                  </div>
                </div>

                {/* Game total row */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-gray-500 font-inter mb-1">
                    <span>Game Total</span>
                    <span>Over</span>
                    <span>Under</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-semibold text-[#111827] font-inter [font-variant-numeric:tabular-nums]">
                    <span>{odds.total.pointText}</span>
                    <span>
                      O {odds.total.pointText}{" "}
                      <span className="text-xs text-gray-600">
                        {odds.total.overText}
                      </span>
                    </span>
                    <span>
                      U {odds.total.pointText}{" "}
                      <span className="text-xs text-gray-600">
                        {odds.total.underText}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Prediction article */}
          {prediction ? (
            <article className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-7 max-w-none">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] font-playfair mb-4">
                {prediction.heading}
              </h2>
              <div className="space-y-4 text-[15px] leading-relaxed text-gray-700 font-inter whitespace-pre-line">
                {prediction.description.split(/\n{2,}/).map((para, idx) => (
                  <p key={idx}>{para.trim()}</p>
                ))}
              </div>
            </article>
          ) : (
            <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-6 text-center text-gray-500 text-sm font-inter">
              Prediction article coming soon for this matchup.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
