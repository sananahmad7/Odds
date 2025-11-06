"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { upcomingGames } from "@/dummyData";
import type { UpcomingGame } from "@/dummyData";

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

export default function UpcomingGames() {
  const [selectedLeague, setSelectedLeague] = useState<
    "NFL" | "NBA" | "NCAAF" | "NCAAB" | "MLB" | "UFC"
  >("NFL");

  const leagueTabs = ["NFL", "NBA", "NCAAF", "NCAAB", "MLB", "UFC"];

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

    return withinWindow.slice(0, 6);
  }, [selectedLeague, nowTimestamp]);

  return (
    <section className="w-full bg-white py-16 sm:py-20">
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

        {/* League Tabs */}
        <div className="mb-8 sm:mb-10">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {leagueTabs.map((league) => {
              const isActive = selectedLeague === league;
              return (
                <button
                  key={league}
                  onClick={() =>
                    setSelectedLeague(league as typeof selectedLeague)
                  }
                  className={[
                    "px-5 sm:px-6 py-2.5 rounded-full text-sm sm:text-base font-semibold whitespace-nowrap transition-all",
                    isActive
                      ? "bg-[#24257C] text-white shadow-sm"
                      : "bg-white text-gray-700 border cursor-pointer border-gray-200 hover:border-[#24257C] hover:text-[#24257C]",
                  ].join(" ")}
                >
                  {league}
                </button>
              );
            })}
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

            // Friendly odds strings with fallbacks
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
                {/* 3px brand accent bar */}
                <div className="h-[3px] w-full bg-[#24257C]" />

                {/* Card body */}
                <div className="p-5">
                  {/* Meta row */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="px-2 py-1 rounded-md bg-gray-50 border border-gray-200 font-medium">
                      {game.league}
                    </span>
                    <span className="font-medium">{kickoffLabel}</span>
                  </div>

                  {/* Teams row */}
                  <div className="flex items-center justify-between gap-4 mb-5">
                    {/* Away */}
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
                        <p className="text-xs text-gray-500 truncate">Home</p>
                      </div>
                      <div className="w-11 h-11 rounded-md bg-gray-100 flex items-center justify-center text-xl shrink-0">
                        {game.homeTeam.logo}
                      </div>
                    </div>
                  </div>

                  {/* Odds block (matches screenshot: 3 columns with labels) */}
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

                  {/* CTA */}
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
