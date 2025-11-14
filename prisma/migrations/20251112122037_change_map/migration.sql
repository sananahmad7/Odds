/*
  Warnings:

  - You are about to drop the column `last_update` on the `OddsBookmaker` table. All the data in the column will be lost.
  - You are about to drop the column `away_team` on the `OddsEvent` table. All the data in the column will be lost.
  - You are about to drop the column `commence_time` on the `OddsEvent` table. All the data in the column will be lost.
  - You are about to drop the column `home_team` on the `OddsEvent` table. All the data in the column will be lost.
  - You are about to drop the column `sport_key` on the `OddsEvent` table. All the data in the column will be lost.
  - You are about to drop the column `sport_title` on the `OddsEvent` table. All the data in the column will be lost.
  - You are about to drop the column `last_update` on the `OddsMarket` table. All the data in the column will be lost.
  - You are about to drop the column `oddsBookmakerId` on the `OddsMarket` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[eventId,key]` on the table `OddsBookmaker` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bookmakerId,key]` on the table `OddsMarket` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `OddsBookmaker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastUpdate` to the `OddsBookmaker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `awayTeam` to the `OddsEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commenceTime` to the `OddsEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `homeTeam` to the `OddsEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sportKey` to the `OddsEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sportTitle` to the `OddsEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookmakerId` to the `OddsMarket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastUpdate` to the `OddsMarket` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."OddsMarket" DROP CONSTRAINT "OddsMarket_oddsBookmakerId_fkey";

-- AlterTable
ALTER TABLE "OddsBookmaker" DROP COLUMN "last_update",
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "lastUpdate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "OddsEvent" DROP COLUMN "away_team",
DROP COLUMN "commence_time",
DROP COLUMN "home_team",
DROP COLUMN "sport_key",
DROP COLUMN "sport_title",
ADD COLUMN     "awayTeam" TEXT NOT NULL,
ADD COLUMN     "commenceTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "homeTeam" TEXT NOT NULL,
ADD COLUMN     "sportKey" TEXT NOT NULL,
ADD COLUMN     "sportTitle" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OddsMarket" DROP COLUMN "last_update",
DROP COLUMN "oddsBookmakerId",
ADD COLUMN     "bookmakerId" TEXT NOT NULL,
ADD COLUMN     "lastUpdate" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OddsBookmaker_eventId_key_key" ON "OddsBookmaker"("eventId", "key");

-- CreateIndex
CREATE INDEX "OddsEvent_commenceTime_idx" ON "OddsEvent"("commenceTime");

-- CreateIndex
CREATE UNIQUE INDEX "OddsMarket_bookmakerId_key_key" ON "OddsMarket"("bookmakerId", "key");

-- AddForeignKey
ALTER TABLE "OddsMarket" ADD CONSTRAINT "OddsMarket_bookmakerId_fkey" FOREIGN KEY ("bookmakerId") REFERENCES "OddsBookmaker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
