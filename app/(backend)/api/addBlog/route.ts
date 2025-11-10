// app/api/addArticle/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
export const runtime = "nodejs"; // ✅ important

// Keep in sync with your Prisma enum
const LEAGUES = new Set(["NFL", "NBA", "NCAAF", "NCAAB", "MLB", "UFC"]);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const {
      title,
      slug,
      description,
      thumbnail,
      publishedAt,                 // ISO string (preferred)
      publishDate,                 // legacy support
      metaTags = [],
      league,                      // ⬅️ required enum
      content = [],                // [{ type, content, description? }]
      published = false,
      isFeatured = false,          // keep supporting featured flag
    } = body || {};

    // Basic validation
    if (!title || !slug || !description) {
      return NextResponse.json(
        { message: "Missing title, slug or description." },
        { status: 400 }
      );
    }

    if (!league || !LEAGUES.has(String(league))) {
      return NextResponse.json(
        { message: "Invalid or missing league." },
        { status: 400 }
      );
    }

    if (!Array.isArray(content) || content.length === 0) {
      return NextResponse.json(
        { message: "At least one content block is required." },
        { status: 400 }
      );
    }

    const whenISO = publishedAt ?? publishDate;
    if (!whenISO) {
      return NextResponse.json(
        { message: "Missing publishedAt date." },
        { status: 400 }
      );
    }
    const when = new Date(whenISO);
    if (Number.isNaN(when.getTime())) {
      return NextResponse.json(
        { message: "Invalid publishedAt date." },
        { status: 400 }
      );
    }

    // Build create payload (no categories anymore)
    const data = {
      title,
      slug,
      description,
      thumbnail,
      publishedAt: when,
      published,
      isFeatured,
      metaTags: Array.isArray(metaTags) ? metaTags : [],
      league, // enum value as string
      contentBlocks: {
        create: (content as any[]).map((block, index) => ({
          type: block.type,                     // 'heading' | 'subheading' | 'text' | 'image'
          content: String(block.content ?? ""),
          description: block.description ?? null,
          order: index,
        })),
      },
    } as const;

    // Idempotent upsert by slug
    const article = await prisma.article.upsert({
      where: { slug },
      create: data,
      update: {
        title,
        description,
        thumbnail,
        publishedAt: when,
        published,
        isFeatured,
        metaTags: Array.isArray(metaTags) ? metaTags : [],
        league,
        // Note: contentBlocks left unchanged on update (same behavior as before).
      },
      include: { contentBlocks: true },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating article:", error);
    return NextResponse.json(
      { message: "Failed to create/update the article." },
      { status: 500 }
    );
  }
}
