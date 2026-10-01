import { NextResponse } from "next/server";
import { authorityService } from "@/lib/services/authorityService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authority = await authorityService.getSessionAuthority();
    if (!authority) {
      return NextResponse.json(
        { success: false, authenticated: false, authority: null },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      authority,
    });
  } catch (error) {
    console.error("Error in /api/authority/auth/me:", error);
    return NextResponse.json(
      { success: false, authenticated: false, authority: null },
      { status: 500 }
    );
  }
}
