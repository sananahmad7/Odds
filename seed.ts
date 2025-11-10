/* prisma/seed.ts */
import { PrismaClient, League as PrismaLeague, ContentType } from "@prisma/client";
import { blogArticles } from "./dummyData"; // adjust the path if needed

const prisma = new PrismaClient();

type Block = {
  type: "heading" | "subheading" | "text" | "image";
  content: string;
  description?: string;
};

async function main() {
  for (const a of blogArticles) {
    const blocks = (a.content as Block[]).map((b, idx) => ({
      type: b.type as ContentType,
      content: b.content,
      description: b.description ?? null,
      order: idx,
    }));

    await prisma.article.upsert({
      where: { slug: a.slug },
      update: {
        title: a.title,
        description: a.description,
        thumbnail: a.thumbnail,
        league: a.league as PrismaLeague,
        publishedAt: new Date(a.publishedAt),
        isFeatured: !!a.isFeatured,
        published: a.published,
        // reset and recreate blocks to match dummy data order
        contentBlocks: {
          deleteMany: {},
          create: blocks,
        },
      },
      create: {
        slug: a.slug,
        title: a.title,
        description: a.description,
        thumbnail: a.thumbnail,
        league: a.league as PrismaLeague,
        publishedAt: new Date(a.publishedAt),
        isFeatured: !!a.isFeatured,
        published: a.published,
        metaTags: [],
        contentBlocks: {
          create: blocks,
        },
      },
    });
  }

  console.log("Seed complete ✅");
}

main()
  .catch((e) => {
    console.error("Seed failed ❌", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
