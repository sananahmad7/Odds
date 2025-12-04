// Article.tsx
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type {
  DetailOutcome,
  DetailPrediction,
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

  // Logo visibility (same pattern as GameCard, but using local event data)
  const [awayLogoVisible, setAwayLogoVisible] = useState(true);
  const [homeLogoVisible, setHomeLogoVisible] = useState(true);
  const leagueFolder = event.sportTitle; // e.g. "NFL", "NBA"

  // Totals
  const totalPoint =
    odds?.total?.over?.point?.replace(/^O\s*/, "") ??
    odds?.total?.under?.point?.replace(/^U\s*/, "") ??
    "—";
  const overPrice = odds?.total?.over?.price ?? "—";
  const underPrice = odds?.total?.under?.price ?? "—";
  const totalPriceLabel =
    overPrice === "—" && underPrice === "—"
      ? "—"
      : `${overPrice}o / ${underPrice}u`;

  return (
    <article className="bg-[#FAFAFA] font-inter text-[#111827]">
      {/* Breadcrumb */}
      <nav className="mb-4">
        <ol className="flex items-center gap-2 text-sm text-[#111827]">
          <li>
            <Link href="/" className="hover:text-[#C83495] transition-colors">
              Home
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link
              href={`/league/${event.sportTitle.toLowerCase()}`}
              className="hover:text-[#C83495] transition-colors"
            >
              {event.sportTitle}
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-[#24257C] font-medium">
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
              <span className="bg-[#24257C] text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-3 py-1 rounded">
                {event.sportTitle}
              </span>
              <span className="text-sm sm:text-base text-[#111827] font-inter">
                {kickoffLabel}
              </span>
            </div>
            <h1 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111827] leading-tight mb-3">
              {event.awayTeam} vs {event.homeTeam} Prediction, Odds &amp; Best
              Bets
            </h1>
            <p className="font-inter text-lg text-gray-600">
              Expert analysis and betting picks for this {event.sportTitle}{" "}
              matchup.
            </p>
          </header>

          {/* 🔥 Hero image from OddsEvent.image (Cloudinary) */}
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

          {/* Odds Card */}
          {odds ? (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8">
              {/* Top row: logos + time (US Central) */}
              <div className="px-6 py-5 border-b border-gray-200 bg-[#FAFAFA] flex items-center justify-between">
                {/* Away logo */}
                <div className="flex-1 flex justify-start">
                  {awayLogoVisible && (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                      <Image
                        src={`/${leagueFolder}/${event.awayTeam}.png`}
                        alt={`${event.awayTeam} logo`}
                        width={80}
                        height={80}
                        className="w-14 h-14 sm:w-18 sm:h-18 object-contain"
                        onError={() => setAwayLogoVisible(false)}
                      />
                    </div>
                  )}
                </div>

                {/* Center: kickoff info */}
                <div className="flex-1 text-center px-2 border-x border-gray-200">
                  <p className="text-base sm:text-lg font-bold text-[#111827]">
                    {kickoffDateCT}
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-[#111827]">
                    {kickoffTimeCT} CT
                  </p>
                  <p className="mt-1 text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-500">
                    {event.sportTitle}
                  </p>
                </div>

                {/* Home logo */}
                <div className="flex-1 flex justify-end">
                  {homeLogoVisible && (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                      <Image
                        src={`/${leagueFolder}/${event.homeTeam}.png`}
                        alt={`${event.homeTeam} logo`}
                        width={80}
                        height={80}
                        className="w-14 h-14 sm:w-18 sm:h-18 object-contain"
                        onError={() => setHomeLogoVisible(false)}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-5">
                {/* Second row: team names */}
                <div className="grid grid-cols-2 text-center border-b border-gray-200 pb-3 mb-4">
                  <div className="border-r border-gray-200">
                    <p className="text-sm sm:text-base font-bold uppercase tracking-wider text-[#111827]">
                      {event.awayTeam} Odds
                    </p>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-bold uppercase tracking-wider text-[#111827]">
                      {event.homeTeam} Odds
                    </p>
                  </div>
                </div>

                {/* Third area: Spread / Total / Moneyline per side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 sm:divide-x divide-gray-200 pt-1">
                  {/* Away side block */}
                  <div className="pb-4 sm:pb-0 sm:pr-4 border-b sm:border-b-0 border-gray-200 sm:border-0">
                    {/* Column headers with bottom border & vertical dividers */}
                    <div className="flex text-xs sm:text-sm font-bold text-[#111827] uppercase tracking-wider border-b border-gray-100 pb-2 mb-2">
                      <span className="flex-1 text-left">Spread</span>
                      <span className="flex-1 text-center border-l border-gray-100">
                        Total
                      </span>
                      <span className="flex-1 text-right border-l border-gray-100">
                        Moneyline
                      </span>
                    </div>

                    {/* Values with vertical dividers */}
                    <div className="flex items-end text-base sm:text-lg font-semibold text-[#111827] [font-variant-numeric:tabular-nums]">
                      {/* Spread */}
                      <div className="flex-1 text-left pr-3">
                        <div>{odds.away.spread?.point || "-"}</div>
                        <div className="text-xs sm:text-sm text-gray-500 mt-0.5">
                          {odds.away.spread?.price || "—"}
                        </div>
                      </div>

                      {/* Total */}
                      <div className="flex-1 text-center px-3 border-l border-gray-100">
                        <div>{totalPoint}</div>
                        <div className="text-xs sm:text-sm text-gray-500 mt-0.5">
                          {totalPriceLabel}
                        </div>
                      </div>

                      {/* Moneyline */}
                      <div className="flex-1 my-auto text-center pl-3 border-l border-gray-100">
                        <div>{odds.away.ml?.price || "-"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Home side block */}
                  <div className="pt-4 sm:pt-0 sm:pl-4">
                    {/* Column headers with bottom border & vertical dividers */}
                    <div className="flex text-xs sm:text-sm font-bold text-[#111827] uppercase tracking-wider border-b border-gray-100 pb-2 mb-2">
                      <span className="flex-1 text-left">Spread</span>
                      <span className="flex-1 text-center border-l border-gray-100">
                        Total
                      </span>
                      <span className="flex-1 text-right border-l border-gray-100">
                        Moneyline
                      </span>
                    </div>

                    {/* Values with vertical dividers */}
                    <div className="flex items-end text-base sm:text-lg font-semibold text-[#111827] [font-variant-numeric:tabular-nums]">
                      {/* Spread */}
                      <div className="flex-1 text-left pr-3">
                        <div>{odds.home.spread?.point || "-"}</div>
                        <div className="text-xs sm:text-sm text-gray-500 mt-0.5">
                          {odds.home.spread?.price || "—"}
                        </div>
                      </div>

                      {/* Total */}
                      <div className="flex-1 text-center px-3 border-l border-gray-100">
                        <div>{totalPoint}</div>
                        <div className="text-xs sm:text-sm text-gray-500 mt-0.5">
                          {totalPriceLabel}
                        </div>
                      </div>

                      {/* Moneyline */}
                      <div className="flex-1 my-auto text-center pl-3 border-l border-gray-100">
                        <div>{odds.home.ml?.price || "-"}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom: source / bookmaker */}
                <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-center text-gray-500">
                  Odds via{" "}
                  <span className="font-semibold text-[#25818F]">
                    {odds.bookmakerName}
                  </span>
                  .
                </div>
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
                <h2 className="font-gtsuper  text-2xl sm:text-3xl font-bold text-[#111827] mb-4 pb-2 border-b-2 border-[#C83495]">
                  {prediction.article1Heading}
                </h2>
                <div className="prose prose-lg max-w-none font-inter text-[#111827] leading-relaxed">
                  <p className="whitespace-pre-line">
                    {prediction.article1Description}
                  </p>
                </div>

                <h2 className="font-gtsuper text-2xl mt-4 sm:text-3xl font-bold text-[#111827] mb-4 pb-2 border-b-2 border-[#C83495]">
                  {prediction.article2Heading}
                </h2>
                <div className="prose prose-lg max-w-none font-inter text-[#111827] leading-relaxed">
                  <p className="whitespace-pre-line">
                    {prediction.article2Description}
                  </p>
                </div>

                <h2 className="font-gtsuper text-2xl mt-4 sm:text-3xl font-bold text-[#111827] mb-4 pb-2 border-b-2 border-[#C83495]">
                  {prediction.article3Heading}
                </h2>
                <div className="prose prose-lg max-w-none font-inter text-[#111827] leading-relaxed">
                  <p className="whitespace-pre-line">
                    {prediction.article3Description}
                  </p>
                </div>
              </div>
            ))}
          </section>
        </div>

        {/* Right Column - Sidebar */}
        <aside className="lg:col-span-4">
          {/* Related CMS Articles */}
          <div className="bg-white border sticky border-gray-200 rounded-lg overflow-hidden top-20">
            <div className="bg-[#24257C] px-4 py-3">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">
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
                      <p className="text-[11px] font-semibold text-[#C83495] uppercase tracking-wider mb-1">
                        {article.league}
                      </p>
                      <h4 className="font-inter font-bold text-sm text-[#111827] group-hover:text-[#C83495] transition-colors line-clamp-2">
                        {article.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
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
