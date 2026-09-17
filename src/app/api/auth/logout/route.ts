import { NextResponse } from "next/server";
import { authService } from "@/lib/services/authService";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await authService.destroySession();
    return NextResponse.json({
      success: true,
      message: "Citizen session invalidated successfully.",
    });
  } catch (error) {
    console.error("Error in /api/auth/logout:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during logout." },
      { status: 500 }
    );
  }
}
