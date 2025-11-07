import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = (await req.json()) ?? {};

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Basic validation
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    if (password.length < 8)
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

    //Enforce a maximum of 3 admins
    const adminCount = await prisma.admin.count();
    if (adminCount >= 3) {
      return NextResponse.json({ error: "Signup disabled (max 3 admins reached)" }, { status: 403 });
    }

    // Unique email
    const exists = await prisma.admin.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.admin.create({
      data: {
        email,
        passwordHash,
        name: typeof name === "string" ? name : null,
        role: "ADMIN",
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, admin });
  } catch (err) {
    console.error("POST /api/admin/signup error:", err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
