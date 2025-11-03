-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('heading', 'subheading', 'text', 'image');

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "metaTags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "ArticleContent" (
    "id" SERIAL NOT NULL,
    "type" "ContentType" NOT NULL,
    "content" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "articleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArticleContent_articleId_order_idx" ON "ArticleContent"("articleId", "order");

-- AddForeignKey
ALTER TABLE "ArticleContent" ADD CONSTRAINT "ArticleContent_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
