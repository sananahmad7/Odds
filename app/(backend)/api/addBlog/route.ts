// app/api/addArticle/route.ts

import { NextResponse } from "next/server";
import{ prisma }from "../../../../lib/prisma"
export async function POST(req: Request) {
  const {
    title,
    slug,
    description,
    thumbnail,
    league,
    publishDate,
    metaTags,
    categories,
    content,
    published, // true/false
  } = await req.json();

  // Basic validation
  if (!title || !description ||  !categories || !content || !publishDate) {
    return NextResponse.json({ message: "Please fill out all required fields." }, { status: 400 });
  }

  try {
    // Normalize categories (assumes categories are an array of { name, slug })
    const categoryOps = categories.map((c: { name: string; slug: string }) => ({
      where: { slug: c.slug },
      create: { name: c.name, slug: c.slug },
    }));
    // Create the article
    const newArticle = await prisma.article.create({
      data: {
        title,
        slug,
        description,
        thumbnail,
        league, 
        publishedAt: new Date(publishDate),
        published,
        metaTags,
        categories: {
          connectOrCreate: categoryOps, // Connect existing or create new
        },
        contentBlocks: {
          create: content.map((block: any, index: number) => ({
            type: block.type,
            content: block.content,
            description: block.description || null,
            order: index, // keep order based on frontend data
          })),
        },
      },
    });

    // Success response
    return NextResponse.json(newArticle, { status: 201 });
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json({ message: "Failed to create the article." }, { status: 500 });
  }
}
