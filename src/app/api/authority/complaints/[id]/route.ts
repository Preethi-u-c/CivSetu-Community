import { NextRequest, NextResponse } from "next/server";
import { authorityService } from "@/lib/services/authorityService";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { complaintDb, ComplaintStatus, AuthorityLevel } from "@/lib/db/complaints";
import { notificationService } from "@/lib/services/notificationService";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/authority/complaints/[id]
 * Retrieves comprehensive complaint details, citizen contact info, and full chronological timeline for municipal officers.
 * Security: Strictly enforces authority authentication.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    if (!isPostgresConfigured()) {
      return NextResponse.json(
        { success: false, error: "Database service is not configured." },
        { status: 503 }
      );
    }

    const authority = await authorityService.getSessionAuthority();
    if (!authority) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Authority credentials required." },
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

    const timeline = await complaintDb.getTimeline(complaintId);

    return NextResponse.json({
      success: true,
      data: {
        ...complaint,
        timeline,
      },
    });
  } catch (error) {
    console.error(`Error in GET /api/authority/complaints/${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while fetching complaint details." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/authority/complaints/[id]
 * Performs official municipal actions on a complaint:
 * - Accept
 * - Assign
 * - Change Status
 * - Add Official Remark
 * - Request Information
 * - Escalate
 * - Resolve
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    if (!isPostgresConfigured()) {
      return NextResponse.json(
        { success: false, error: "Database service is not configured." },
        { status: 503 }
      );
    }

    const authority = await authorityService.getSessionAuthority();
    if (!authority) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Authority credentials required to perform municipal action." },
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

    const body = await req.json().catch(() => ({}));
    const { action, status, assignedAuthority, authorityLevel } = body;
    const note = (body.note || body.notes || "").trim();
    const reason = (body.reason || body.note || body.notes || "").trim();
    const resolutionNotes = (body.resolutionNotes || body.note || body.notes || "").trim();

    const officerSignature = `${authority.fullName} (${authority.designation})`;

    // Safety & Lifecycle: Prevent invalid workflow transitions on resolved/closed complaints
    if ((complaint.status === "Resolved" || complaint.status === "Closed") && action !== "remark") {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid workflow transition: Grievance #${complaintId} is already ${complaint.status}. Official workflow actions are locked.`,
        },
        { status: 400 }
      );
    }

    // Action 1: Accept Complaint
    if (action === "accept") {
      const updated = await complaintDb.updateStatus(complaintId, {
        status: "Under Review",
        note: note || "Grievance accepted for formal verification and field assessment by Lakshmeshwar TMC.",
        updatedBy: officerSignature,
      });

      await notificationService.notifyComplaintAccepted(complaintId, complaint.citizenId, officerSignature);

      return NextResponse.json({
        success: true,
        message: "Grievance accepted successfully.",
        data: updated,
      });
    }

    // Action 2: Assign Department / Authority
    if (action === "assign") {
      if (!assignedAuthority || typeof assignedAuthority !== "string" || !assignedAuthority.trim()) {
        return NextResponse.json(
          { success: false, error: "Target department or authority name is required for assignment." },
          { status: 400 }
        );
      }

      const targetLevel: AuthorityLevel = authorityLevel || complaint.authorityLevel;
      const targetStatus: ComplaintStatus = complaint.status === "Submitted" ? "Assigned" : complaint.status;

      const updated = await complaintDb.updateStatus(complaintId, {
        status: targetStatus,
        assignedAuthority: assignedAuthority.trim(),
        authorityLevel: targetLevel,
        note: note || `Assigned to ${assignedAuthority.trim()} by ${officerSignature}.`,
        updatedBy: officerSignature,
      });

      await notificationService.notifyComplaintAssigned(complaintId, assignedAuthority.trim(), complaint.citizenId);

      return NextResponse.json({
        success: true,
        message: `Grievance successfully assigned to ${assignedAuthority.trim()}.`,
        data: updated,
      });
    }

    // Action 3: Change Status
    if (action === "status") {
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

      if (!status || !validStatuses.includes(status as ComplaintStatus)) {
        return NextResponse.json(
          { success: false, error: `Invalid status. Valid values: ${validStatuses.join(", ")}` },
          { status: 400 }
        );
      }

      const updated = await complaintDb.updateStatus(complaintId, {
        status: status as ComplaintStatus,
        note: note || `Status updated to "${status}" by ${officerSignature}.`,
        updatedBy: officerSignature,
      });

      await notificationService.notifyStatusUpdated(complaintId, status, note, complaint.citizenId);

      return NextResponse.json({
        success: true,
        message: `Status updated to ${status}.`,
        data: updated,
      });
    }

    // Action 4: Add Official Remark
    if (action === "remark") {
      if (!note || typeof note !== "string" || !note.trim()) {
        return NextResponse.json(
          { success: false, error: "Remark text cannot be empty." },
          { status: 400 }
        );
      }

      await complaintDb.addTimelineEvent({
        complaintId,
        status: complaint.status,
        action: "Official Remark Added",
        note: note.trim(),
        updatedBy: officerSignature,
        authorityLevel: complaint.authorityLevel,
        assignedTo: complaint.assignedAuthority,
      });

      await notificationService.notifyRemarkAdded(complaintId, note.trim(), officerSignature, complaint.citizenId);

      const refreshed = await complaintDb.getById(complaintId);
      const timeline = await complaintDb.getTimeline(complaintId);

      return NextResponse.json({
        success: true,
        message: "Official remark recorded successfully.",
        data: {
          ...refreshed,
          timeline,
        },
      });
    }

    // Action 5: Request Clarifying Information
    if (action === "request_info") {
      if (!note || typeof note !== "string" || !note.trim()) {
        return NextResponse.json(
          { success: false, error: "Please specify the clarification needed from the citizen." },
          { status: 400 }
        );
      }

      await complaintDb.addTimelineEvent({
        complaintId,
        status: complaint.status,
        action: "Clarification Requested",
        note: note.trim(),
        updatedBy: officerSignature,
        authorityLevel: complaint.authorityLevel,
        assignedTo: complaint.assignedAuthority,
      });

      return NextResponse.json({
        success: true,
        message: "Clarification request logged in grievance history.",
      });
    }

    // Action 6: Escalate Complaint
    if (action === "escalate") {
      if (!reason || typeof reason !== "string" || !reason.trim()) {
        return NextResponse.json(
          { success: false, error: "Escalation reason is required." },
          { status: 400 }
        );
      }

      const updated = await complaintDb.escalateComplaint(complaintId, reason.trim(), officerSignature);

      await notificationService.notifyComplaintEscalated(
        complaintId,
        updated.authorityLevel,
        updated.assignedAuthority,
        reason.trim(),
        complaint.citizenId
      );

      return NextResponse.json({
        success: true,
        message: `Complaint escalated to ${updated.authorityLevel} (${updated.assignedAuthority}).`,
        data: updated,
      });
    }

    // Action 7: Resolve Complaint
    if (action === "resolve") {
      const cleanNotes = (resolutionNotes || note || "").toString().trim();
      if (!cleanNotes || cleanNotes.length < 5) {
        return NextResponse.json(
          { success: false, error: "Detailed resolution notes (minimum 5 characters) are required to resolve a complaint." },
          { status: 400 }
        );
      }

      const updated = await complaintDb.updateStatus(complaintId, {
        status: "Resolved",
        resolutionNotes: cleanNotes,
        note: `Grievance resolved: ${cleanNotes}`,
        updatedBy: officerSignature,
      });

      await notificationService.notifyComplaintResolved(complaintId, cleanNotes, complaint.citizenId);

      return NextResponse.json({
        success: true,
        message: "Grievance marked as Resolved successfully.",
        data: updated,
      });
    }

    return NextResponse.json(
      { success: false, error: `Unrecognized action "${action}". Valid actions: accept, assign, status, remark, request_info, escalate, resolve.` },
      { status: 400 }
    );
  } catch (error) {
    console.error(`Error in PATCH /api/authority/complaints/${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
