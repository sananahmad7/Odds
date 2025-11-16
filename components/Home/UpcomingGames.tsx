"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useMemo, useState, useEffect, useRef } from "react";
import GameCard from "./GameCard";

/* =======================
   Types returned by /api/odds-data
   ======================= */
type DbOutcome = {
  id: string;
  name: string;
  price: number;
  point?: number | null;
};
type DbMarket = {
  id: string;
  key: string;
  lastUpdate: string;
  outcomes: DbOutcome[];
};
type DbBookmaker = {
  id: string;
  key: string;
  title: string;
  lastUpdate: string;
  markets: DbMarket[];
};
type DbOddsEvent = {
  id: string;
  sportKey: string;
  sportTitle: "NFL" | "NBA" | "NCAAF" | "NCAAB" | "MLB" | "UFC" | string;
  commenceTime: string; // ISO
  homeTeam: string;
  awayTeam: string;
  bookmakers: DbBookmaker[];
};

/* =======================
   Minimal UI type the GameCard expects
   ======================= */
type UpcomingGame = {
  id: string;
  league: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  venue?: string;
  kickoffIso?: string;
  kickoffTs?: number;
  odds?: {
    spread?: {
      home?: { point?: number | null; price?: number | null };
      away?: { point?: number | null; price?: number | null };
    };
    total?: {
      point?: number | null;
      over?: number | null;
      under?: number | null;
    };
    moneyline?: {
      home?: number | null;
      away?: number | null;
    };
  };
};

/* =======================
   Helpers
   ======================= */
function getKickoffTimestampFromGame(game: UpcomingGame): number {
  const ts =
    game.kickoffTs ?? (game.kickoffIso ? Date.parse(game.kickoffIso) : NaN);
  return Number.isFinite(ts) ? ts : NaN;
}

function isWithinNextSevenDays(ts: number, nowMs: number) {
  if (!Number.isFinite(ts)) return true;
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  return ts >= nowMs && ts <= nowMs + sevenDaysMs;
}

function pickBestBookmaker(books?: DbBookmaker[]) {
  if (!books || books.length === 0) return undefined;

  // Prefer FanDuel
  const fanduel = books.find(
    (b) =>
      b.key?.toLowerCase() === "fanduel" || b.title?.toLowerCase() === "fanduel"
  );
  if (fanduel) return fanduel;

  // Fallback: latest lastUpdate
  return books.reduce((best, b) =>
    Date.parse(b.lastUpdate) > Date.parse(best.lastUpdate) ? b : best
  );
}

function getMarket(book: DbBookmaker | undefined, key: string) {
  return book?.markets?.find((m) => m.key === key);
}

function findTeamOutcome(outcomes: DbOutcome[] | undefined, team: string) {
  if (!outcomes || outcomes.length === 0) return undefined;
  const exact = outcomes.find((o) => o.name === team);
  if (exact) return exact;
  // fallback for weird names: first non Over/Under/Draw
  return outcomes.find((o) => !/over|under|draw/i.test(o.name));
}

function mapDbEventToUiGame(e: DbOddsEvent): UpcomingGame {
  const book = pickBestBookmaker(e.bookmakers);
  // console.log(book);
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
    id: e.id,
    league: e.sportTitle,
    homeTeam: { name: e.homeTeam },
    awayTeam: { name: e.awayTeam },
    kickoffIso: e.commenceTime,
    kickoffTs: Date.parse(e.commenceTime),
    odds: {
      spread: {
        home: {
          point: homeSpread?.point ?? null,
          price: homeSpread?.price ?? null,
        },
        away: {
          point: awaySpread?.point ?? null,
          price: awaySpread?.price ?? null,
        },
      },
      total: {
        point: over?.point ?? under?.point ?? null,
        over: over?.price ?? null,
        under: under?.price ?? null,
      },
      moneyline: {
        home: homeMl,
        away: awayMl,
      },
    },
  };
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

/* =======================
   Component
   ======================= */
type Props = {
  events: DbOddsEvent[]; // raw from API
};

export default function UpcomingGames({ events }: Props) {
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

  // Transform DB events -> UI games
  const uiGames = useMemo<UpcomingGame[]>(
    () => (events || []).map(mapDbEventToUiGame),
    [events]
  );

  const displayedGames = useMemo(() => {
    const gamesForLeague = uiGames.filter(
      (g) => g.league.toUpperCase() === selectedLeague
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

    // Live search
    const q = query.trim().toLowerCase();
    const searched = !q
      ? withinWindow
      : withinWindow.filter((g) => {
          const hay = [g.awayTeam.name, g.homeTeam.name, g.league]
            .join(" ")
            .toLowerCase();
          return hay.includes(q);
        });

    return searched.slice(0, 6);
  }, [uiGames, selectedLeague, nowTimestamp, query]);

  const handleLeagueSelect = (league: typeof selectedLeague) => {
    setSelectedLeague(league);
    setIsDropdownOpen(false);
  };

  const active = leagues.find((l) => l.label === selectedLeague)!;
  const ActiveLogo = active.logo;

  return (
    <section id="upcoming" className="w-full bg-white py-16 sm:py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12 grid gap-4 sm:gap-6 md:grid-cols-[1fr_auto_auto] md:items-end">
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
          {displayedGames.map((game) => (
            <GameCard key={game.id} game={game} predictionHref="/prediction" />
          ))}
        </div>
      </div>
    </section>
  );
}
