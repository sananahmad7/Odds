"use client";

import Link from "next/link";
import { useState } from "react";
import { upcomingGames } from "@/dummyData";

export default function UpcomingGames() {
  const [selectedLeague, setSelectedLeague] = useState("NFL");
  const leagues = ["NFL", "NBA", "NCAAF", "NCAAB", "MLB", "UFC"];

  const filteredGames = upcomingGames
    .filter((g) => g.league === selectedLeague)
    .slice(0, 6);

  return (
    <section className="w-full bg-white py-16 sm:py-20  ">
      <div className="container mx-auto  px-4 md:px-6 lg:px-8 ">
        {/* Header */}
        <div className="mb-8 sm:mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight font-playfair">
              Upcoming Games
            </h2>
            <p className="mt-2 text-base sm:text-lg text-gray-600 font-inter">
              Expert predictions and odds for today&apos;s matchups
            </p>
          </div>

          {/* View All (desktop) */}
          <Link
            href="/league"
            className="hidden md:inline-flex items-center justify-center h-10 px-5 rounded-lg bg-[#101828] text-white text-sm font-semibold hover:opacity-95 transition"
          >
            View All
          </Link>
        </div>

        {/* League Tabs */}
        <div className="mb-8 sm:mb-10">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {leagues.map((league) => {
              const active = selectedLeague === league;
              return (
                <button
                  key={league}
                  onClick={() => setSelectedLeague(league)}
                  className={[
                    "px-5 sm:px-6 py-2.5 rounded-full text-sm sm:text-base font-semibold whitespace-nowrap transition-all",
                    active
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-[#278394] hover:text-[#278394]",
                  ].join(" ")}
                >
                  {league}
                </button>
              );
            })}
          </div>

          {/* View All (mobile) */}
          <Link
            href="/league"
            className="mt-4 md:hidden inline-flex w-full items-center justify-center h-11 rounded-lg bg-[#101828] text-white text-sm font-semibold hover:opacity-95 transition"
          >
            View All
          </Link>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              {/* Card content */}
              <div className="p-5">
                {/* Meta row */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="px-2 py-1 rounded-md bg-gray-50 border border-gray-200 font-medium">
                    {game.league}
                  </span>
                  <span className="font-medium">{game.kickoffTime}</span>
                </div>

                {/* Teams */}
                <div className="flex items-center justify-between gap-4 mb-5">
                  {/* Away */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-md bg-gray-100 flex items-center justify-center text-xl shrink-0">
                      {game.awayTeam.logo}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {game.awayTeam.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {game.venue}
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
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {game.homeTeam.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">Home</p>
                    </div>
                    <div className="w-11 h-11 rounded-md bg-gray-100 flex items-center justify-center text-xl shrink-0">
                      {game.homeTeam.logo}
                    </div>
                  </div>
                </div>

                {/* Odds */}
                <div className="rounded-xl bg-gray-50 border border-gray-100">
                  <div className="grid grid-cols-3 divide-x divide-gray-100">
                    <div className="p-3 text-center">
                      <p className="text-[11px] uppercase tracking-wide text-gray-500">
                        Spread
                      </p>
                      <p className="mt-0.5 font-semibold text-sm text-gray-900 [font-variant-numeric:tabular-nums]">
                        {game.odds.spread}
                      </p>
                    </div>
                    <div className="p-3 text-center">
                      <p className="text-[11px] uppercase tracking-wide text-gray-500">
                        Total
                      </p>
                      <p className="mt-0.5 font-semibold text-sm text-gray-900 [font-variant-numeric:tabular-nums]">
                        {game.odds.total}
                      </p>
                    </div>
                    <div className="p-3 text-center">
                      <p className="text-[11px] uppercase tracking-wide text-gray-500">
                        Moneyline
                      </p>
                      <p className="mt-0.5 font-semibold text-sm text-gray-900 [font-variant-numeric:tabular-nums]">
                        {game.odds.moneyline}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <button className="mt-4 w-full h-10 rounded-lg bg-[#101828] text-white text-sm font-inter font-semibold hover:opacity-95 transition">
                  Read Article
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
