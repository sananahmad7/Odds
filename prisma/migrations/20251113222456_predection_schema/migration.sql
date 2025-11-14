-- CreateTable
CREATE TABLE "Eventprediction" (
    "id" SERIAL NOT NULL,
    "heading" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "oddsEventId" TEXT NOT NULL,

    CONSTRAINT "Eventprediction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Eventprediction" ADD CONSTRAINT "Eventprediction_oddsEventId_fkey" FOREIGN KEY ("oddsEventId") REFERENCES "OddsEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
