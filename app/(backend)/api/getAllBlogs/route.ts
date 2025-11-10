// app/api/v1/blog/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"; // always fresh for admin
export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = await prisma.article.findMany({
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      // categories removed; league is a scalar enum so no include needed
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        thumbnail: true,
        league: true,           // ⬅️ new
        isFeatured: true,
        published: true,
        publishedAt: true,
      },
    });

    const payload = rows.map((r) => ({
      _id: String(r.id),                      // keep this for compatibility
      slug: r.slug,
      title: r.title,
      description: r.description,
      thumbnail: r.thumbnail,
      league: r.league,                       // ⬅️ send league
      isFeatured: Boolean(r.isFeatured),
      published: r.published,
      publishedAt: r.publishedAt.toISOString(),
    }));

    return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}
