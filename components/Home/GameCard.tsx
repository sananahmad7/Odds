"use client";

import Link from "next/link";
import { FaFootballBall } from "react-icons/fa";

/** ---------- Local minimal type the card needs ---------- */
type GameCardGame = {
  id: string;
  league: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  venue?: string | null;
  kickoffIso?: string; // parent sets this = commenceTime
  commenceTime?: string; // optional if parent passes raw DB event
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

/** ---------- Team avatar: football icon only (no text logos) ---------- */
function TeamAvatar({ name }: { name: string }) {
  return (
    <span className="text-[#24257C]" aria-label={`${name} logo`}>
      <FaFootballBall className="w-7 h-7" />
    </span>
  );
}

/** ---------- Helpers (kept local so the card is fully reusable) ---------- */
function getKickoffTimestampFromGame(game: GameCardGame): number {
  const maybeKickoffTs = (game as any)?.kickoffTs;
  if (typeof maybeKickoffTs === "number") return maybeKickoffTs;

  const iso =
    (game as any)?.kickoffIso ??
    (game as any)?.commenceTime ?? // allow raw DB field too
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

function signPoint(n?: number | null) {
  if (typeof n !== "number" || Number.isNaN(n)) return "-";
  return n > 0 ? `+${n}` : `${n}`;
}
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

function extractTotalPieces(game: GameCardGame) {
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

/** Grid for TEAM rows: Team | Spread | ML */
const ODDS_GRID_TEAMS =
  "grid grid-cols-[1fr_minmax(92px,auto)_minmax(64px,auto)] items-center gap-3";

type GameCardProps = {
  game: GameCardGame;
  predictionHref?: string; // optional override; defaults to /league/[id]
  className?: string;
};

export default function GameCard({
  game,
  predictionHref,
  className = "",
}: GameCardProps) {
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

  const { awayPointText, awayPriceText, homePointText, homePriceText } =
    extractSpreadPieces(game);
  const { pointText, overText, underText } = extractTotalPieces(game);
  const { awayMl, homeMl } = extractMoneylinePieces(game);

  // If parent didn't pass a href, default to the dynamic league route
  const href = predictionHref ?? `/prediction/${game.id}`;

  return (
    <div
      className={`group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#24257C] ${className}`}
    >
      {/* Top Accent */}
      <div className="h-[3px] w-full bg-[#24257C]" />

      <div className="p-5">
        {/* Top bar: league pill + kickoff time */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3 font-inter">
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
              <TeamAvatar name={game.awayTeam.name} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-[15px] text-[#111827] truncate">
                {game.awayTeam.name}
              </p>
              <p className="text-xs text-gray-500 truncate font-inter">Away</p>
            </div>
          </div>

          {/* VS */}
          <div className="px-2">
            <span className="text-sm font-semibold text-gray-400">vs</span>
          </div>

          {/* Home */}
          <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
            <div className="min-w-0 text-right">
              <p className="font-semibold text-[15px] text-[#111827] truncate">
                {game.homeTeam.name}
              </p>
              <p className="text-xs text-gray-500 truncate font-inter">Home</p>
            </div>
            <div className="w-11 h-11 rounded-md bg-gray-100 flex items-center justify-center text-xl shrink-0">
              <TeamAvatar name={game.homeTeam.name} />
            </div>
            <p className="text-xs text-gray-500 truncate font-inter">
              {game.venue || "Home"}
            </p>
          </div>
        </div>

        {/* Odds block */}
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
          {/* Header for team odds */}
          <div
            className={`${ODDS_GRID_TEAMS} text-[11px] uppercase tracking-wide text-gray-500 font-inter`}
          >
            <span className="text-left">Team</span>
            <span className="text-left">Spread</span>
            <span className="text-left">ML</span>
          </div>

          {/* Team rows */}
          <div className="mt-2 space-y-2">
            {/* Away row */}
            <div className={ODDS_GRID_TEAMS}>
              <span className="text-sm text-[#111827] font-medium truncate">
                {game.awayTeam.name}
              </span>

              <span className="text-sm font-semibold text-[#111827] font-inter [font-variant-numeric:tabular-nums]">
                {awayPointText}{" "}
                <span className="text-xs text-gray-600">{awayPriceText}</span>
              </span>

              <span className="text-sm font-semibold text-[#111827] font-inter [font-variant-numeric:tabular-nums]">
                {awayMl}
              </span>
            </div>

            {/* Home row */}
            <div className={ODDS_GRID_TEAMS}>
              <span className="text-sm text-[#111827] font-medium truncate">
                {game.homeTeam.name}
              </span>

              <span className="text-sm font-semibold text-[#111827] font-inter [font-variant-numeric:tabular-nums]">
                {homePointText}{" "}
                <span className="text-xs text-gray-600">{homePriceText}</span>
              </span>

              <span className="text-sm font-semibold text-[#111827] font-inter [font-variant-numeric:tabular-nums]">
                {homeMl}
              </span>
            </div>
          </div>

          {/* Separate Total row */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-gray-500 font-inter mb-1">
              <span className="text-left">Game Total</span>
              <span className="text-right">Over</span>
              <span className="text-right">Under</span>
            </div>

            <div className="flex items-center justify-between text-sm font-semibold text-[#111827] font-inter [font-variant-numeric:tabular-nums]">
              <span className="text-left">{pointText}</span>
              <span className="text-right ml-12">
                {pointText}{" "}
                <span className="text-xs text-gray-600">{overText}</span>
              </span>
              <span className="text-right">
                {pointText}{" "}
                <span className="text-xs text-gray-600">{underText}</span>
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-4">
          <Link href={href}>
            <span className="inline-flex w-full h-10 items-center justify-center rounded-lg bg-[#24257C] text-white text-[13px] font-inter font-bold uppercase tracking-wide transition group-hover:bg-[#C83495] group-hover:-translate-y-0.5">
              Read Prediction
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
