import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  // Next.js 15+: params is a Promise
  params: Promise<{ slug: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const article = await prisma.article.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        thumbnail: true,
        publishedAt: true,
        isFeatured: true,
        published: true,
        league: true,          // ⬅️ new field
        metaTags: true,
        createdAt: true,
        updatedAt: true,
        contentBlocks: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            type: true,
            content: true,
            description: true,
            order: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Dates will be serialized to ISO strings by NextResponse.json
    return NextResponse.json(article);
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}
