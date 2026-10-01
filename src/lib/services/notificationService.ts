import { notificationDb } from "@/lib/db/authority";

export type ComplaintEventType =
  | "COMPLAINT_REGISTERED"
  | "COMPLAINT_ACCEPTED"
  | "STATUS_UPDATED"
  | "ASSIGNED"
  | "ESCALATED"
  | "RESOLVED"
  | "REMARK_ADDED"
  | "INFO_REQUESTED"
  | "SLA_WARNING"
  | "NOTICE_PUBLISHED";

export interface DispatchNotificationParams {
  eventType: ComplaintEventType;
  complaintId?: string | null;
  citizenId?: string | null;
  authorityId?: string | null;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export const notificationService = {
  /**
   * Dispatches a civic event across active notification channels (in-app, and prepared for future SMS/WhatsApp).
   * Persists event in PostgreSQL notifications table and logs telemetry.
   */
  async dispatch(params: DispatchNotificationParams): Promise<void> {
    try {
      // 1. In-App Notification Record
      await notificationDb.createNotification({
        eventType: params.eventType,
        complaintId: params.complaintId,
        citizenId: params.citizenId,
        authorityId: params.authorityId,
        title: params.title,
        message: params.message,
        channel: "in_app",
      });

      // 2. Structured event logger (Foundation for future SMS/WhatsApp gateway)
      console.log(
        `[NOTIFICATION DISPATCH] Event: ${params.eventType} | Complaint: ${params.complaintId} | Title: "${params.title}"`
      );

      // 3. Extensible integration hooks for SMS / WhatsApp / FCM (configured when credentials are provided)
      if (process.env.SMS_GATEWAY_URL) {
        // Future CDAC / NIC / Twilio gateway integration point
      }
      if (process.env.WHATSAPP_API_URL) {
        // Future WhatsApp Business API integration point
      }
    } catch (err) {
      console.error("Warning: Failed to dispatch notification event:", err);
    }
  },

  /**
   * Helper for Complaint Accepted event
   */
  async notifyComplaintAccepted(complaintId: string, citizenId?: string, officerName?: string): Promise<void> {
    await this.dispatch({
      eventType: "COMPLAINT_ACCEPTED",
      complaintId,
      citizenId,
      title: "Grievance Formally Accepted",
      message: `Your complaint #${complaintId} has been accepted for formal verification by ${officerName || "Lakshmeshwar TMC"}.`,
    });
  },

  /**
   * Helper for Complaint Assigned event
   */
  async notifyComplaintAssigned(complaintId: string, department: string, citizenId?: string): Promise<void> {
    await this.dispatch({
      eventType: "ASSIGNED",
      complaintId,
      citizenId,
      title: "Grievance Assigned to Department",
      message: `Complaint #${complaintId} has been assigned to ${department} for on-site inspection and execution.`,
    });
  },

  /**
   * Helper for Status Updated event
   */
  async notifyStatusUpdated(complaintId: string, status: string, note?: string, citizenId?: string): Promise<void> {
    await this.dispatch({
      eventType: "STATUS_UPDATED",
      complaintId,
      citizenId,
      title: `Grievance Status: ${status}`,
      message: `Status of #${complaintId} changed to "${status}". ${note ? `Remarks: "${note}"` : ""}`,
    });
  },

  /**
   * Helper for Escalation event
   */
  async notifyComplaintEscalated(complaintId: string, targetLevel: string, targetAuthority: string, reason?: string, citizenId?: string): Promise<void> {
    await this.dispatch({
      eventType: "ESCALATED",
      complaintId,
      citizenId,
      title: `Grievance Escalated to ${targetLevel}`,
      message: `Complaint #${complaintId} has been escalated to ${targetLevel} (${targetAuthority}). Reason: ${reason || "Resolution deadline reached"}.`,
    });
  },

  /**
   * Helper for Resolution event
   */
  async notifyComplaintResolved(complaintId: string, notes: string, citizenId?: string): Promise<void> {
    await this.dispatch({
      eventType: "RESOLVED",
      complaintId,
      citizenId,
      title: "Grievance Resolved",
      message: `Complaint #${complaintId} has been marked as Resolved by Lakshmeshwar TMC. Resolution details: ${notes}`,
    });
  },

  /**
   * Helper for Official Remark Added
   */
  async notifyRemarkAdded(complaintId: string, remark: string, officerName: string, citizenId?: string): Promise<void> {
    await this.dispatch({
      eventType: "REMARK_ADDED",
      complaintId,
      citizenId,
      title: "New Official Remark Added",
      message: `${officerName} added an official update on complaint #${complaintId}: "${remark}"`,
    });
  },

  /**
   * Helper for Complaint Registered event
   */
  async notifyComplaintRegistered(complaintId: string, category: string, ward: string, citizenId?: string): Promise<void> {
    await this.dispatch({
      eventType: "COMPLAINT_REGISTERED",
      complaintId,
      citizenId,
      title: "New Grievance Registered",
      message: `Grievance #${complaintId} (${category}) lodged in ${ward}. Assigned for departmental assessment.`,
    });
  },

  /**
   * Helper for Near SLA Deadline Warning
   */
  async notifyNearSlaWarning(complaintId: string, hoursRemaining: number, category: string, ward: string): Promise<void> {
    await this.dispatch({
      eventType: "SLA_WARNING",
      complaintId,
      title: `Critical SLA Alert: #${complaintId}`,
      message: `Complaint #${complaintId} (${category}, ${ward}) has only ${hoursRemaining}h remaining before statutory SLA deadline.`,
    });
  },

  /**
   * Helper for Official Gazette Notice Published
   */
  async notifyNoticePublished(noticeId: string, title: string, category: string, officerName: string): Promise<void> {
    await this.dispatch({
      eventType: "NOTICE_PUBLISHED",
      complaintId: null,
      title: `Gazette Published: ${title}`,
      message: `Official circular "${title}" (${category}) published by ${officerName}.`,
    });
  },
};
