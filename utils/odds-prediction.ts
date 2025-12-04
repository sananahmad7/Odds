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
  article1Heading: string;
  article1Content: string;
  article2Heading: string;
  article2Content: string;
  article3Heading: string;
  article3Content: string;
}

// -----------------------------
// Route
// -----------------------------
const todayDaysFromNow = new Date();
todayDaysFromNow.setDate(todayDaysFromNow.getDate() + 2);

export async function handleOddsPrediction() {
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
      // Check if prediction already exists for this event
      const existingPrediction = await prisma.eventprediction.findFirst({
        where: { oddsEventId: event.id },
        select: {
          id: true,
          articleTitle: true,
          article1Heading: true,
          article1Description: true,
          article2Heading: true,
          article2Description: true,
          article3Heading: true,
          article3Description: true,
        },
      });

      // Get the odds data for the event
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
- Start with a short, catchy introduction.
- Write 3 distinct sections:
  1. **How Team 1 Can Win**: Analyze the key factors (recent form, head-to-head, odds, strengths/weaknesses, home/away, injuries) and explain why Team 1 is likely to win.
  2. **How Team 2 Can Win**: Analyze the key factors and explain why Team 2 is likely to win.
  3. **Overall Summary and Final Prediction**: Provide an overall summary with your final prediction.

OUTPUT FORMAT (VERY IMPORTANT – FOLLOW EXACTLY):

article-title: <a short, catchy title for the prediction article>
article-1-heading: <how Team 1 can win, catchy heading>
article-1-content: <detailed content about how Team 1 can win>
article-2-heading: <how Team 2 can win, catchy heading>
article-2-content: <detailed content about how Team 2 can win>
article-3-heading: <overall summary and final prediction heading>
article-3-content: <overall summary and final prediction>

FORMAT RULES:
- Do NOT use any markdown formatting at all (no #, ##, ###, *, -, _, or ---).
- Do NOT add any other fields or labels besides the ones specified.
- Do NOT put blank titles or dummy text; all fields must be meaningful.

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

      // Parse the content into structured sections
      const titleLabel = "article-title:";
      const section1HeadingLabel = "article-1-heading:";
      const section1ContentLabel = "article-1-content:";
      const section2HeadingLabel = "article-2-heading:";
      const section2ContentLabel = "article-2-content:";
      const section3HeadingLabel = "article-3-heading:";
      const section3ContentLabel = "article-3-content:";

      const titleIndex = content.indexOf(titleLabel);
      const section1HeadingIndex = content.indexOf(section1HeadingLabel);
      const section1ContentIndex = content.indexOf(section1ContentLabel);
      const section2HeadingIndex = content.indexOf(section2HeadingLabel);
      const section2ContentIndex = content.indexOf(section2ContentLabel);
      const section3HeadingIndex = content.indexOf(section3HeadingLabel);
      const section3ContentIndex = content.indexOf(section3ContentLabel);

      let articleTitle = "";
      let article1Heading = "";
      let article1Content = "";
      let article2Heading = "";
      let article2Content = "";
      let article3Heading = "";
      let article3Content = "";

      if (titleIndex !== -1) {
        articleTitle = content
          .slice(titleIndex + titleLabel.length, section1HeadingIndex)
          .trim();
      }
      if (section1HeadingIndex !== -1 && section1ContentIndex !== -1) {
        article1Heading = content
          .slice(
            section1HeadingIndex + section1HeadingLabel.length,
            section1ContentIndex
          )
          .trim();
        article1Content = content
          .slice(
            section1ContentIndex + section1ContentLabel.length,
            section2HeadingIndex
          )
          .trim();
      }
      if (section2HeadingIndex !== -1 && section2ContentIndex !== -1) {
        article2Heading = content
          .slice(
            section2HeadingIndex + section2HeadingLabel.length,
            section2ContentIndex
          )
          .trim();
        article2Content = content
          .slice(
            section2ContentIndex + section2ContentLabel.length,
            section3HeadingIndex
          )
          .trim();
      }
      if (section3HeadingIndex !== -1 && section3ContentIndex !== -1) {
        article3Heading = content
          .slice(
            section3HeadingIndex + section3HeadingLabel.length,
            section3ContentIndex
          )
          .trim();
        article3Content = content
          .slice(section3ContentIndex + section3ContentLabel.length)
          .trim();
      }

      const responseBody: OddsArticleResponse = {
        success: true,
        heading: articleTitle,
        article1Heading,
        article1Content,
        article2Heading,
        article2Content,
        article3Heading,
        article3Content,
      };

      // If a prediction already exists, update it; otherwise, create a new one
      if (existingPrediction) {
        await prisma.eventprediction.update({
          where: { id: existingPrediction.id },
          data: {
            articleTitle: responseBody.heading,
            article1Heading: responseBody.article1Heading,
            article1Description: responseBody.article1Content,
            article2Heading: responseBody.article2Heading,
            article2Description: responseBody.article2Content,
            article3Heading: responseBody.article3Heading,
            article3Description: responseBody.article3Content,
          },
        });
      } else {
        // Store a new prediction in DB for this event
        await prisma.eventprediction.create({
          data: {
            articleTitle: responseBody.heading,
            article1Heading: responseBody.article1Heading,
            article1Description: responseBody.article1Content,
            article2Heading: responseBody.article2Heading,
            article2Description: responseBody.article2Content,
            article3Heading: responseBody.article3Heading,
            article3Description: responseBody.article3Content,
            oddsEventId: event.id,
          },
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Predictions processed successfully",
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
