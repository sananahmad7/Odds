// components/Home/UpcomingGames.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { FaFootballBall } from "react-icons/fa";
import { upcomingGames } from "@/dummyData";
import type { UpcomingGame } from "@/dummyData";

/** ---------- Team avatar: football icon only (no text logos) ---------- */
function TeamAvatar({ name }: { name: string }) {
  return (
    <span className="text-[#24257C]" aria-label={`${name} logo`}>
      <FaFootballBall className="w-7 h-7" />
    </span>
  );
}

/** Parse a kickoff timestamp (ms) from game fields. */
function getKickoffTimestampFromGame(game: UpcomingGame): number {
  const maybeKickoffTs = (game as any)?.kickoffTs;
  if (typeof maybeKickoffTs === "number") return maybeKickoffTs;

  const iso = (game as any)?.kickoffIso ?? (game as any)?.commence_time;
  if (typeof iso === "string") {
    const p = Date.parse(iso);
    if (Number.isFinite(p)) return p;
  }

  const timePart =
    (game as any).kickoffTime?.match(/\b\d{1,2}:\d{2}\s?[AP]M\b/i)?.[0] ?? "";
  const tzPart =
    (game as any).kickoffTime?.match(/\b(ET|CT|MT|PT)\b/i)?.[0] ?? "";
  const composed = timePart
    ? `${(game as any).date} ${timePart}${tzPart ? ` ${tzPart}` : ""}`
    : (game as any).date;
  const parsed = Date.parse(composed as string);
  return Number.isFinite(parsed) ? parsed : NaN;
}

/** Keep if unknown; otherwise require within the next 7 days. */
function isWithinNextSevenDays(ts: number, nowMs: number) {
  if (!Number.isFinite(ts)) return true;
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  return ts >= nowMs && ts <= nowMs + sevenDaysMs;
}

/* --------- League logos for dropdown --------- */
const LeagueLogos = {
  NFL: () => (
    <Image
      src="/nfl.svg"
      alt="NFL"
      width={30}
      height={30}
      className="w-7 h-7"
    />
  ),
  NBA: () => (
    <Image
      src="/nba-6.svg"
      alt="NBA"
      width={30}
      height={30}
      className="w-7 h-7"
    />
  ),
  NCAAF: () => (
    <Image
      src="/ncaaf.svg"
      alt="NCAAF"
      width={30}
      height={30}
      className="w-7 h-7"
    />
  ),
  NCAAB: () => (
    <Image
      src="/ncaa-1.svg"
      alt="NCAAB"
      width={30}
      height={30}
      className="w-7 h-7"
    />
  ),
  MLB: () => (
    <Image
      src="/mlb-1.svg"
      alt="MLB"
      width={30}
      height={30}
      className="w-7 h-7"
    />
  ),
  UFC: () => (
    <Image
      src="/ufc.png"
      alt="UFC"
      width={30}
      height={30}
      className="w-7 h-7"
    />
  ),
};

const leagues = [
  { href: "/league/nfl", label: "NFL", logo: LeagueLogos.NFL },
  { href: "/league/nba", label: "NBA", logo: LeagueLogos.NBA },
  { href: "/league/ncaaf", label: "NCAAF", logo: LeagueLogos.NCAAF },
  { href: "/league/ncaab", label: "NCAAB", logo: LeagueLogos.NCAAB },
  { href: "/league/mlb", label: "MLB", logo: LeagueLogos.MLB },
  { href: "/league/ufc", label: "UFC", logo: LeagueLogos.UFC },
] as const;

/* ---------- Odds formatting helpers ---------- */
function signPoint(n?: number | null) {
  if (typeof n !== "number" || Number.isNaN(n)) return "-";
  return n > 0 ? `+${n}` : `${n}`;
}
function fmtAmerican(n?: number | null) {
  if (typeof n !== "number" || Number.isNaN(n)) return "";
  return n > 0 ? `+${n}` : `\u2212${Math.abs(n)}`;
}

/** Spread */
function extractSpreadPieces(game: UpcomingGame) {
  const s: any = (game as any)?.odds?.spread;
  if (s && typeof s === "object" && s.away && s.home) {
    return {
      awayPointText: signPoint(s.away.point),
      awayPriceText: fmtAmerican(s.away.price) || "—",
      homePointText: signPoint(s.home.point),
      homePriceText: fmtAmerican(s.home.price) || "—",
    };
  }
  return {
    awayPointText: "-",
    awayPriceText: "—",
    homePointText: "-",
    homePriceText: "—",
  };
}

/** Total */
function extractTotalPieces(game: UpcomingGame) {
  const t: any = (game as any)?.odds?.total;
  if (t && typeof t === "object") {
    return {
      pointText: typeof t.point === "number" ? `${t.point}` : "-",
      overText: fmtAmerican(t.over) || "—",
      underText: fmtAmerican(t.under) || "—",
    };
  }
  return { pointText: "-", overText: "—", underText: "—" };
}

