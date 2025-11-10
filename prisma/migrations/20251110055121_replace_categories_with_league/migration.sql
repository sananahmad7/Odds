/*
  Warnings:

  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ArticleCategories` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `league` to the `Article` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "League" AS ENUM ('NFL', 'NBA', 'NCAAF', 'NCAAB', 'MLB', 'UFC');

-- DropForeignKey
ALTER TABLE "public"."_ArticleCategories" DROP CONSTRAINT "_ArticleCategories_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ArticleCategories" DROP CONSTRAINT "_ArticleCategories_B_fkey";

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "league" "League" NOT NULL;

-- DropTable
DROP TABLE "public"."Category";

-- DropTable
DROP TABLE "public"."_ArticleCategories";

-- CreateIndex
CREATE INDEX "Article_league_idx" ON "Article"("league");
