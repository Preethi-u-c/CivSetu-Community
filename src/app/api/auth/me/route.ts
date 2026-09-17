import { NextResponse } from "next/server";
import { authService } from "@/lib/services/authService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const citizen = await authService.getSessionCitizen();
    if (!citizen) {
      return NextResponse.json(
        { success: false, authenticated: false, citizen: null },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      citizen,
    });
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json(
      { success: false, authenticated: false, citizen: null },
      { status: 500 }
    );
  }
}
