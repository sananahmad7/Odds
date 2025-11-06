// app/api/v1/article/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

// GET single article by slug
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Await params since it's a Promise in Next.js 15+
    const { slug } = await params;

    const article = await prisma.article.findUnique({
      where: { 
        slug: slug,
        
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        contentBlocks: {
          orderBy: {
            order: 'asc' // Order by the order field
          }
        }
      }
    });

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}