/** Moneyline */
function extractMoneylinePieces(game: UpcomingGame) {
  const ml: any = (game as any)?.odds?.moneyline;
  if (ml && typeof ml === "object") {
    return {
      awayMl: fmtAmerican(ml.away) || "—",
      homeMl: fmtAmerican(ml.home) || "—",
    };
  }
  return { awayMl: "—", homeMl: "—" };
}

/** Consistent grid for the odds section so headers align exactly over data */
const ODDS_GRID =
  "grid grid-cols-[1fr_minmax(92px,auto)_minmax(92px,auto)_minmax(64px,auto)] items-center gap-3";

export default function UpcomingGames() {
  const [selectedLeague, setSelectedLeague] = useState<
    "NFL" | "NBA" | "NCAAF" | "NCAAB" | "MLB" | "UFC"
  >("NFL");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // local search query (filters live)
  const [query, setQuery] = useState("");

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update periodically so games drop off at kickoff.
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now());
  useEffect(() => {
    const intervalId = setInterval(() => setNowTimestamp(Date.now()), 30_000);
    return () => clearInterval(intervalId);
  }, []);

  const displayedGames = useMemo(() => {
    const gamesForLeague = upcomingGames.filter(
      (g) => g.league === selectedLeague
    );

    const sortedByKickoff = [...gamesForLeague].sort((a, b) => {
      const aTs = getKickoffTimestampFromGame(a);
      const bTs = getKickoffTimestampFromGame(b);
      if (!Number.isFinite(aTs) && !Number.isFinite(bTs)) return 0;
      if (!Number.isFinite(aTs)) return 1;
      if (!Number.isFinite(bTs)) return -1;
      return aTs - bTs;
    });

    const withinWindow = sortedByKickoff.filter((g) =>
      isWithinNextSevenDays(getKickoffTimestampFromGame(g), nowTimestamp)
    );

    // Live search (local to this component)
    const q = query.trim().toLowerCase();
    const searched = !q
      ? withinWindow
      : withinWindow.filter((g) => {
          const hay = [
            g.awayTeam.name,
            g.homeTeam.name,
            g.venue || "",
            g.league,
          ]
            .join(" ")
            .toLowerCase();
          return hay.includes(q);
        });

    return searched.slice(0, 6);
  }, [selectedLeague, nowTimestamp, query]);

  const handleLeagueSelect = (league: typeof selectedLeague) => {
    setSelectedLeague(league);
    setIsDropdownOpen(false);
  };

  const active = leagues.find((l) => l.label === selectedLeague)!;
  const ActiveLogo = active.logo;

  return (
    <section id="upcoming" className="w-full bg-white py-16 sm:py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header (responsive grid) */}
        <div className="mb-8 sm:mb-12 grid gap-4 sm:gap-6 md:grid-cols-[1fr_auto_auto] md:items-end">
          {/* Title/desc */}
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111827] tracking-tight font-playfair">
              Upcoming Games
            </h2>
            <p className="mt-2 text-base sm:text-lg text-gray-600 font-inter">
              Spread • Total • Moneyline for upcoming matchups
            </p>
          </div>

          {/* Search */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="relative order-last md:order-0 w-full md:w-auto justify-self-stretch md:justify-self-center"
            aria-label="Search upcoming games"
          >
            <input
              type="text"
              placeholder="Search games, teams..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full md:w-72 px-4 py-2 pl-10 text-[#111827] bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#278394] focus:border-transparent transition-all duration-300"
            />
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </form>

          {/* View All (desktop) */}
          <Link
            href={`/league/${selectedLeague.toLowerCase()}`}
            className="hidden md:inline-flex justify-self-start md:justify-self-end items-center cursor-pointer h-10 px-5 rounded-lg bg-[#24257C] text-white text-sm font-semibold hover:bg-[#C83495] transition"
          >
            View All
          </Link>
        </div>

        {/* League Dropdown */}
        <div className="mb-8 sm:mb-10">
          <div className="relative inline-block w-full" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full md:w-94 cursor-pointer flex items-center justify-between px-5 py-3 bg-white border-2 border-gray-200 rounded-lg text-[#111827] font-semibold text-base transition-colors focus:outline-none focus:ring-2 focus:ring-[#24257C] focus:ring-offset-2"
            >
              <span className="flex items-center gap-3">
                <ActiveLogo />
                <span>{selectedLeague}</span>
              </span>
              <svg
                className={`w-5 h-5 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute z-50 w-full sm:w-94 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                {leagues.map((league) => {
                  const Logo = league.logo;
                  return (
                    <button
                      key={league.label}
                      onClick={() =>
                        handleLeagueSelect(
                          league.label as typeof selectedLeague
                        )
                      }
                      className="group w-full px-5 py-3 cursor-pointer text-left transition-colors hover:bg-gray-50"
                    >
                      <span className="flex items-center gap-3">
                        <Logo />
                        <span className="font-semibold text-[#111827] transition-colors group-hover:text-[#278394]">
                          {league.label}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* View All (mobile) */}
          <Link
            href={`/league/${selectedLeague.toLowerCase()}`}
            className="mt-4 md:hidden inline-flex w-full items-center justify-center h-11 rounded-lg bg-[#24257C] text-white text-sm font-semibold hover:bg-[#C83495] transition"
          >
            View All
          </Link>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
          {displayedGames.map((game) => {
            const kickoffTs = getKickoffTimestampFromGame(game);
            const kickoffLabel = Number.isFinite(kickoffTs)
              ? new Date(kickoffTs).toLocaleString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : ((game as any).kickoffTime as string) ?? "TBD";

            const {
              awayPointText,
              awayPriceText,
              homePointText,
              homePriceText,
            } = extractSpreadPieces(game);
            const { pointText, overText, underText } = extractTotalPieces(game);
            const { awayMl, homeMl } = extractMoneylinePieces(game);
            const gameHref = `/game/${game.id}`;

            return (
              <div
                key={game.id}
                className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#24257C]"
              >
                <div className="h-[3px] w-full bg-[#24257C]" />
                <div className="p-5">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3 font-inter">
                    <span className="px-2 py-1 rounded-md bg-gray-50 border border-gray-200 font-medium">
                      {game.league}
                    </span>
                    <span className="font-medium">{kickoffLabel}</span>
                  </div>

                  <div className="flex items-center justify-between gap-4 mb-5">
                    {/* Away */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-md bg-gray-100 flex items-center justify-center text-xl shrink-0">
                        <TeamAvatar name={game.awayTeam.name} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[15px] text-[#111827] truncate">
                          {game.awayTeam.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate font-inter">
                          {"Away"}
                        </p>
                      </div>
                    </div>

                    {/* VS */}
                    <div className="px-2">
                      <span className="text-sm font-semibold text-gray-400">
                        vs
                      </span>
                    </div>

                    {/* Home */}
                    <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                      <div className="min-w-0 text-right">
                        <p className="font-semibold text-[15px] text-[#111827] truncate">
                          {game.homeTeam.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate font-inter">
                          Home
                        </p>
                      </div>
                      <div className="w-11 h-11 rounded-md bg-gray-100 flex items-center justify-center text-xl shrink-0">
                        <TeamAvatar name={game.homeTeam.name} />
                      </div>
                      <p className="text-xs text-gray-500 truncate font-inter">
                        {game.venue || "Home"}
                      </p>
                    </div>
                  </div>

                  {/* Odds block: Team | Spread | Total | Moneyline with headers aligned */}
                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                    {/* Column headers */}
                    <div
                      className={`${ODDS_GRID} text-[11px] uppercase tracking-wide text-gray-500 font-inter`}
                    >
                      <span className="text-left">Team</span>
                      <span className="text-left">Spread</span>
                      <span className="text-left">Total</span>
                      <span className="text-left">ML</span>
                    </div>

                    {/* Rows */}
                    <div className="mt-2 space-y-2">
                      {/* Away row */}
                      <div className={ODDS_GRID}>
                        <span className="text-sm text-[#111827] font-medium truncate">
                          {game.awayTeam.name}
                        </span>

                        {/* Spread */}
                        <span className="text-sm font-semibold text-[#111827] font-inter [font-variant-numeric:tabular-nums]">
                          {awayPointText}{" "}
                          <span className="text-xs text-gray-600">
                            {awayPriceText}
                          </span>
                        </span>

                        {/* Total (Over) */}
                        <span className="text-sm font-semibold text-[#111827] font-inter [font-variant-numeric:tabular-nums]">
                          O {pointText}{" "}
                          <span className="text-xs text-gray-600">
                            {overText}
                          </span>
                        </span>

                        {/* Moneyline */}
                        <span className="text-sm font-semibold text-[#111827] font-inter [font-variant-numeric:tabular-nums]">
                          {awayMl}
                        </span>
                      </div>

                      {/* Home row */}
                      <div className={ODDS_GRID}>
                        <span className="text-sm text-[#111827] font-medium truncate">
                          {game.homeTeam.name}
                        </span>

                        {/* Spread */}
                        <span className="text-sm font-semibold text-[#111827] font-inter [font-variant-numeric:tabular-nums]">
                          {homePointText}{" "}
                          <span className="text-xs text-gray-600">
                            {homePriceText}
                          </span>
                        </span>

                        {/* Total (Under) */}
                        <span className="text-sm font-semibold text-[#111827] font-inter [font-variant-numeric:tabular-nums]">
                          U {pointText}{" "}
                          <span className="text-xs text-gray-600">
                            {underText}
                          </span>
                        </span>

                        {/* Moneyline */}
                        <span className="text-sm font-semibold text-[#111827] font-inter [font-variant-numeric:tabular-nums]">
                          {homeMl}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Link href={`/prediction`}>
                      <span className="inline-flex w-full h-10 items-center justify-center rounded-lg bg-[#24257C] text-white text-[13px] font-inter font-bold uppercase tracking-wide transition group-hover:bg-[#C83495] group-hover:-translate-y-0.5">
                        Read Prediction
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
