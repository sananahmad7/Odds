// app/api/odds-sync/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { encode } from "@toon-format/toon";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface OddsArticleResponse {
  success: boolean;
  heading: string;
  description: string;
}

// -----------------------------
// Route
// -----------------------------
export async function POST(req: Request) {
  const { league } = await req.json();
  const upercaseLeague = league.toUpperCase();
  try {
    const events = await prisma.oddsEvent.findMany({
      where: { sportTitle: upercaseLeague },
      include: {
        bookmakers: {
          include: {
            markets: {
              include: {
                outcomes: true,
              },
            },
          },
        },
      },
      orderBy: { commenceTime: "asc" },
    });

    if (!events || events.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No odds event found",
        },
        { status: 404 }
      );
    }

    for (const event of events) {
      // Skip if prediction already exists for this event
      const existingPrediction = await prisma.eventprediction.findFirst({
        where: { oddsEventId: event.id },
        select: { id: true },
      });
      if (existingPrediction) continue;

      const oddsData = encode(event);

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
You are a professional sports betting analyst. Given odds and match data, you write clear, well-structured prediction articles about which team is more likely to win. Base your reasoning only on the provided data. Do not mention being an AI or refer to the prompt itself.
            `.trim(),
          },
          {
            role: "user",
            content: `
Using the following data, write a detailed prediction article about which team is more likely to win.

Requirements:
- Briefly describe both teams and the context of the match.
- Start with a short, catchy introduction.
- Analyze key factors (recent form, head-to-head, odds, strengths/weaknesses, home/away, injuries if present in data).
- Clearly state which team you predict will win and *why*, based strictly on the given data.
- Mention that predictions are not guaranteed outcomes.
- Keep it within 500–800 words.
- Write in confident, engaging, sports-article style.

OUTPUT FORMAT (VERY IMPORTANT – FOLLOW EXACTLY):

heading: <a short, catchy title for the prediction article>
description: <the full 500–800 word article in plain text, with normal paragraphs>

FORMAT RULES:
- Do NOT use any markdown formatting at all (no #, ##, ###, *, -, _, or ---).
- Do NOT add any other fields or labels besides "heading:" and "description:".
- Do NOT put blank titles or dummy text; both fields must be meaningful.
- The "description" must contain the full article, not just a sentence.

Here is the data to use:
${oddsData}
            `.trim(),
          },
        ],
      });

      if (
        !completion ||
        !completion.choices ||
        completion.choices.length === 0
      ) {
        throw new Error("Error: No choices found in OpenAI response.");
      }

      const content = completion.choices[0].message.content ?? "";

      if (typeof content !== "string") {
        throw new Error("Unexpected OpenAI response format.");
      }

      // Parse heading and description
      const headingLabel = "heading:";
      const descriptionLabel = "description:";

      const headingIndex = content.indexOf(headingLabel);
      const descriptionIndex = content.indexOf(descriptionLabel);

      let heading = "";
      let description = "";

      if (headingIndex !== -1 && descriptionIndex !== -1) {
        heading = content
          .slice(headingIndex + headingLabel.length, descriptionIndex)
          .trim();
        description = content
          .slice(descriptionIndex + descriptionLabel.length)
          .trim();
      } else {
        // Fallback: treat entire content as description if format not respected
        description = content.trim();
        heading = "Match Prediction";
      }

      const responseBody: OddsArticleResponse = {
        success: true,
        heading,
        description,
      };

      // Store prediction in DB for this event
      await prisma.eventprediction.create({
        data: {
          heading: responseBody.heading,
          description: responseBody.description,
          oddsEventId: event.id,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Predictions created successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in MakeOddsPrediction:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
