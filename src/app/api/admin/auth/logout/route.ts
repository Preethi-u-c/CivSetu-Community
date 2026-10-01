import { NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await adminService.destroySession();
    return NextResponse.json({
      success: true,
      message: "Administrator session terminated successfully.",
    });
  } catch (error) {
    console.error("Error in /api/admin/auth/logout:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during logout." },
      { status: 500 }
    );
  }
}
