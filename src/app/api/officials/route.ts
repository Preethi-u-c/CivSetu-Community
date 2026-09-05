import { NextResponse } from "next/server";
import { officials } from "@/data/officials";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    count: officials.length,
    data: officials,
  });
}
