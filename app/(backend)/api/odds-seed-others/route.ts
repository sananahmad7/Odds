// app/api/odds-seed-others/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/odds-seed-others
 * Seeds non-NFL leagues (NBA, NCAAF, NCAAB, MLB, UFC).
 * - No bookmaker filter (so you get more events)
 * - Regions: us,us2,uk,eu,au to widen coverage
 * - Sequential writes to avoid Prisma transaction timeouts
 *
 * ENV: ODDS_API_KEY
 */
export async function POST() {
  const API_KEY = process.env.ODDS_API_KEY;
  if (!API_KEY) {
    return NextResponse.json(
      { ok: false, error: "Missing ODDS_API_KEY in environment" },
      { status: 500 }
    );
  }

  const SPORTS: { key: string; title: string }[] = [
    { key: "basketball_nba", title: "NBA" },
    { key: "americanfootball_ncaaf", title: "NCAAF" },
    { key: "basketball_ncaab", title: "NCAAB" },
    { key: "baseball_mlb", title: "MLB" },
    { key: "mma_mixed_martial_arts", title: "UFC" },
  ];

  const BASE = "https://api.the-odds-api.com/v4";
  const params = new URLSearchParams({
    apiKey: API_KEY,
    regions: "us,us2,uk,eu,au",            // broaden coverage
    markets: "h2h,spreads,totals",
    oddsFormat: "american",
    // (intentionally no `bookmakers` filter)
  }).toString();

  type OddsApiOutcome = { name: string; price: number; point?: number | null };
  type OddsApiMarket = { key: string; last_update: string; outcomes: OddsApiOutcome[] };
  type OddsApiBookmaker = { key: string; title: string; last_update: string; markets: OddsApiMarket[] };
  type OddsApiEvent = {
    id: string;
    sport_key: string;
    commence_time: string; // ISO
    home_team: string;
    away_team: string;
    bookmakers: OddsApiBookmaker[];
  };

  const summary: Array<{
    league: string;
    status?: number;
    statusText?: string;
    rateLimit?: { remaining: string | null; used: string | null };
    eventsCount: number;
    upsertedEvents: number;
    error: string | null;
  }> = [];

  try {
    for (const sport of SPORTS) {
      const url = `${BASE}/sports/${sport.key}/odds?${params}`;
      const res = await fetch(url, { cache: "no-store" });

      const meta = {
        status: res.status,
        statusText: res.statusText,
        rateLimit: {
          remaining: res.headers.get("x-requests-remaining"),
          used: res.headers.get("x-requests-used"),
        },
      };

      if (!res.ok) {
        summary.push({
          league: sport.title,
          ...meta,
          eventsCount: 0,
          upsertedEvents: 0,
          error: `Fetch failed: ${res.status} ${res.statusText}`,
        });
        continue;
      }

      const events = (await res.json()) as OddsApiEvent[];
      let upsertedEvents = 0;

      // Sequential, no explicit transaction per event
      for (const e of events) {
        // Event
        await prisma.oddsEvent.upsert({
          where: { id: e.id },
          update: {
            sportKey: e.sport_key,
            sportTitle: sport.title,
            commenceTime: new Date(e.commence_time),
            homeTeam: e.home_team,
            awayTeam: e.away_team,
          },
          create: {
            id: e.id,
            sportKey: e.sport_key,
            sportTitle: sport.title,
            commenceTime: new Date(e.commence_time),
            homeTeam: e.home_team,
            awayTeam: e.away_team,
          },
        });

        // Bookmakers
        for (const b of e.bookmakers ?? []) {
          const bookmaker = await prisma.oddsBookmaker.upsert({
            where: { eventId_key: { eventId: e.id, key: b.key } },
            update: {
              title: b.title,
              lastUpdate: new Date(b.last_update),
            },
            create: {
              eventId: e.id,
              key: b.key,
              title: b.title,
              lastUpdate: new Date(b.last_update),
            },
          });

          // Markets
          for (const m of b.markets ?? []) {
            const market = await prisma.oddsMarket.upsert({
              where: { bookmakerId_key: { bookmakerId: bookmaker.id, key: m.key } },
              update: { lastUpdate: new Date(m.last_update) },
              create: {
                bookmakerId: bookmaker.id,
                key: m.key,
                lastUpdate: new Date(m.last_update),
              },
            });

            // Outcomes
            for (const o of m.outcomes ?? []) {
              await prisma.oddsOutcome.upsert({
                where: { marketId_name: { marketId: market.id, name: o.name } },
                update: {
                  price: o.price,
                  point:
                    typeof o.point === "number"
                      ? o.point
                      : o.point == null
                      ? null
                      : Number.isFinite(Number(o.point))
                      ? Number(o.point)
                      : null,
                },
                create: {
                  marketId: market.id,
                  name: o.name,
                  price: o.price,
                  point:
                    typeof o.point === "number"
                      ? o.point
                      : o.point == null
                      ? null
                      : Number.isFinite(Number(o.point))
                      ? Number(o.point)
                      : null,
                },
              });
            }
          }
        }

        upsertedEvents += 1;
      }

      summary.push({
        league: sport.title,
        ...meta,
        eventsCount: events.length,
        upsertedEvents,
        error: null,
      });
    }

    return NextResponse.json({ ok: true, summary });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
