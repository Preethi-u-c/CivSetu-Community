import { NextResponse } from "next/server";
import { wardsData } from "@/data/wards";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    count: wardsData.length,
    data: wardsData,
  });
}
