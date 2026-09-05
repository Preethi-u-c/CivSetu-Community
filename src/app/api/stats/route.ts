import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = db.stats.getStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve statistics" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Extract IP safely from headers
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
