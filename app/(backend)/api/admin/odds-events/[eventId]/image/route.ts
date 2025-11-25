// app/(backend)/api/admin/odds-events/[eventId]/image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

export async function PUT(req: NextRequest, { params }: RouteContext) {
  // ✅ In Next 16, params is a Promise – you MUST await it
  const { eventId } = await params;

  if (!eventId) {
    return NextResponse.json(
      { error: "Missing or invalid eventId in URL" },
      { status: 400 }
    );
  }

  try {
    console.log(`PUT /api/admin/odds-events/${eventId}/image reached`);

    // 1) Parse body and get the Cloudinary URL
    const body = (await req.json().catch(() => null)) as {
      image?: string;
    } | null;

    const image = body?.image;

    // 2) Validate the 'image' field
    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { error: "Field 'image' (Cloudinary URL) is required" },
        { status: 400 }
      );
    }

    // 3) Update ONLY the image column for this OddsEvent
    const updatedEvent = await prisma.oddsEvent.update({
      where: { id: eventId },
      data: {
        image, // just store the URL string
      },
      select: {
        id: true,
        image: true,
      },
    });

    console.log(
      `Updated OddsEvent ${updatedEvent.id} with image ${updatedEvent.image}`
    );

    // 4) Return the updated id + image
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error(
      `[PUT] /api/admin/odds-events/${eventId}/image failed:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to save image URL for this event" },
      { status: 500 }
    );
  }
}
