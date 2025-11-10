// app/api/getFeaturedBlogs/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      where: { isFeatured: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        thumbnail: true,
        publishedAt: true,
        isFeatured: true,
        published: true,
        league: true, // ⬅️ NEW
      },
    });

    const payload = articles.map((a) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      description: a.description,
      thumbnail: a.thumbnail,
      publishedAt: a.publishedAt.toISOString(),
      isFeatured: !!a.isFeatured,
      published: !!a.published,
      league: a.league, // ⬅️ NEW
    }));

    return NextResponse.json(payload);
  } catch (err) {
    console.error("GET /api/getFeaturedBlogs failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch featured blogs" },
      { status: 500 }
    );
  }
}
