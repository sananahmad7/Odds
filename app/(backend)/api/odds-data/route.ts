// app/api/odds-sync/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  // here TypeScript knows eventId is string
  const events = await prisma.oddsEvent.findMany({
    include: {
      bookmakers: {
        include: {
          markets: {
            include: {
              outcomes: true,
            },
          },
        },
      },
    },
    orderBy: { commenceTime: "asc" },
  });

  return NextResponse.json(events);
}
