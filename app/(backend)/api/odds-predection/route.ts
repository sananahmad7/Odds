import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { encode } from "@toon-format/toon";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const todayDaysFromNow = new Date();
todayDaysFromNow.setDate(todayDaysFromNow.getDate() + 2);

export async function POST() {
  try {
    const events = await prisma.oddsEvent.findMany({
      where: {
        commenceTime: {
          gte: new Date(),
          lte: todayDaysFromNow,
        },
      },
      include: {
        bookmakers: {
          include: {
            markets: {
              include: { outcomes: true },
            },
          },
        },
      },
      orderBy: { commenceTime: "asc" },
    });

    if (!events.length) {
      return NextResponse.json(
        { success: false, error: "No odds event found" },
        { status: 404 }
      );
    }

    for (const event of events) {
      const existing = await prisma.eventprediction.findFirst({
        where: { oddsEventId: event.id },
        select: { id: true },
      });

      const oddsData = encode(event);

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
You are a seasoned, sharp, slightly degenerate sports bettor — a mix of film junkie, data nerd, and Vegas insider. You talk in confident sportsbook language. You never mention being an AI. Base reasoning ONLY on the provided odds data.
`.trim(),
          },
          {
            role: "user",
            content: `
Write a prediction article using this structure:

1. Game Overview — 1–2 sentences.
2. Team A Season Snapshot — record, ATS/O-U, identity, trends.
3. Team B Season Snapshot — same but contrasting.
4. Matchup Breakdown — who has the edge and why.
5. Predictions:
   - Spread Pick
   - Over/Under Pick
   - Player Prop Pick

OUTPUT FORMAT (NO MARKDOWN, FOLLOW EXACTLY):

article-title: <title>

game-overview-heading: <heading>
game-overview-content: <content>

team-a-season-heading: <heading>
team-a-season-content: <content>

team-b-season-heading: <heading>
team-b-season-content: <content>

matchup-breakdown-heading: <heading>
matchup-breakdown-content: <content>

spread-pick-heading: <heading>
spread-pick-content: <content>

over-under-pick-heading: <heading>
over-under-pick-content: <content>

player-prop-pick-heading: <heading>
player-prop-pick-content: <content>

DATA:
${oddsData}
`.trim(),
          },
        ],
      });

      const content = completion.choices[0].message.content ?? "";

      // Helper function: extracts value between keys
      const extract = (label: string, nextLabel?: string) => {
        const start = content.indexOf(label);
        if (start === -1) return "";

        const begin = start + label.length;

        if (!nextLabel) return content.slice(begin).trim();

        const end = content.indexOf(nextLabel);
        return content.slice(begin, end).trim();
      };

      // Parse output
      const article = {
        articleTitle: extract("article-title:", "game-overview-heading:"),

        gameOverviewHeading: extract(
          "game-overview-heading:",
          "game-overview-content:"
        ),
        gameOverviewDescription: extract(
          "game-overview-content:",
          "team-a-season-heading:"
        ),

        teamASeasonHeading: extract(
          "team-a-season-heading:",
          "team-a-season-content:"
        ),
        teamASeasonDescription: extract(
          "team-a-season-content:",
          "team-b-season-heading:"
        ),

        teamBSeasonHeading: extract(
          "team-b-season-heading:",
          "team-b-season-content:"
        ),
        teamBSeasonDescription: extract(
          "team-b-season-content:",
          "matchup-breakdown-heading:"
        ),

        matchupBreakdownHeading: extract(
          "matchup-breakdown-heading:",
          "matchup-breakdown-content:"
        ),
        matchupBreakdownDescription: extract(
          "matchup-breakdown-content:",
          "spread-pick-heading:"
        ),

        spreadPickHeading: extract(
          "spread-pick-heading:",
          "spread-pick-content:"
        ),
        spreadPickDescription: extract(
          "spread-pick-content:",
          "over-under-pick-heading:"
        ),

        overUnderPickHeading: extract(
          "over-under-pick-heading:",
          "over-under-pick-content:"
        ),
        overUnderPickDescription: extract(
          "over-under-pick-content:",
          "player-prop-pick-heading:"
        ),

        playerPropPickHeading: extract(
          "player-prop-pick-heading:",
          "player-prop-pick-content:"
        ),
        playerPropPickDescription: extract("player-prop-pick-content:"),
      };

      // Create or Update
      if (existing) {
        await prisma.eventprediction.update({
          where: { id: existing.id },
          data: article,
        });
      } else {
        await prisma.eventprediction.create({
          data: { ...article, oddsEventId: event.id },
        });
      }
    }

    return NextResponse.json(
      { success: true, message: "Predictions processed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("MakeOddsPrediction Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
