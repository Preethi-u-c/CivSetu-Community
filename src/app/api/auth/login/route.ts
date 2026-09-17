import { NextRequest, NextResponse } from "next/server";
import { citizenDb, isPostgresConfigured } from "@/lib/db/postgres";
import { authService, toSafeCitizen } from "@/lib/services/authService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (!isPostgresConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "PostgreSQL database is not configured. Please define DATABASE_URL in your .env.local file.",
        },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: "Please provide your mobile number/email and password." },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.toString().trim();

    // Look up citizen by mobile number or email
    const citizen = await citizenDb.findByIdentifier(cleanIdentifier);
    if (!citizen) {
      // Use uniform error message to prevent account enumeration
      return NextResponse.json(
        { success: false, error: "Invalid credentials. Please verify and try again." },
        { status: 401 }
      );
    }

    // Compare password with stored bcrypt hash
    const isPasswordValid = await authService.verifyPassword(password, citizen.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials. Please verify and try again." },
        { status: 401 }
      );
    }

    // Create session in PostgreSQL and set HTTP-only cookie
    await authService.createSession(citizen.id);

    return NextResponse.json({
      success: true,
      message: "Authentication successful.",
      data: toSafeCitizen(citizen),
    });
  } catch (error) {
    console.error("Error in /api/auth/login:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
