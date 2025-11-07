"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, useEffect, useRef } from "react";
import { upcomingGames } from "@/dummyData";
import type { UpcomingGame } from "@/dummyData";
import { useSearch } from "@/components/providers/SearchProvider";

/** Parse a kickoff timestamp (ms) from game fields. */
function getKickoffTimestampFromGame(game: UpcomingGame): number {
  const maybeKickoffTs = (game as any)?.kickoffTs;
  if (typeof maybeKickoffTs === "number") return maybeKickoffTs;

  // e.g. "Jan 5, 2025 1:00 PM ET"
  const timePart =
    game.kickoffTime?.match(/\b\d{1,2}:\d{2}\s?[AP]M\b/i)?.[0] ?? "";
  const tzPart = game.kickoffTime?.match(/\b(ET|CT|MT|PT)\b/i)?.[0] ?? "";

  const composed = timePart
    ? `${game.date} ${timePart}${tzPart ? ` ${tzPart}` : ""}`
    : game.date;
  const parsed = Date.parse(composed);
  return Number.isFinite(parsed) ? parsed : NaN;
}

/** Keep if unknown; otherwise require within the next 7 days. */
function isWithinNextSevenDays(ts: number, nowMs: number) {
  if (!Number.isFinite(ts)) return true;
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  return ts >= nowMs && ts <= nowMs + sevenDaysMs;
}

/* --------- Logos + leagues for dropdown --------- */
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

export default function UpcomingGames() {
  const { query } = useSearch();

  const [selectedLeague, setSelectedLeague] = useState<
    "NFL" | "NBA" | "NCAAF" | "NCAAB" | "MLB" | "UFC"
  >("NFL");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

    // Live search (from NavBar)
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
        {/* Header */}
        <div className="mb-8 sm:mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111827] tracking-tight font-playfair">
              Upcoming Games
            </h2>
            <p className="mt-2 text-base sm:text-lg text-gray-600 font-inter">
              Expert predictions and odds for today&apos;s matchups
            </p>
          </div>

          {/* View All (desktop) */}
          <Link
            href={`/league/${selectedLeague.toLowerCase()}`}
            className="hidden md:inline-flex items-center cursor-pointer justify-center h-10 px-5 rounded-lg bg-[#24257C] text-white text-sm font-semibold hover:bg-[#C83495] transition"
          >
            View All
          </Link>
        </div>

        {/* League Dropdown */}
        <div className="mb-8 sm:mb-10">
          <div
            className="relative inline-block w-full sm:w-auto"
            ref={dropdownRef}
          >
            {/* Toggle button shows current league + logo */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full sm:w-94 cursor-pointer flex items-center justify-between px-5 py-3 bg-white border-2 border-gray-200 rounded-lg text-[#111827] font-semibold text-base transition-colors focus:outline-none focus:ring-2 focus:ring-[#24257C] focus:ring-offset-2"
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

            {/* Dropdown Menu with logos + hover color */}
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
              : game.kickoffTime ?? "TBD";

            const oddsDisplaySpread = game.odds?.spread ?? "-";
            const oddsDisplayTotal = game.odds?.total ?? "-";
            const oddsDisplayMoneyline = game.odds?.moneyline ?? "-";

            const gameHref = `/game/${game.id}`;

            return (
              <Link
                key={game.id}
                href={gameHref}
                className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#24257C]"
              >
                <div className="h-[3px] w-full bg-[#24257C]" />
                <div className="p-5">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="px-2 py-1 rounded-md bg-gray-50 border border-gray-200 font-medium">
                      {game.league}
                    </span>
                    <span className="font-medium">{kickoffLabel}</span>
                  </div>

                  <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-md bg-gray-100 flex items-center justify-center text-xl shrink-0">
                        {game.awayTeam.logo}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[15px] text-[#111827] truncate">
                          {game.awayTeam.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {game.venue || "Away"}
                        </p>
                      </div>
                    </div>
                    <div className="px-2">
                      <span className="text-sm font-semibold text-gray-400">
                        vs
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                      <div className="min-w-0 text-right">
                        <p className="font-semibold text-[15px] text-[#111827] truncate">
                          {game.homeTeam.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">Home</p>
                      </div>
                      <div className="w-11 h-11 rounded-md bg-gray-100 flex items-center justify-center text-xl shrink-0">
                        {game.homeTeam.logo}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-gray-50 border border-gray-100">
                    <div className="grid grid-cols-3 divide-x divide-gray-100">
                      <div className="p-3 text-center">
                        <p className="text-[11px] uppercase tracking-wide text-gray-500">
                          Spread
                        </p>
                        <p className="mt-0.5 font-semibold text-sm text-[#111827] [font-variant-numeric:tabular-nums]">
                          {oddsDisplaySpread}
                        </p>
                      </div>
                      <div className="p-3 text-center">
                        <p className="text-[11px] uppercase tracking-wide text-gray-500">
                          Total
                        </p>
                        <p className="mt-0.5 font-semibold text-sm text-[#111827] [font-variant-numeric:tabular-nums]">
                          {oddsDisplayTotal}
                        </p>
                      </div>
                      <div className="p-3 text-center">
                        <p className="text-[11px] uppercase tracking-wide text-gray-500">
                          Money Line
                        </p>
                        <p className="mt-0.5 font-semibold text-sm text-[#111827] [font-variant-numeric:tabular-nums]">
                          {oddsDisplayMoneyline}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="inline-flex w-full h-10 items-center justify-center rounded-lg bg-[#24257C] text-white text-[13px] font-inter font-bold uppercase tracking-wide transition group-hover:bg-[#C83495] group-hover:-translate-y-0.5">
                      Read Prediction
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
