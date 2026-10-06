import { auditDb, CreateAuditLogParams, AuditLogRecord, ListAuditLogsOptions } from "@/lib/db/audit";
import { isPostgresConfigured } from "@/lib/db/postgres";

export const auditService = {
  /**
   * Records an audit log entry safely without interrupting primary workflow
   */
  async log(params: CreateAuditLogParams): Promise<AuditLogRecord | null> {
    if (!isPostgresConfigured()) {
      console.log(
        `[AUDIT LOG - SIMULATION] Actor: ${params.actorName} (${params.actorRole}) | Action: ${params.action} | Target: ${params.targetType} #${params.targetId}`
      );
      return null;
    }

    try {
      const record = await auditDb.create(params);
      console.log(
        `[AUDIT LOG - SAVED] ID: ${record.id} | Actor: ${record.actorName} | Action: ${record.action} | Target: ${record.targetType} #${record.targetId}`
      );
      return record;
    } catch (err) {
      console.error("Warning: Failed to record audit log entry:", err);
      return null;
    }
  },

  /**
   * Helper for auditing complaint workflow actions (Accept, Assign, Escalate, Resolve, Status Change)
   */
  async logComplaintAction(params: {
    actorId: string;
    actorName: string;
    actorRole: string;
    action: string;
    complaintId: string;
    oldState?: { status?: string; assignedAuthority?: string; authorityLevel?: string };
    newState?: { status?: string; assignedAuthority?: string; authorityLevel?: string; resolutionNotes?: string };
    details?: string;
    ipAddress?: string;
  }): Promise<AuditLogRecord | null> {
    return this.log({
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      action: params.action,
      targetType: "COMPLAINT",
      targetId: params.complaintId,
      oldState: params.oldState,
      newState: params.newState,
      details: params.details,
      ipAddress: params.ipAddress,
    });
  },

  /**
   * Helper for auditing notice & emergency publication
   */
  async logNoticeAction(params: {
    actorId: string;
    actorName: string;
    actorRole: string;
    action: string;
    noticeId: string;
    details?: string;
    ipAddress?: string;
  }): Promise<AuditLogRecord | null> {
    return this.log({
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      action: params.action,
      targetType: "NOTICE",
      targetId: params.noticeId,
      details: params.details,
      ipAddress: params.ipAddress,
    });
  },

  /**
   * Lists audit logs
   */
  async listLogs(options?: ListAuditLogsOptions) {
    if (!isPostgresConfigured()) {
      return { logs: [], total: 0 };
    }
    return auditDb.list(options);
  },
};
