import { NextResponse } from "next/server";
import { authorityService } from "@/lib/services/authorityService";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await authorityService.destroySession();
    return NextResponse.json({
      success: true,
      message: "Authority session invalidated successfully.",
    });
  } catch (error) {
    console.error("Error in /api/authority/auth/logout:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during authority logout." },
      { status: 500 }
    );
  }
}
