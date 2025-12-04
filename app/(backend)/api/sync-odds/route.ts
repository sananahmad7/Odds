// app/api/odds-sync/route.ts
import { NextRequest, NextResponse } from "next/server";

import { handleSyncOdds } from "@/utils/sync-odds";
import { prisma } from "@/lib/prisma";

// -----------------------------
// Route
// -----------------------------
export async function POST() {
  // prune: true => will delete events whose commenceTime is crossed
  const result = await handleSyncOdds({ prune: true });
  const status = result.success ? 200 : 500;
  return NextResponse.json(result, { status });
}

export async function PUT(req: NextRequest) {
  // 1. Get id from query string
  const eventId = req.nextUrl.searchParams.get("id");
  const { image } = await req.json();

  if (!eventId) {
    return NextResponse.json(
      { error: "Missing event id in query (?id=...)" },
      { status: 400 }
    );
  }

  try {
    const updatedEvent = await prisma.oddsEvent.update({
      data: { image },
      where: { id: eventId },
    });

    return NextResponse.json(updatedEvent);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Error in update hero image, error: ${err}` },
      { status: 500 }
    );
  }
}
