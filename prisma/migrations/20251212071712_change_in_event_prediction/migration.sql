/*
  Warnings:

  - You are about to drop the column `article1Description` on the `Eventprediction` table. All the data in the column will be lost.
  - You are about to drop the column `article1Heading` on the `Eventprediction` table. All the data in the column will be lost.
  - You are about to drop the column `article2Description` on the `Eventprediction` table. All the data in the column will be lost.
  - You are about to drop the column `article2Heading` on the `Eventprediction` table. All the data in the column will be lost.
  - You are about to drop the column `article3Description` on the `Eventprediction` table. All the data in the column will be lost.
  - You are about to drop the column `article3Heading` on the `Eventprediction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Eventprediction" DROP COLUMN "article1Description",
DROP COLUMN "article1Heading",
DROP COLUMN "article2Description",
DROP COLUMN "article2Heading",
DROP COLUMN "article3Description",
DROP COLUMN "article3Heading";
