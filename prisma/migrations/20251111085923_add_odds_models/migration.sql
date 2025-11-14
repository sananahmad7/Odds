-- CreateTable
CREATE TABLE "OddsEvent" (
    "id" TEXT NOT NULL,
    "sport_key" TEXT NOT NULL,
    "sport_title" TEXT NOT NULL,
    "commence_time" TEXT NOT NULL,
    "home_team" TEXT NOT NULL,
    "away_team" TEXT NOT NULL,

    CONSTRAINT "OddsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OddsBookmaker" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "last_update" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "OddsBookmaker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OddsMarket" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "last_update" TEXT NOT NULL,
    "oddsBookmakerId" TEXT NOT NULL,

    CONSTRAINT "OddsMarket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OddsOutcome" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "point" DOUBLE PRECISION,

    CONSTRAINT "OddsOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OddsOutcome_marketId_name_key" ON "OddsOutcome"("marketId", "name");

-- AddForeignKey
ALTER TABLE "OddsBookmaker" ADD CONSTRAINT "OddsBookmaker_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "OddsEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OddsMarket" ADD CONSTRAINT "OddsMarket_oddsBookmakerId_fkey" FOREIGN KEY ("oddsBookmakerId") REFERENCES "OddsBookmaker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OddsOutcome" ADD CONSTRAINT "OddsOutcome_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "OddsMarket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
