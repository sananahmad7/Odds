import React, { useMemo } from "react";
import {
  DetailOutcome,
  DetailPrediction,
  DetailEvent,
  DetailBookmaker,
  DetailMarket,
} from "@app/(frontend)/prediction/[eventId]/page";

type ArticleProps = {
  event: DetailEvent;
};

// --- Helper Types for the View ---
type NormalizedOdds = {
  bookmakerName: string;
  home: {
    name: string;
    spread?: { point: string; price: string };
    ml?: { price: string };
  };
  away: {
    name: string;
    spread?: { point: string; price: string };
    ml?: { price: string };
  };
  total?: {
    over?: { point: string; price: string };
    under?: { point: string; price: string };
  };
};

// --- Helper Function: Best Bookmaker Logic ---
const getBestOdds = (event: DetailEvent): NormalizedOdds | null => {
  if (!event.bookmakers || event.bookmakers.length === 0) return null;

  // 1. Prioritize bookmakers that have ALL three main markets (Spread, ML, Total)
  const requiredMarkets = ["spreads", "h2h", "totals"];

  const bestBookmaker: DetailBookmaker =
    event.bookmakers.find((book) => {
      const availableKeys = book.markets.map((m) => m.key);
      return requiredMarkets.every((k) => availableKeys.includes(k));
    }) || event.bookmakers[0];

  if (!bestBookmaker) return null;

  // 2. Extract Markets safely
  const spreadMarket = bestBookmaker.markets.find((m) => m.key === "spreads");
  const mlMarket = bestBookmaker.markets.find((m) => m.key === "h2h");
  const totalMarket = bestBookmaker.markets.find((m) => m.key === "totals");

  // 3. Helper to safely find outcomes within a market
  const getOutcome = (market: DetailMarket | undefined, name: string) =>
    market?.outcomes.find((o) => o.name === name || name.includes(o.name));

  const getTotal = (type: "Over" | "Under") =>
    totalMarket?.outcomes.find((o) => o.name.includes(type));

  // 4. Helper to format price (add + if positive)
  const fmtPrice = (price: number) => (price > 0 ? `+${price}` : `${price}`);

  // 5. Normalize Data Structure for UI
  return {
    bookmakerName: bestBookmaker.title,
    home: {
      name: event.homeTeam,
      spread: (() => {
        const o = getOutcome(spreadMarket, event.homeTeam);
        return o
          ? {
              point: o.point
                ? o.point > 0
                  ? `+${o.point}`
                  : `${o.point}`
                : "",
              price: fmtPrice(o.price),
            }
          : undefined;
      })(),
      ml: (() => {
        const o = getOutcome(mlMarket, event.homeTeam);
        return o ? { price: fmtPrice(o.price) } : undefined;
      })(),
    },
    away: {
      name: event.awayTeam,
      spread: (() => {
        const o = getOutcome(spreadMarket, event.awayTeam);
        return o
          ? {
              point: o.point
                ? o.point > 0
                  ? `+${o.point}`
                  : `${o.point}`
                : "",
              price: fmtPrice(o.price),
            }
          : undefined;
      })(),
      ml: (() => {
        const o = getOutcome(mlMarket, event.awayTeam);
        return o ? { price: fmtPrice(o.price) } : undefined;
      })(),
    },
    total: {
      over: (() => {
        const o = getTotal("Over");
        return o
          ? { point: `O ${o.point}`, price: fmtPrice(o.price) }
          : undefined;
      })(),
      under: (() => {
        const o = getTotal("Under");
        return o
          ? { point: `U ${o.point}`, price: fmtPrice(o.price) }
          : undefined;
      })(),
    },
  };
};

