// components/league/LeagueEventsNCAAF.tsx
"use client";

import React, { useMemo, useState } from "react";
import GameCard from "@/components/Home/GameCard";
import type {
  SerializableOddsEvent as DbEvent,
  SerializableBookmaker as DbBookmaker,
  SerializableMarket as DbMarket, // kept for parity, not used directly
  SerializableOutcome as DbOutcome,
} from "@/app/(frontend)/league/ncaaf/page";

/** Minimal shape GameCard needs */
type CardGame = {
  id: string;
  league: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  venue?: string | null;
  kickoffIso?: string; // we set this to commenceTime
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
    moneyline?: { home?: number | null; away?: number | null };
  };
};

type Props = { events: DbEvent[] };

/* ================= Helpers ================= */
function pickBestBookmaker(books?: DbBookmaker[]) {
  if (!books || books.length === 0) return undefined;

  // Prefer FanDuel if present
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
  // fallback (handles odd labels)
  return outcomes.find((o) => !/over|under|draw/i.test(o.name));
}
function mapDbEventToCardGame(e: DbEvent): CardGame {
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
      moneyline: { home: homeMl, away: awayMl },
    },
  };
}

/* ================= Component ================= */
export default function LeagueEventsNCAAF({ events }: Props) {
  const [query, setQuery] = useState("");

  // Map DB -> UI model for the GameCard
  const uiGames = useMemo<CardGame[]>(
    () => (events || []).map(mapDbEventToCardGame),
    [events]
  );

  // Sort by kickoff, then search filter (no 7-day window here)
  const displayedGames = useMemo(() => {
    const sorted = [...uiGames].sort((a, b) => {
      const aTs = a.kickoffTs ?? NaN;
      const bTs = b.kickoffTs ?? NaN;
      if (!Number.isFinite(aTs) && !Number.isFinite(bTs)) return 0;
      if (!Number.isFinite(aTs)) return 1;
      if (!Number.isFinite(bTs)) return -1;
      return aTs - bTs;
    });

    const q = query.trim().toLowerCase();
    return !q
      ? sorted
      : sorted.filter((g) =>
          [g.homeTeam.name, g.awayTeam.name, g.league]
            .join(" ")
            .toLowerCase()
            .includes(q)
        );
  }, [uiGames, query]);

  return (
    <>
      {/* Header search (league title is rendered in the page) */}
      <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#111827]">
          List of Upcoming Games
        </h1>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="relative w-full sm:w-auto"
        >
          <input
            type="text"
            placeholder="Search teams..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full sm:w-72 px-4 py-2 pl-10 text-[#111827] bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#24257C] focus:border-transparent transition-all duration-300"
          />
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </form>
      </div>

      {/* Grid of games */}
      {displayedGames.length === 0 ? (
        <div className="text-center py-16">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <circle cx="12" cy="12" r="10" />
          </svg>
          <p className="text-gray-500 text-lg font-inter">
            No upcoming NCAAF games found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
          {displayedGames.map((g) => (
            <GameCard key={g.id} game={g} predictionHref="/prediction" />
          ))}
        </div>
      )}
    </>
  );
}
