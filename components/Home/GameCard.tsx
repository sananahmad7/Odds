// components/Home/GameCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

/** ---------- Local minimal type the card needs ---------- */
type GameCardGame = {
  id: string;
  league: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  bookmakerName?: string;
  venue?: string | null;
  kickoffIso?: string;
  commenceTime?: string;
  kickoffTs?: number;
  odds?: {
    spread?: {
      home?: { point?: number | null; price?: number | null };
      away?: { point?: number | null; price?: number | null };
    };
    total?: {
      point?: number | null;
      // over/under odds no longer needed for display
    };
    moneyline?: { home?: number | null; away?: number | null };
  };
};

function getTeamName(team: string, league: string): string {
  const leaguesWithCityNames = ["NFL", "NBA", "NCAAF", "NCAAB", "MLB"];
  if (leaguesWithCityNames.includes(league)) {
    const parts = team.split(" ");
    if (parts.length > 1) {
      return parts.slice(1).join(" ");
    }
  }
  return team;
}

/** ---------- Helpers ---------- */
function getKickoffTimestampFromGame(game: GameCardGame): number {
  const maybeKickoffTs = (game as any)?.kickoffTs;
  if (typeof maybeKickoffTs === "number") return maybeKickoffTs;

  const iso =
    (game as any)?.kickoffIso ??
    (game as any)?.commenceTime ??
    (game as any)?.commence_time;
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

// Helper to ensure signs are aligned. Points always have a sign.
function signPoint(n?: number | null) {
  if (typeof n !== "number" || Number.isNaN(n)) return "-";
  // Using en-dash for negative to match standard typographic practices for odds
  return n > 0 ? `+${n}` : `${n}`.replace("-", "\u2212");
}

// Helper for American odds prices
function fmtAmerican(n?: number | null) {
  if (typeof n !== "number" || Number.isNaN(n)) return "";
  return n > 0 ? `+${n}` : `\u2212${Math.abs(n)}`;
}

function extractSpreadPieces(game: GameCardGame) {
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

function extractMoneylinePieces(game: GameCardGame) {
  const ml: any = (game as any)?.odds?.moneyline;
  if (ml && typeof ml === "object") {
    return {
      awayMl: fmtAmerican(ml.away) || "—",
      homeMl: fmtAmerican(ml.home) || "—",
    };
  }
  return { awayMl: "—", homeMl: "—" };
}

/**
 * Grid definition for alignment.
 * Using fixed pixel widths for numerical columns ensures perfect alignment across different cards.
 * 1fr: Team Name (takes remaining space)
 * 85px: Spread column
 * 75px: ML column
 * 60px: Total column
 */
const ODDS_GRID = "grid grid-cols-[1fr_85px_75px_60px] items-center gap-2";

type GameCardProps = {
  game: GameCardGame;
  predictionHref?: string;
  className?: string;
};

export default function GameCard({
  game,
  predictionHref,
  className = "",
}: GameCardProps) {
  const [awayLogoVisible, setAwayLogoVisible] = useState(true);
  const [homeLogoVisible, setHomeLogoVisible] = useState(true);

  const kickoffTs = getKickoffTimestampFromGame(game);

  const kickoffLabel = Number.isFinite(kickoffTs)
    ? new Date(kickoffTs).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/Chicago",
      })
    : ((game as any).kickoffTime as string) ?? "TBD";

  const { awayPointText, awayPriceText, homePointText, homePriceText } =
    extractSpreadPieces(game);
  const { awayMl, homeMl } = extractMoneylinePieces(game);

  // Get Total Point
  const totalPoint = game.odds?.total?.point;
  const totalPointText =
    typeof totalPoint === "number" && !Number.isNaN(totalPoint)
      ? `${totalPoint}`
      : "-";

  const href = predictionHref ?? `/prediction/${game.id}`;

  // The entire card is now a Link
  return (
    <Link
      href={href}
      className={`group block bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all  ${className}`}
    >
      {/* Top Accent */}
      <div className="h-[3px] w-full bg-[#24257C]" />

      <div className="p-5">
        {/* Top bar: league pill + kickoff time */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3 font-inter">
          <span className="px-2 py-1 rounded-md bg-gray-50 border border-gray-200 font-medium">
            {game.league}
          </span>
          <span className="font-medium font-neue">{`${kickoffLabel} Central Time`}</span>
        </div>

        {/* Teams row */}
        <div className="flex items-center justify-between gap-4 mb-5">
          {/* Away Team */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {awayLogoVisible && (
              // Removed bg-gray-100 for transparency
              <div className="w-11 h-11 rounded-md flex items-center justify-center text-xl shrink-0">
                <Image
                  src={
                    game.league === "MMA"
                      ? `/MMA/mma.png`
                      : `/${game.league}/${game.awayTeam.name}.png`
                  }
                  alt={`${game.awayTeam.name} logo`}
                  width={44}
                  height={44}
                  className="w-15 h-15 object-contain"
                  onError={() => setAwayLogoVisible(false)}
                />
              </div>
            )}
            <div className="min-w-0 font-gtsuper">
              <p className="font-semibold text-[15px] text-[#111827] truncate">
                {getTeamName(game.awayTeam.name, game.league)}
              </p>
              <p className="text-xs text-gray-500 truncate font-neue">Away</p>
            </div>
          </div>

          {/* VS */}
          <div className="px-2">
            <span className="text-sm font-semibold font-neue text-gray-400">
              vs
            </span>
          </div>

          {/* Home Team */}
          <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
            <div className="min-w-0 font-gtsuper text-right">
              <p className="font-semibold text-[15px] text-[#111827] truncate">
                {getTeamName(game.homeTeam.name, game.league)}
              </p>
              <p className="text-xs text-gray-500 truncate font-neue">Home</p>
            </div>
            {homeLogoVisible && (
              // Removed bg-gray-100 for transparency
              <div className="w-11 h-11 rounded-md flex items-center justify-center text-xl shrink-0">
                <Image
                  src={
                    game.league === "MMA"
                      ? `/MMA/mma.png`
                      : `/${game.league}/${game.homeTeam.name}.png`
                  }
                  alt={`${game.homeTeam.name} logo`}
                  width={44}
                  height={44}
                  className="w-15 h-15 object-contain"
                  onError={() => setHomeLogoVisible(false)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Odds block */}
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
          {/* Header */}
          <div
            className={`${ODDS_GRID} text-[11px] font-neue uppercase tracking-wide text-gray-500 font-inter mb-2`}
          >
            <span className="text-left">Team</span>
            {/* Right align numerical headers to match data */}
            <span className="text-right">Spread</span>
            <span className="text-right">ML</span>
            <span className="text-right">Total</span>
          </div>

          {/* Team rows container - applying tabular-nums here ensures alignment across rows */}
          <div className="space-y-2 font-neue text-sm [font-variant-numeric:tabular-nums]">
            {/* Away row */}
            <div className={ODDS_GRID}>
              <span className="text-[#111827] font-medium truncate text-left">
                {game.awayTeam.name}
              </span>

              <span className="font-semibold text-[#111827] text-right">
                {awayPointText}{" "}
                {/* Reduced font size for odds price slightly for better visual hierarchy */}
                <span className="text-[11px] text-gray-600 font-normal">
                  {awayPriceText}
                </span>
              </span>

              <span className="font-semibold text-[#111827] text-right">
                {awayMl}
              </span>

              <span className="font-semibold text-[#111827] text-right">
                {totalPointText}
              </span>
            </div>

            {/* Home row */}
            <div className={ODDS_GRID}>
              <span className="text-[#111827] font-medium truncate text-left">
                {game.homeTeam.name}
              </span>

              <span className="font-semibold text-[#111827] text-right">
                {homePointText}{" "}
                <span className="text-[11px] text-gray-600 font-normal">
                  {homePriceText}
                </span>
              </span>

              <span className="font-semibold text-[#111827] text-right">
                {homeMl}
              </span>

              <span className="font-semibold text-[#111827] text-right">
                {totalPointText}
              </span>
            </div>
          </div>

          {/* Bookmaker name (tiny, only if present) */}
          {game.bookmakerName && (
            <div className="mt-3 border-t border-gray-200 pt-2 font-neue text-[10px] text-gray-400 font-inter text-center">
              Odds via {game.bookmakerName}
            </div>
          )}
        </div>

        {/* CTA Button (Visual only, the whole card is the link) */}
        <div className="">
          <span className="inline-flex w-full h-10 items-center justify-center rounded-lg bg-[#24257C] text-white text-[13px] font-inter font-bold uppercase tracking-wide transition group-hover:bg-[#C83495] group-hover:-translate-y-0.5">
            SEE THE PICK
          </span>
        </div>
      </div>
    </Link>
  );
}
