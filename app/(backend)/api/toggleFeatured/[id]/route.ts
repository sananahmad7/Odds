// app/api/toggleFeatured/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Next.js 16: params is a Promise
export async function PUT(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;              // 👈 await params
    const idNum = Number(id);
    if (!Number.isInteger(idNum)) {
      return NextResponse.json(
        { error: "Invalid id. Expected integer." },
        { status: 400 }
      );
    }

    // Read current state
    const existing = await prisma.article.findUnique({
      where: { id: idNum },
      select: { id: true, isFeatured: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Enforce max 9 featured when turning ON
    if (!existing.isFeatured) {
      const totalFeatured = await prisma.article.count({
        where: { isFeatured: true },
      });
      if (totalFeatured >= 3) {
        return NextResponse.json(
          { error: "Maximum of 3 featured blogs allowed" },
          { status: 400 }
        );
      }
    }

    // Toggle
    const updated = await prisma.article.update({
      where: { id: idNum },
      data: { isFeatured: !existing.isFeatured },
      select: { id: true, isFeatured: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/toggleFeatured/[id] failed:", err);
    return NextResponse.json(
      { error: "Failed to update featured status" },
      { status: 500 }
    );
  }
}
