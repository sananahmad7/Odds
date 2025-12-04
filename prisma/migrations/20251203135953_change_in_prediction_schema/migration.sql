/*
  Warnings:

  - You are about to drop the column `description` on the `Eventprediction` table. All the data in the column will be lost.
  - You are about to drop the column `heading` on the `Eventprediction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Eventprediction" DROP COLUMN "description",
DROP COLUMN "heading",
ADD COLUMN     "article1Description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "article1Heading" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "article2Description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "article2Heading" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "article3Description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "article3Heading" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "articleTitle" TEXT NOT NULL DEFAULT '';
