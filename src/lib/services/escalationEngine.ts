import { getPool, ensurePostgresTables } from "@/lib/db/postgres";
import { complaintDb, AUTHORITY_WORKFLOW, AuthorityLevel } from "@/lib/db/complaints";
import { notificationService } from "@/lib/services/notificationService";

export interface AutoEscalationResult {
  checkedCount: number;
  escalatedCount: number;
  warningsCount: number;
  escalatedIds: string[];
  warningIds: string[];
  errors: string[];
}

/**
 * Core engine for automated SLA deadline checks and ticket escalation.
 * Requirement 4: Escalation must be automated and notified both to citizen & authority by the system.
 */
export async function runAutoEscalationCheck(): Promise<AutoEscalationResult> {
  await ensurePostgresTables();
  const pool = getPool();

  const result: AutoEscalationResult = {
    checkedCount: 0,
    escalatedCount: 0,
    warningsCount: 0,
    escalatedIds: [],
    warningIds: [],
    errors: [],
  };

  try {
    // 1. Verify if auto-escalation is enabled in system settings
    const settingRes = await pool.query(
      "SELECT value FROM system_settings WHERE key = 'auto_escalation_enabled' LIMIT 1;"
    );
    const isAutoEscalationEnabled = settingRes.rows[0]?.value !== "false";

    if (!isAutoEscalationEnabled) {
      return result;
    }

    // 2. Query overdue complaints eligible for escalation
    // Eligible: not Resolved, not Closed, deadline has passed, and hasn't reached apex tier (District Administration)
    const overdueSql = `
      SELECT id, authority_level, assigned_authority, citizen_id, deadline, title, category
      FROM complaints
      WHERE status NOT IN ('Resolved', 'Closed')
        AND authority_level != 'District Administration'
        AND deadline < CURRENT_TIMESTAMP
      ORDER BY deadline ASC
      LIMIT 100;
    `;
    const overdueRes = await pool.query(overdueSql);
    result.checkedCount = overdueRes.rows.length;

    for (const row of overdueRes.rows) {
      const complaintId = row.id as string;
      const currentLevel = row.authority_level as AuthorityLevel;
      const workflowConfig = AUTHORITY_WORKFLOW[currentLevel];

      if (!workflowConfig || !workflowConfig.nextLevel) {
        continue;
      }

      const nextLevel = workflowConfig.nextLevel;
      const nextAuthority = workflowConfig.defaultAuthority;
      const reason = `Automated SLA deadline breach: statutory resolution window elapsed for ${currentLevel}. Escalated automatically by CivSetu System.`;

      try {
        // Escalate ticket in DB
        const updated = await complaintDb.updateStatus(complaintId, {
          status: "Escalated",
          authorityLevel: nextLevel,
          assignedAuthority: nextAuthority,
          escalationReason: reason,
          note: `[System Auto-Escalation] ${reason}`,
          updatedBy: "CivSetu Automated SLA Engine",
        });

        // Dual notification: Notify Citizen (in-app + email)
        await notificationService.notifyComplaintEscalated(
          complaintId,
          nextLevel,
          nextAuthority,
          reason,
          row.citizen_id as string
        );

        // Dual notification: Notify Authority Officer (in-app for authority portal)
        try {
          await notificationService.dispatch({
            eventType: "ESCALATED",
            complaintId,
            citizenId: null,
            title: `[ACTION REQUIRED] Overdue Grievance Escalated to ${nextLevel}`,
            message: `Grievance #${complaintId} ("${row.title}") breached SLA deadline at ${currentLevel} and was auto-escalated to ${nextAuthority}. Immediate action required.`,
          });
        } catch (authNotifErr) {
          console.error("Warning: Failed to create authority in-app notification:", authNotifErr);
        }

        result.escalatedCount++;
        result.escalatedIds.push(complaintId);
      } catch (escErr: any) {
        console.error(`Error auto-escalating complaint ${complaintId}:`, escErr);
        result.errors.push(`Complaint ${complaintId}: ${escErr.message}`);
      }
    }

    // 3. Near-deadline warnings (within 24 hours)
    const warningSql = `
      SELECT id, citizen_id, title, category, ward, deadline
      FROM complaints
      WHERE status NOT IN ('Resolved', 'Closed', 'Escalated')
        AND deadline > CURRENT_TIMESTAMP
        AND deadline <= (CURRENT_TIMESTAMP + INTERVAL '24 hours')
      LIMIT 50;
    `;
    const warningRes = await pool.query(warningSql);
    for (const wRow of warningRes.rows) {
      const hoursLeft = Math.max(
        1,
        Math.round((new Date(wRow.deadline).getTime() - Date.now()) / (1000 * 60 * 60))
      );
      try {
        await notificationService.notifyNearSlaWarning(
          wRow.id,
          hoursLeft,
          wRow.category || "General Grievance",
          wRow.ward || "All Wards"
        );
        result.warningsCount++;
        result.warningIds.push(wRow.id);
      } catch {
        // Suppress warning duplicate alerts
      }
    }
  } catch (error: any) {
    console.error("Fatal error during auto-escalation check:", error);
    result.errors.push(error.message);
  }

  return result;
}
