// app/api/addArticle/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
export const runtime = "nodejs";       // ✅ important

export async function POST(req: Request) {
  const {
    title,
    slug,
    description,
    thumbnail,
    publishDate,            // ISO string
    metaTags = [],          // default
    categories = [],        // [{ name, slug }]
    content = [],           // [{ type, content, description? }]
    published = false,
    isFeatured = false,     // <— include this vdvx 
  } = await req.json();

  if (!title || !description || !categories?.length || !content?.length || !publishDate) {
    return NextResponse.json(
      { message: "Please fill out all required fields." },
      { status: 400 }
    );
  }

  try {
    const categoryOps = categories.map((c: { name: string; slug: string }) => ({
      where: { slug: c.slug },
      create: { name: c.name, slug: c.slug },
    }));

    const data = {
      title,
      slug,
      description,
      thumbnail,
      publishedAt: new Date(publishDate),
      published,
      isFeatured,
      metaTags,
      categories: { connectOrCreate: categoryOps },
      contentBlocks: {
        // Prisma will replace on create; on update below we leave blocks unchanged
        create: content.map((block: any, index: number) => ({
          type: block.type,                // 'heading' | 'subheading' | 'text' | 'image'
          content: block.content,
          description: block.description || null,
          order: index,
        })),
      },
    } as const;

    // Idempotent: if exists, update shallow fields (keep existing contentBlocks as-is)
    const article = await prisma.article.upsert({
      where: { slug },
      create: data,
      update: {
        title,
        description,
        thumbnail,
        publishedAt: new Date(publishDate),
        published,
        isFeatured,
        metaTags,
        // NOTE: leaving categories/contentBlocks unchanged on update keeps it simple.
        // If you want to re-sync categories or blocks, we can add logic for that.
      },
      include: { categories: true, contentBlocks: true },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating article:", error);
    return NextResponse.json({ message: "Failed to create/update the article." }, { status: 500 });
  }
}
