import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/services/authService";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { complaintDb, ComplaintStatus } from "@/lib/db/complaints";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/complaints/[id]
 * Retrieves a single complaint along with its chronological audit timeline.
 * Security: Verifies that the authenticated citizen owns the requested complaint.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    if (!isPostgresConfigured()) {
      return NextResponse.json(
        { success: false, error: "Database service is not configured." },
        { status: 503 }
      );
    }

    const citizen = await authService.getSessionCitizen();
    if (!citizen) {
      return NextResponse.json(
        { success: false, error: "Authentication required to view complaint details." },
        { status: 401 }
      );
    }

    const complaintId = params.id;
    if (!complaintId) {
      return NextResponse.json(
        { success: false, error: "Complaint ID parameter is required." },
        { status: 400 }
      );
    }

    const complaint = await complaintDb.getById(complaintId);
    if (!complaint) {
      return NextResponse.json(
        { success: false, error: "Complaint not found." },
        { status: 404 }
      );
    }

    // Security Check: Enforce Citizen Ownership
    if (complaint.citizenId !== citizen.id) {
      return NextResponse.json(
        { success: false, error: "Access denied. You are not authorized to view this complaint." },
        { status: 403 }
      );
    }

    const timeline = await complaintDb.getTimeline(complaintId);

    return NextResponse.json({
      success: true,
      data: {
        ...complaint,
        timeline,
      },
    });
  } catch (error) {
    console.error(`Error fetching complaint ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while fetching complaint details." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/complaints/[id]
 * Handles complaint state transitions (reopening by citizen, escalation, or status update).
 * Security: Enforces ownership checks and state validation.
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    if (!isPostgresConfigured()) {
      return NextResponse.json(
        { success: false, error: "Database service is not configured." },
        { status: 503 }
      );
    }

    const citizen = await authService.getSessionCitizen();
    if (!citizen) {
      return NextResponse.json(
        { success: false, error: "Authentication required to modify complaint." },
        { status: 401 }
      );
    }

    const complaintId = params.id;
    const complaint = await complaintDb.getById(complaintId);
    if (!complaint) {
      return NextResponse.json(
        { success: false, error: "Complaint not found." },
        { status: 404 }
      );
    }

    // Security Check: Citizen Ownership
    if (complaint.citizenId !== citizen.id) {
      return NextResponse.json(
        { success: false, error: "Access denied. You cannot modify this complaint." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { action, reason, status, note, resolutionNotes } = body;

    // Action 1: Reopen Complaint
    if (action === "reopen") {
      if (!reason || typeof reason !== "string" || reason.trim().length < 5) {
        return NextResponse.json(
          { success: false, error: "Please provide a valid explanation for reopening (at least 5 characters)." },
          { status: 400 }
        );
      }

      if (complaint.status !== "Resolved" && complaint.status !== "Closed") {
        return NextResponse.json(
          {
            success: false,
            error: `Only Resolved or Closed complaints can be reopened. Current status is ${complaint.status}.`,
          },
          { status: 400 }
        );
      }

      const updated = await complaintDb.reopenComplaint(
        complaintId,
        citizen.id,
        reason.trim(),
        citizen.fullName
      );

      return NextResponse.json({
        success: true,
        message: "Complaint reopened successfully. Assigned authority has been notified.",
        data: updated,
      });
    }

    // Action 2: Escalate Complaint
    if (action === "escalate") {
      if (!reason || typeof reason !== "string" || reason.trim().length < 5) {
        return NextResponse.json(
          { success: false, error: "Please provide a reason for escalation (at least 5 characters)." },
          { status: 400 }
        );
      }

      const updated = await complaintDb.escalateComplaint(
        complaintId,
        reason.trim(),
        citizen.fullName
      );

      return NextResponse.json({
        success: true,
        message: `Complaint escalated successfully to ${updated.authorityLevel} (${updated.assignedAuthority}).`,
        data: updated,
      });
    }

    // Action 3: Status Progression
    const validStatuses: ComplaintStatus[] = [
      "Submitted",
      "Under Review",
      "Assigned",
      "In Progress",
      "Near Deadline",
      "Escalated",
      "Resolved",
      "Reopened",
      "Closed",
    ];

    if (status && validStatuses.includes(status as ComplaintStatus)) {
      const updated = await complaintDb.updateStatus(complaintId, {
        status: status as ComplaintStatus,
        note: note || undefined,
        resolutionNotes: resolutionNotes || undefined,
        updatedBy: citizen.fullName,
      });

      return NextResponse.json({
        success: true,
        message: `Complaint status successfully updated to ${status}.`,
        data: updated,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action or status provided in request body." },
      { status: 400 }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal error updating complaint.";
    console.error(`Error updating complaint ${params.id}:`, errMessage);
    return NextResponse.json(
      { success: false, error: errMessage },
      { status: 400 }
    );
  }
}
