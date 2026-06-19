import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  console.log("POST HIT");

  try {
    const body = await request.json();
    console.log("BODY:", body);

    const { originalUrl } = body;

    const shortCode = Math.random()
      .toString(36)
      .substring(2, 8);

    console.log("CREATING LINK...");

    const link = await prisma.link.create({
      data: {
        originalUrl,
        shortCode,
      },
    });

    console.log("CREATED:", link);

    return NextResponse.json(link);
  } catch (error) {
    console.error("ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}