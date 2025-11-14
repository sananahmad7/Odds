// app/api/odds-sync/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId"); // string | null

  if (!eventId) {
    return NextResponse.json(
      { error: "Missing 'eventId' query parameter" },
      { status: 400 }
    );
  }

  // here TypeScript knows eventId is string
  const events = await prisma.oddsEvent.findMany({
    where: { id: eventId },
    include: {
      eventpredictions: true,
    },
    orderBy: { commenceTime: "asc" },
  });

  return NextResponse.json(events);
}
