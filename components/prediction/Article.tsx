// components/prediction/Article.tsx
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type {
  DetailEvent,
  DetailBookmaker,
  DetailMarket,
  RelatedArticle,
} from "@app/(frontend)/prediction/[eventId]/page";

type ArticleProps = {
  event: DetailEvent;
  relatedArticles?: RelatedArticle[];
};

const Article = ({ event, relatedArticles = [] }: ArticleProps) => {
  const kickoffDate = new Date(event.commenceTime);

  // Always show US Central Time
  const kickoffDateCT = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "America/Chicago",
  }).format(kickoffDate);

  const kickoffTimeCT = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Chicago",
  }).format(kickoffDate);

  const kickoffLabel = `${kickoffDateCT} • ${kickoffTimeCT} Central Time`;

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

  const getBestOdds = (event: DetailEvent): NormalizedOdds | null => {
    if (!event.bookmakers || event.bookmakers.length === 0) return null;
    const requiredMarkets = ["spreads", "h2h", "totals"];

    // Find a bookmaker that has all 3 markets, or fallback to the first one
    const bestBookmaker: DetailBookmaker =
      event.bookmakers.find((book) => {
        const availableKeys = book.markets.map((m) => m.key);
        return requiredMarkets.every((k) => availableKeys.includes(k));
      }) || event.bookmakers[0];

    if (!bestBookmaker) return null;

    const spreadMarket = bestBookmaker.markets.find((m) => m.key === "spreads");
    const mlMarket = bestBookmaker.markets.find((m) => m.key === "h2h");
    const totalMarket = bestBookmaker.markets.find((m) => m.key === "totals");

    const getOutcome = (market: DetailMarket | undefined, name: string) =>
      market?.outcomes.find((o) => o.name === name || name.includes(o.name));
    const getTotal = (type: "Over" | "Under") =>
      totalMarket?.outcomes.find((o) => o.name.includes(type));
    const fmtPrice = (price: number) => (price > 0 ? `+${price}` : `${price}`);

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

  // Normalize odds
  const odds = useMemo(() => getBestOdds(event), [event]);

  // Logo visibility
  const [awayLogoVisible, setAwayLogoVisible] = useState(true);
  const [homeLogoVisible, setHomeLogoVisible] = useState(true);
  const leagueFolder = event.sportTitle;

  // Totals Extraction - Cleaning up "O " and "U " to just get the number
  const totalPoint =
    odds?.total?.over?.point?.replace(/^O\s*/, "") ??
    odds?.total?.under?.point?.replace(/^U\s*/, "") ??
    "—";

  return (
    <article className="bg-[#FAFAFA] font-inter text-[#111827]">
      {/* Breadcrumb */}
      <nav className="mb-4">
        <ol className="flex items-center gap-2 text-sm text-[#111827]">
          <li>
            <Link
              href="/"
              className="hover:text-[#C83495] transition-colors font-semibold font-neue"
            >
              Home
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link
              href={`/league/${event.sportTitle.toLowerCase()}`}
              className="hover:text-[#C83495] font-semibold font-neue transition-colors"
            >
              {event.sportTitle}
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-[#24257C] font-semibold font-neue">
            {event.awayTeam} vs {event.homeTeam}
          </li>
        </ol>
      </nav>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-8">
          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-[#24257C] text-white text-xs sm:text-sm font-bold font-neue uppercase tracking-wider px-3 py-1 rounded">
                {event.sportTitle}
              </span>
              <span className="text-sm sm:text-base text-[#111827] font-neue">
                {kickoffLabel}
              </span>
            </div>
            <h1 className="font-gtsuper text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111827] leading-tight mb-3">
              {event.awayTeam} vs {event.homeTeam} Prediction, Odds &amp; Best
              Bets
            </h1>
            <p className="font-neue text-lg text-gray-600">
              Expert analysis and betting picks for this {event.sportTitle}{" "}
              matchup.
            </p>
          </header>

          {/* Hero Image */}
          {event.image && event.image.trim().length > 0 && (
            <div className="mb-8">
              <div className="relative w-full h-56 sm:h-72 md:h-80 lg:h-96 rounded-2xl overflow-hidden bg-gray-100">
                <Image
                  src={event.image}
                  alt={`${event.awayTeam} vs ${event.homeTeam}`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 66vw, 100vw"
                />
              </div>
            </div>
          )}

          {/* --- PREMIUM ODDS TABLE --- */}
          {odds ? (
            <div className="mb-8 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm font-neue">
              {/* Scroll wrapper for mobile to prevent squashing */}
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  {/* Table Header */}
                  <div className="grid grid-cols-[2fr_1fr_1fr_1fr] bg-gray-50 border-b border-gray-200 px-4 py-2">
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider font-inter">
                      Matchup
                    </div>
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider font-inter text-center">
                      Spread
                    </div>
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider font-inter text-center">
                      Total
                    </div>
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider font-inter text-center">
                      Moneyline
                    </div>
                  </div>

                  {/* Away Team Row */}
                  <div className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    {/* Team Info */}
                    <div className="flex items-center gap-3">
                      {awayLogoVisible && (
                        <div className="w-8 h-8 flex items-center justify-center shrink-0">
                          <Image
                            src={`/${leagueFolder}/${event.awayTeam}.png`}
                            alt={`${event.awayTeam} logo`}
                            width={32}
                            height={32}
                            className="object-contain"
                            onError={() => setAwayLogoVisible(false)}
                          />
                        </div>
                      )}
                      <span className="font-gtsuper font-bold text-[#111827] text-lg leading-tight">
                        {event.awayTeam}
                      </span>
                    </div>

                    {/* Spread */}
                    <div className="text-center font-bold text-[#111827] text-base tabular-nums">
                      {odds.away.spread?.point || "-"}{" "}
                      <span className="text-xs text-gray-500 font-normal ml-0.5">
                        {odds.away.spread?.price}
                      </span>
                    </div>

                    {/* Total (Points Only) */}
                    <div className="text-center font-bold text-[#111827] text-base tabular-nums">
                      {totalPoint}
                    </div>

                    {/* Moneyline */}
                    <div className="text-center font-bold text-[#111827] text-base tabular-nums">
                      {odds.away.ml?.price || "-"}
                    </div>
                  </div>

                  {/* Home Team Row */}
                  <div className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                    {/* Team Info */}
                    <div className="flex items-center gap-3">
                      {homeLogoVisible && (
                        <div className="w-8 h-8 flex items-center justify-center shrink-0">
                          <Image
                            src={`/${leagueFolder}/${event.homeTeam}.png`}
                            alt={`${event.homeTeam} logo`}
                            width={32}
                            height={32}
                            className="object-contain"
                            onError={() => setHomeLogoVisible(false)}
                          />
                        </div>
                      )}
                      <span className="font-gtsuper font-bold text-[#111827] text-lg leading-tight">
                        {event.homeTeam}
                      </span>
                    </div>

                    {/* Spread */}
                    <div className="text-center font-bold text-[#111827] text-base tabular-nums">
                      {odds.home.spread?.point || "-"}{" "}
                      <span className="text-xs text-gray-500 font-normal ml-0.5 ">
                        {odds.home.spread?.price}
                      </span>
                    </div>

                    {/* Total (Points Only) */}
                    <div className="text-center font-bold text-[#111827] text-base tabular-nums">
                      {totalPoint}
                    </div>

                    {/* Moneyline */}
                    <div className="text-center font-bold text-[#111827] text-base tabular-nums">
                      {odds.home.ml?.price || "-"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Source Footer */}
              <div className="bg-gray-50 px-4 py-2 text-center border-t border-gray-200">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide font-inter">
                  Odds via{" "}
                  <span className="font-bold text-[#24257C]">
                    {odds.bookmakerName}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center mb-8">
              <p className="text-gray-500 font-inter">
                Odds are currently unavailable for this matchup.
              </p>
            </div>
          )}

          {/* Predictions Section */}
          <section className="mb-8">
            {event.eventpredictions.map((prediction, idx) => (
              <div key={idx} className="mb-8">
                {prediction.articleTitle && (
                  <h2 className="font-gtsuper text-2xl sm:text-3xl font-bold text-[#111827] mb-3">
                    {prediction.articleTitle}
                  </h2>
                )}

                {/* Game Overview */}
                {(prediction.gameOverviewHeading ||
                  prediction.gameOverviewDescription) && (
                  <>
                    <h3 className="font-gtsuper text-xl sm:text-2xl font-bold text-[#111827] pb-2">
                      {prediction.gameOverviewHeading}
                    </h3>
                    <div className="prose prose-lg max-w-none font-inter text-[#111827] leading-relaxed mb-4">
                      <p className="whitespace-pre-line">
                        {prediction.gameOverviewDescription}
                      </p>
                    </div>
                  </>
                )}

                {/* Team A Season */}
                {(prediction.teamASeasonHeading ||
                  prediction.teamASeasonDescription) && (
                  <>
                    <div className="flex items-center mb-4">
                      {event.sportTitle !== "MMA" && homeLogoVisible && (
                        <div className="mr-2">
                          <Image
                            src={`/${event.sportTitle}/${event.homeTeam}.png`}
                            alt={`${event.homeTeam} logo`}
                            width={32}
                            height={32}
                            className="object-contain"
                            onError={() => setHomeLogoVisible(false)}
                          />
                        </div>
                      )}
                      <h3 className="font-gtsuper text-2xl sm:text-3xl font-bold text-[#111827] pb-2">
                        {prediction.teamASeasonHeading}
                      </h3>
                    </div>
                    <div className="prose prose-lg max-w-none font-inter text-[#111827] leading-relaxed mb-4">
                      <p className="whitespace-pre-line">
                        {prediction.teamASeasonDescription}
                      </p>
                    </div>
                  </>
                )}

                {/* Team B Season */}
                {(prediction.teamBSeasonHeading ||
                  prediction.teamBSeasonDescription) && (
                  <>
                    <div className="flex items-center mt-4 mb-2">
                      {event.sportTitle !== "MMA" && awayLogoVisible && (
                        <div className="mr-2">
                          <Image
                            src={`/${event.sportTitle}/${event.awayTeam}.png`}
                            alt={`${event.awayTeam} logo`}
                            width={32}
                            height={32}
                            className="object-contain"
                            onError={() => setAwayLogoVisible(false)}
                          />
                        </div>
                      )}
                      <h3 className="font-gtsuper text-2xl sm:text-3xl font-bold text-[#111827] pb-2">
                        {prediction.teamBSeasonHeading}
                      </h3>
                    </div>
                    <div className="prose prose-lg max-w-none font-inter text-[#111827] leading-relaxed mb-4">
                      <p className="whitespace-pre-line">
                        {prediction.teamBSeasonDescription}
                      </p>
                    </div>
                  </>
                )}

                {/* Matchup Breakdown */}
                {(prediction.matchupBreakdownHeading ||
                  prediction.matchupBreakdownDescription) && (
                  <>
                    <h3 className="font-gtsuper text-2xl sm:text-3xl font-bold text-[#111827] mt-4 mb-2 pb-2">
                      {prediction.matchupBreakdownHeading}
                    </h3>
                    <div className="prose prose-lg max-w-none font-inter text-[#111827] leading-relaxed mb-4">
                      <p className="whitespace-pre-line">
                        {prediction.matchupBreakdownDescription}
                      </p>
                    </div>
                  </>
                )}

                {/* Spread Pick */}
                {(prediction.spreadPickHeading ||
                  prediction.spreadPickDescription) && (
                  <>
                    <h3 className="font-gtsuper text-2xl sm:text-3xl font-bold text-[#111827] mt-4 mb-2 pb-2">
                      {prediction.spreadPickHeading}
                    </h3>
                    <div className="prose prose-lg max-w-none font-inter text-[#111827] leading-relaxed mb-4">
                      <p className="whitespace-pre-line">
                        {prediction.spreadPickDescription}
                      </p>
                    </div>
                  </>
                )}

                {/* Over/Under Pick */}
                {(prediction.overUnderPickHeading ||
                  prediction.overUnderPickDescription) && (
                  <>
                    <h3 className="font-gtsuper text-2xl sm:text-3xl font-bold text-[#111827] mt-4 mb-2 pb-2">
                      {prediction.overUnderPickHeading}
                    </h3>
                    <div className="prose prose-lg max-w-none font-inter text-[#111827] leading-relaxed mb-4">
                      <p className="whitespace-pre-line">
                        {prediction.overUnderPickDescription}
                      </p>
                    </div>
                  </>
                )}

                {/* Player Prop Pick */}
                {(prediction.playerPropPickHeading ||
                  prediction.playerPropPickDescription) && (
                  <>
                    <h3 className="font-gtsuper text-2xl sm:text-3xl font-bold text-[#111827] mt-4 mb-2 pb-2">
                      {prediction.playerPropPickHeading}
                    </h3>
                    <div className="prose prose-lg max-w-none font-inter text-[#111827] leading-relaxed">
                      <p className="whitespace-pre-line">
                        {prediction.playerPropPickDescription}
                      </p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </section>
        </div>

        {/* Right Column - Sidebar */}
        <aside className="lg:col-span-4">
          {/* Related CMS Articles */}
          <div className="bg-white border sticky border-gray-200 rounded-lg overflow-hidden top-20">
            <div className="bg-[#24257C] px-4 py-3">
              <h3 className="text-white font-gtsuper font-bold text-sm uppercase tracking-wider">
                More {event.sportTitle} Articles
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {relatedArticles.length > 0 ? (
                relatedArticles.slice(0, 6).map((article) => (
                  <Link
                    key={article.id}
                    href={`/article/${article.slug}`}
                    className="flex gap-3 p-4 hover:bg-[#FAFAFA] transition-colors group"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                      {article.thumbnail ? (
                        <Image
                          src={article.thumbnail}
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-[#C83495] font-neue uppercase tracking-wider mb-1">
                        {article.league}
                      </p>
                      <h4 className="font-gtsuper font-bold text-sm text-[#111827] group-hover:text-[#C83495] transition-colors line-clamp-2">
                        {article.title}
                      </h4>
                      <p className="text-xs font-neue text-gray-500 mt-1">
                        {new Date(article.publishedAt).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-4">
                  <p className="text-sm text-gray-500 font-inter">
                    No related articles available.
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
};

export default Article;
