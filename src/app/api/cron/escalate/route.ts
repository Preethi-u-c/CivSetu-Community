import { NextRequest, NextResponse } from "next/server";
import { runAutoEscalationCheck } from "@/lib/services/escalationEngine";

export const dynamic = "force-dynamic";

/**
 * Automated SLA Escalation API Endpoint (Requirement 4)
 * Triggers automatically via Vercel Cron or secure background HTTP request.
 * Can be called with GET or POST.
 */
export async function GET(req: NextRequest) {
  return handleEscalation(req);
}

export async function POST(req: NextRequest) {
  return handleEscalation(req);
}

async function handleEscalation(req: NextRequest) {
  // Authorization check if CRON_SECRET is configured
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized cron trigger." },
      { status: 401 }
    );
  }

  try {
    const summary = await runAutoEscalationCheck();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary,
    });
  } catch (error: any) {
    console.error("Cron escalation trigger failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute auto-escalation check." },
      { status: 500 }
    );
  }
}
