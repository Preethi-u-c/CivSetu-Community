import { NextRequest, NextResponse } from "next/server";
import { citizenDb, isPostgresConfigured } from "@/lib/db/postgres";
import { authService, toSafeCitizen } from "@/lib/services/authService";
import { otpService } from "@/lib/services/otpService";

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
    const {
      fullName,
      mobileNumber,
      email,
      password,
      confirmPassword,
      wardNumber,
      residentialAddress,
      otp,
    } = body;

    // 1. Validate required fields
    if (!fullName || !mobileNumber || !email || !password || !wardNumber || !residentialAddress) {
      return NextResponse.json(
        { success: false, error: "All registration fields are required." },
        { status: 400 }
      );
    }

    // 2. Validate Full Name
    const cleanName = fullName.toString().trim();
    if (cleanName.length < 3) {
      return NextResponse.json(
        { success: false, error: "Full name must be at least 3 characters." },
        { status: 400 }
      );
    }

    // 3. Validate Mobile
    const cleanMobile = mobileNumber.toString().replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    // 4. Validate Email
    const cleanEmail = email.toString().trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // 5. Validate Password & Confirmation
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }
    if (confirmPassword && confirmPassword !== password) {
      return NextResponse.json(
        { success: false, error: "Password and confirmation do not match." },
        { status: 400 }
      );
    }

    // 6. Validate Ward / Locality
    const cleanWard = wardNumber.toString().trim();
    if (!cleanWard) {
      return NextResponse.json(
        { success: false, error: "Ward / Locality selection is required." },
        { status: 400 }
      );
    }

    // 7. Validate Residential Address
    const cleanAddress = residentialAddress.toString().trim();
    if (cleanAddress.length < 8) {
      return NextResponse.json(
        { success: false, error: "Please provide a complete residential address." },
        { status: 400 }
      );
    }

    // 8. Server-side OTP Verification
    let otpVerified = await otpService.hasVerifiedOtp(cleanMobile, "registration");
    if (!otpVerified && otp) {
      const verifyRes = await otpService.verifyOtp(cleanMobile, otp.toString(), "registration");
      if (verifyRes.success) {
        otpVerified = true;
      }
    }

    if (!otpVerified) {
      return NextResponse.json(
        {
          success: false,
          error: "Mobile number verification via OTP is required before registration.",
        },
        { status: 400 }
      );
    }

    // 9. Check for duplicate mobile number
    const existingMobile = await citizenDb.findByMobile(cleanMobile);
    if (existingMobile) {
      return NextResponse.json(
        {
          success: false,
          error: "This mobile number is already registered. Please proceed to Login.",
        },
        { status: 409 }
      );
    }

    // 10. Check for duplicate email
    const existingEmail = await citizenDb.findByEmail(cleanEmail);
    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "This email address is already registered. Please use a different email or log in.",
        },
        { status: 409 }
      );
    }

    // 11. Hash Password securely
    const passwordHash = await authService.hashPassword(password);

    // 12. Create Citizen in PostgreSQL
    const newCitizen = await citizenDb.createCitizen({
      fullName: cleanName,
      mobileNumber: cleanMobile,
      email: cleanEmail,
      passwordHash,
      wardNumber: cleanWard,
      residentialAddress: cleanAddress,
    });

    // 13. Consume the verified OTP
    await otpService.consumeVerifiedOtp(cleanMobile, "registration");

    // 14. Create session and set HTTP-only cookie
    await authService.createSession(newCitizen.id);

    return NextResponse.json({
      success: true,
      message: "Citizen account registered successfully.",
      data: toSafeCitizen(newCitizen),
    });
  } catch (error) {
    console.error("Error in /api/auth/register:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during citizen registration." },
      { status: 500 }
    );
  }
}