const Article = ({ event }: ArticleProps) => {
  // Format the kickoff time
  const kickoff = new Date(event.commenceTime);
  const kickoffLabel = kickoff.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  // Memoize odds calculation to avoid re-running on every render
  const odds = useMemo(() => getBestOdds(event), [event]);

  return (
    <article className="bg-white font-inter text-gray-900">
      {/* --- Hero Section --- */}
      <div className="bg-gradient-to-br from-[#1a1b4b] via-[#24257C] to-[#2d2e7a] text-white py-12 px-6 sm:px-8 mb-8 rounded-2xl shadow-xl">
        <div className="max-w-4xl mx-auto">
          {/* Metadata Bar */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-200">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{kickoffLabel}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-4 text-white">
            {event.awayTeam} vs {event.homeTeam}
            <span className="block text-2xl sm:text-3xl lg:text-4xl mt-2 text-blue-100 font-bold">
              Prediction & Best Bets
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-blue-100 font-medium max-w-2xl">
            Expert analysis, odds comparison, and betting picks for this matchup
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* --- GAME CARD (Your Exact Structure with Enhanced Design) --- */}
        {odds ? (
          <div className="mb-12 border-2 border-gray-100 rounded-2xl overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-5 py-4 border-b-2 border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Live Odds
                </span>
              </div>
              <span className="text-xs font-bold text-[#24257C] bg-white px-3 py-1.5 rounded-full shadow-sm border border-blue-100">
                via {odds.bookmakerName}
              </span>
            </div>

            <div className="p-5 sm:p-6 bg-gradient-to-b from-white to-gray-50">
              {/* Table Headers */}
              <div className="grid grid-cols-12 gap-3 mb-3 px-2">
                <div className="col-span-6 sm:col-span-6 text-xs font-black text-gray-500 uppercase tracking-wider">
                  Team
                </div>
                <div className="col-span-3 sm:col-span-3 text-center text-xs font-black text-gray-500 uppercase tracking-wider">
                  Spread
                </div>
                <div className="col-span-3 sm:col-span-3 text-center text-xs font-black text-gray-500 uppercase tracking-wider">
                  Moneyline
                </div>
              </div>

              {/* Row 1: Away Team */}
              <div className="grid grid-cols-12 gap-3 mb-3 items-center">
                <div className="col-span-6 sm:col-span-6 font-bold text-base sm:text-lg text-gray-900 truncate pr-2 flex items-center">
                  <span className="w-1 h-8 bg-[#C83495] rounded-full mr-3"></span>
                  {odds.away.name}
                </div>

                {/* Spread Button */}
                <div className="col-span-3 sm:col-span-3">
                  <div className="flex flex-col items-center justify-center py-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[#C83495] hover:bg-pink-50 transition-all duration-200 group bg-white h-full min-h-[58px] shadow-sm hover:shadow-md">
                    <span className="text-sm sm:text-base font-black text-gray-900 group-hover:text-[#C83495] transition-colors">
                      {odds.away.spread?.point || "-"}
                    </span>
                    <span className="text-xs text-gray-500 font-bold mt-0.5">
                      {odds.away.spread?.price}
                    </span>
                  </div>
                </div>

                {/* ML Button */}
                <div className="col-span-3 sm:col-span-3">
                  <div className="flex flex-col items-center justify-center py-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[#C83495] hover:bg-pink-50 transition-all duration-200 group bg-white h-full min-h-[58px] shadow-sm hover:shadow-md">
                    <span className="text-sm sm:text-base font-black text-gray-900 group-hover:text-[#C83495] transition-colors">
                      {odds.away.ml?.price || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 2: Home Team */}
              <div className="grid grid-cols-12 gap-3 mb-6 items-center">
                <div className="col-span-6 sm:col-span-6 font-bold text-base sm:text-lg text-gray-900 truncate pr-2 flex items-center">
                  <span className="w-1 h-8 bg-[#24257C] rounded-full mr-3"></span>
                  {odds.home.name}
                </div>

                {/* Spread Button */}
                <div className="col-span-3 sm:col-span-3">
                  <div className="flex flex-col items-center justify-center py-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[#C83495] hover:bg-pink-50 transition-all duration-200 group bg-white h-full min-h-[58px] shadow-sm hover:shadow-md">
                    <span className="text-sm sm:text-base font-black text-gray-900 group-hover:text-[#C83495] transition-colors">
                      {odds.home.spread?.point || "-"}
                    </span>
                    <span className="text-xs text-gray-500 font-bold mt-0.5">
                      {odds.home.spread?.price}
                    </span>
                  </div>
                </div>

                {/* ML Button */}
                <div className="col-span-3 sm:col-span-3">
                  <div className="flex flex-col items-center justify-center py-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[#C83495] hover:bg-pink-50 transition-all duration-200 group bg-white h-full min-h-[58px] shadow-sm hover:shadow-md">
                    <span className="text-sm sm:text-base font-black text-gray-900 group-hover:text-[#C83495] transition-colors">
                      {odds.home.ml?.price || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 3: Totals (Your Exact Structure) */}
              {odds.total && (
                <div className="border-t-2 border-gray-100 pt-5 mt-2">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <span className="text-xs font-black text-gray-500 uppercase tracking-wider">
                      Total Score
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Over */}
                    <div className="flex flex-row items-center justify-between px-4 py-3.5 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[#C83495] hover:bg-pink-50 transition-all duration-200 group bg-white shadow-sm hover:shadow-md">
                      <span className="text-xs font-black text-gray-600 uppercase group-hover:text-[#C83495] transition-colors">
                        Over
                      </span>
                      <div className="flex flex-col items-end leading-tight">
                        <span className="text-base font-black text-gray-900">
                          {odds.total.over?.point.replace("O ", "")}
                        </span>
                        <span className="text-xs font-bold text-gray-500 mt-0.5">
                          {odds.total.over?.price}
                        </span>
                      </div>
                    </div>

                    {/* Under */}
                    <div className="flex flex-row items-center justify-between px-4 py-3.5 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[#C83495] hover:bg-pink-50 transition-all duration-200 group bg-white shadow-sm hover:shadow-md">
                      <span className="text-xs font-black text-gray-600 uppercase group-hover:text-[#C83495] transition-colors">
                        Under
                      </span>
                      <div className="flex flex-col items-end leading-tight">
                        <span className="text-base font-black text-gray-900">
                          {odds.total.under?.point.replace("U ", "")}
                        </span>
                        <span className="text-xs font-bold text-gray-500 mt-0.5">
                          {odds.total.under?.price}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-12 p-10 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-gray-200 text-center shadow-lg">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-gray-600 font-bold text-base">
              Real-time odds are currently unavailable for this matchup.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Check back soon for updated betting lines
            </p>
          </div>
        )}

        {/* --- Expert Analysis Section --- */}
        <div className="mb-12">
          {/* Section Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-1 bg-gradient-to-r from-[#24257C] to-[#C83495] rounded-full flex-1"></div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-[#24257C]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-black text-gray-700 uppercase tracking-widest">
                Expert Analysis
              </span>
            </div>
            <div className="h-1 bg-gradient-to-l from-[#24257C] to-[#C83495] rounded-full flex-1"></div>
          </div>

          {/* Predictions Content */}
          <div className="space-y-8">
            {event.eventpredictions.map(
              (prediction: DetailPrediction, index: number) => (
                <div
                  key={index}
                  className="bg-white border-l-4 border-[#C83495] rounded-xl p-6 sm:p-8 shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <h2 className="text-xl sm:text-2xl font-black text-[#24257C] mb-4 leading-tight">
                    {prediction.heading}
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 text-base sm:text-lg leading-relaxed whitespace-pre-line font-normal">
                      {prediction.description}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default Article;
