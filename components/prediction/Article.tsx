// components/prediction/Article.tsx

import React, { useMemo } from "react";
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

const Article = ({ event, relatedArticles = [] }: ArticleProps) => {
  const kickoff = new Date(event.commenceTime);
  const kickoffLabel = kickoff.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  console.log(relatedArticles);
  const odds = useMemo(() => getBestOdds(event), [event]);

  // Precompute total pieces (used only when odds exists)
  const totalPoint =
    odds?.total?.over?.point?.replace(/^O\s*/, "") ??
    odds?.total?.under?.point?.replace(/^U\s*/, "") ??
    "-";
  const overPrice = odds?.total?.over?.price ?? "—";
  const underPrice = odds?.total?.under?.price ?? "—";

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
              href={`/${event.sportKey}`}
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
              <span className="bg-[#24257C] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded">
                {event.sportTitle}
              </span>
              <span className="text-sm text-[#111827] font-inter">
                {kickoffLabel}
              </span>
            </div>
            <h1 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111827] leading-tight mb-3">
              {event.awayTeam} vs {event.homeTeam} Prediction, Odds & Best Bets
            </h1>
            <p className="font-inter text-lg text-gray-600">
              Expert analysis and betting picks for this {event.sportTitle}{" "}
              matchup.
            </p>
          </header>

          {/* Odds Table Card */}
          {odds ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
              <div className="bg-[#24257C] px-4 py-3 flex justify-between items-center">
                <span className="text-white font-bold text-sm uppercase tracking-wider">
                  Current Odds
                </span>
                <span className="text-[#25818F] text-xs font-medium bg-white px-2 py-1 rounded">
                  via {odds.bookmakerName}
                </span>
              </div>

              <div className="p-4">
                {/* Header: Team / Spread / Moneyline */}
                <div className="grid grid-cols-12 gap-2 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <div className="col-span-6">Team</div>
                  <div className="col-span-3 text-center">Spread</div>
                  <div className="col-span-3 text-center">Moneyline</div>
                </div>

                {/* Away Team Row */}
                <div className="grid grid-cols-12 gap-2 items-center py-3 border-b border-gray-100">
                  <div className="col-span-6 font-bold text-[#111827] truncate">
                    {odds.away.name}
                  </div>

                  {/* Spread pill */}
                  <div className="col-span-3 text-center">
                    <div className="bg-[#FAFAFA] border border-gray-200 rounded py-2 px-2 hover:border-[#C83495] transition-colors cursor-pointer">
                      <div className="font-bold text-[#111827]">
                        {odds.away.spread?.point || "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {odds.away.spread?.price}
                      </div>
                    </div>
                  </div>

                  {/* Moneyline pill */}
                  <div className="col-span-3 text-center">
                    <div className="bg-[#FAFAFA] border border-gray-200 rounded py-2 px-2 hover:border-[#C83495] transition-colors cursor-pointer">
                      <div className="font-bold text-[#111827]">
                        {odds.away.ml?.price || "-"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Home Team Row */}
                <div className="grid grid-cols-12 gap-2 items-center py-3">
                  <div className="col-span-6 font-bold text-[#111827] truncate">
                    {odds.home.name}
                  </div>

                  {/* Spread pill */}
                  <div className="col-span-3 text-center">
                    <div className="bg-[#FAFAFA] border border-gray-200 rounded py-2 px-2 hover:border-[#C83495] transition-colors cursor-pointer">
                      <div className="font-bold text-[#111827]">
                        {odds.home.spread?.point || "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {odds.home.spread?.price}
                      </div>
                    </div>
                  </div>

                  {/* Moneyline pill */}
                  <div className="col-span-3 text-center">
                    <div className="bg-[#FAFAFA] border border-gray-200 rounded py-2 px-2 hover:border-[#C83495] transition-colors cursor-pointer">
                      <div className="font-bold text-[#111827]">
                        {odds.home.ml?.price || "-"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Separate Game Total row (not tied to a team) */}
                {odds.total && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-gray-500 font-inter mb-1">
                      <span className="text-left w-full">Game Total</span>
                      <span className="text-center w-full">Over</span>
                      <span className="text-right w-full">Under</span>
                    </div>

                    <div className="flex items-center justify-between text-sm font-semibold text-[#111827] font-inter [font-variant-numeric:tabular-nums]">
                      <span className="text-left w-full">{totalPoint}</span>
                      <span className="text-center w-full">
                        {totalPoint}{" "}
                        <span className="text-xs text-gray-600">
                          {overPrice}
                        </span>
                      </span>
                      <span className="text-right w-full">
                        {totalPoint}{" "}
                        <span className="text-xs text-gray-600">
                          {underPrice}
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center mb-8">
              <p className="text-gray-500 font-inter">
                Odds are currently unavailable for this matchup.
              </p>
            </div>
          )}

          {/* Predictions / Analysis Section */}
          <section className="mb-8">
            {event.eventpredictions.map(
              (prediction: DetailPrediction, idx: number) => (
                <div key={idx} className="mb-8">
                  <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#111827] mb-4 pb-2 border-b-2 border-[#C83495]">
                    {prediction.heading}
                  </h2>
                  <div className="prose prose-lg max-w-none font-inter text-[#111827] leading-relaxed">
                    <p className="whitespace-pre-line">
                      {prediction.description}
                    </p>
                  </div>
                </div>
              )
            )}
          </section>
        </div>

        {/* Right Column - Sidebar */}
        <aside className="lg:col-span-4">
          {/* Related CMS Articles */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden sticky top-4">
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
                    href={`/article/${article.slug}`} // adjust to your article route
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
