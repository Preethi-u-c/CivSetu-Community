import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/storage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    const result = await db.stats.recordVisit(ip);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Failed to record visit:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record visit" },
      { status: 500 }
    );
  }
}
