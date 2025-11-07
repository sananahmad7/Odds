// app/api/getFeaturedBlogs/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      where: { isFeatured: true },
      orderBy: { publishedAt: "desc" },
      take: 3, // keep in sync with your max featured cap
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        thumbnail: true,
        publishedAt: true,
        isFeatured: true,
        published: true,
        categories: { select: { name: true, slug: true } },
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
      categories: a.categories.map((c) => ({ name: c.name, slug: c.slug })),
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
