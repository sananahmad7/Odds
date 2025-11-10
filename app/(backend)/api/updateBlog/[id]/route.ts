// app/api/updateBlog/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyAdminJWT, getAdminCookieName } from "@/lib/auth";

type RouteParams = {
  params: Promise<{ id: string }>;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function makeUniqueSlug(base: string) {
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    // ---- Admin auth (cookie-based) ----
    const jar = await cookies();
    const token = jar.get(getAdminCookieName())?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
      verifyAdminJWT(token);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const articleId = Number(id);
    if (!Number.isInteger(articleId)) {
      return NextResponse.json(
        { error: "Invalid article id" },
        { status: 400 }
      );
    }

    // ---- Parse body ----
    const body = await req.json().catch(() => ({} as any));
    const {
      title,
      slug: slugFromBody,
      description,
      thumbnail,
      publishDate, // ISO/string
      metaTags = [],
      content = [], // [{ type, content, description? }]
      published,
      isFeatured,
      league, // "NFL" | "NBA" | ...
    } = body as {
      title?: string;
      slug?: string;
      description?: string;
      thumbnail?: string;
      publishDate?: string | Date;
      metaTags?: string[];
      content?: Array<{
        type: "heading" | "subheading" | "text" | "image";
        content: string;
        description?: string;
      }>;
      published?: boolean;
      isFeatured?: boolean;
      league?: "NFL" | "NBA" | "NCAAF" | "NCAAB" | "MLB" | "UFC";
    };

    // Ensure article exists
    const existing = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, slug: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // ---- Slug logic ----
    // Prefer an explicit slug from the body, else derive from title, else keep existing
    let nextSlug = existing.slug;
    const candidateBase = (slugFromBody || title)?.toString().trim();
    if (candidateBase) {
      const candidate = slugify(candidateBase);
      if (candidate && candidate !== existing.slug) {
        const conflict = await prisma.article.findUnique({
          where: { slug: candidate },
        });
        nextSlug =
          conflict && conflict.id !== articleId
            ? makeUniqueSlug(candidate)
            : candidate;
      }
    }

    // ---- Build shallow update object ----
    const data: any = {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(thumbnail !== undefined && { thumbnail }),
      ...(published !== undefined && { published }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(Array.isArray(metaTags) && { metaTags }),
      ...(league && { league }), // must be one of the enum values
      slug: nextSlug,
      ...(publishDate && { publishedAt: new Date(publishDate) }),
    };

    // ---- Transaction: update + (optional) replace blocks ----
    const updated = await prisma.$transaction(async (tx) => {
      const base = await tx.article.update({
        where: { id: articleId },
        data,
      });

      if (Array.isArray(content) && content.length > 0) {
        await tx.articleContent.deleteMany({ where: { articleId } });
        // recreate in order
        for (let i = 0; i < content.length; i++) {
          const b = content[i];
          await tx.articleContent.create({
            data: {
              articleId,
              type: b.type,
              content: b.content,
              description: b.description ?? null,
              order: i,
            },
          });
        }
      }
      return base;
    });

    // Return fresh article with ordered blocks
    const result = await prisma.article.findUnique({
      where: { id: updated.id },
      include: {
        contentBlocks: { orderBy: { order: "asc" } },
      },
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("PUT /api/updateBlog/[id] failed:", err);
    return NextResponse.json(
      { error: "Failed to update blog" },
      { status: 500 }
    );
  }
}
