// app/api/admin/odds-events/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const events = await prisma.oddsEvent.findMany({
      orderBy: { commenceTime: "asc" },
      select: {
        id: true,
        sportKey: true,
        sportTitle: true,
        commenceTime: true,
        homeTeam: true,
        awayTeam: true,
        image: true,
      },
    });

    return NextResponse.json(events);
  } catch (err) {
    console.error("[GET /api/admin/odds-events]", err);
    return NextResponse.json(
      { error: "Failed to load odds events" },
      { status: 500 }
    );
  }
}
