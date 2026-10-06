import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { enforceRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import { auditDb } from "@/lib/db/audit";

export const dynamic = "force-dynamic";

interface LockoutData {
  count: number;
  lockedUntil: number | null;
}

// In-memory store for consecutive failed attempts
const failedAttemptsMap = new Map<string, LockoutData>();
const MAX_FAILURES = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(req: NextRequest) {
  try {
    const rateLimit = enforceRateLimit(req, "auth");
    if (!rateLimit.isAllowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    if (!isPostgresConfigured()) {
      return NextResponse.json(
        { success: false, error: "Database service is not configured." },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const identifier = (body.identifier || body.username || body.email || body.usernameOrEmail || "").trim();
    const password = body.password || "";

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: "Administrator username/email and password are required." },
        { status: 400 }
      );
    }

    const ipAddress = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "Unknown";

    const lockoutKey = identifier.toLowerCase();
    const lockoutData = failedAttemptsMap.get(lockoutKey) || { count: 0, lockedUntil: null };

    if (lockoutData.lockedUntil && Date.now() < lockoutData.lockedUntil) {
      return NextResponse.json(
        { success: false, error: "Account temporarily locked. Try again in 15 minutes." },
        { status: 429 }
      );
    }

    const result = await adminService.login(identifier, password);
    
    if (!result.success || !result.admin) {
      lockoutData.count += 1;
      if (lockoutData.count >= MAX_FAILURES) {
        lockoutData.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      }
      failedAttemptsMap.set(lockoutKey, lockoutData);

      await auditDb.create({
        actorId: "system",
        actorName: "System",
        actorRole: "System",
        action: "ADMIN_LOGIN_FAILURE",
        targetType: "SYSTEM",
        details: `Failed admin login attempt for identifier: ${identifier}. User-Agent: ${userAgent}`,
        ipAddress,
      }).catch(console.error);

      if (lockoutData.lockedUntil && Date.now() < lockoutData.lockedUntil) {
        return NextResponse.json(
          { success: false, error: "Account temporarily locked. Try again in 15 minutes." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { success: false, error: result.error || "Authentication failed. Invalid administrator credentials." },
        { status: 401 }
      );
    }

    failedAttemptsMap.delete(lockoutKey);

    await auditDb.create({
      actorId: result.admin.id,
      actorName: result.admin.fullName,
      actorRole: "Admin",
      action: "ADMIN_LOGIN_SUCCESS",
      targetType: "SYSTEM",
      details: `Successful admin login. User-Agent: ${userAgent}`,
      ipAddress,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      message: "Administrator authentication successful.",
      data: result.admin,
      admin: result.admin,
    });
  } catch (error) {
    console.error("Error in /api/admin/auth/login:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during admin login." },
      { status: 500 }
    );
  }
}
