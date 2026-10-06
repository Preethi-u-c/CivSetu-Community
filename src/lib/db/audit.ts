import { getPool, ensurePostgresTables, isPostgresConfigured } from "./postgres";

export interface AuditLogRecord {
  id: number;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetType: "COMPLAINT" | "NOTICE" | "CITIZEN" | "WARD" | "SYSTEM";
  targetId?: string | null;
  oldState?: Record<string, unknown> | null;
  newState?: Record<string, unknown> | null;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface CreateAuditLogParams {
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetType: "COMPLAINT" | "NOTICE" | "CITIZEN" | "WARD" | "SYSTEM";
  targetId?: string | null;
  oldState?: Record<string, unknown> | null;
  newState?: Record<string, unknown> | null;
  details?: string | null;
  ipAddress?: string | null;
}

export interface ListAuditLogsOptions {
  limit?: number;
  offset?: number;
  actorId?: string;
  targetId?: string;
  action?: string;
  targetType?: string;
}

function mapAuditRow(row: Record<string, unknown>): AuditLogRecord {
  const toIso = (val: unknown) => (val instanceof Date ? val.toISOString() : String(val));
  return {
    id: Number(row.id),
    actorId: row.actor_id as string,
    actorName: row.actor_name as string,
    actorRole: row.actor_role as string,
    action: row.action as string,
    targetType: row.target_type as "COMPLAINT" | "NOTICE" | "CITIZEN" | "WARD" | "SYSTEM",
    targetId: (row.target_id as string) || null,
    oldState: (row.old_state as Record<string, unknown>) || null,
    newState: (row.new_state as Record<string, unknown>) || null,
    details: (row.details as string) || null,
    ipAddress: (row.ip_address as string) || null,
    createdAt: toIso(row.created_at),
  };
}

export const auditDb = {
  /**
   * Records an immutable audit log entry in PostgreSQL
   */
  async create(params: CreateAuditLogParams): Promise<AuditLogRecord> {
    await ensurePostgresTables();
    const pool = getPool();

    const sql = `
      INSERT INTO audit_logs (
        actor_id, actor_name, actor_role, action, target_type, target_id,
        old_state, new_state, details, ip_address, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
      RETURNING *;
    `;

    const res = await pool.query(sql, [
      params.actorId,
      params.actorName,
      params.actorRole,
      params.action,
      params.targetType,
      params.targetId || null,
      params.oldState ? JSON.stringify(params.oldState) : null,
      params.newState ? JSON.stringify(params.newState) : null,
      params.details || null,
      params.ipAddress || null,
    ]);

    return mapAuditRow(res.rows[0]);
  },

  /**
   * Retrieves audit logs with filtering and pagination
   */
  async list(options?: ListAuditLogsOptions): Promise<{ logs: AuditLogRecord[]; total: number }> {
    await ensurePostgresTables();
    const pool = getPool();

    const limit = Math.min(Math.max(Number(options?.limit) || 25, 1), 100);
    const offset = Math.max(Number(options?.offset) || 0, 0);

    const conditions: string[] = ["1=1"];
    const params: unknown[] = [];
    let pIdx = 1;

    if (options?.actorId) {
      conditions.push(`actor_id = $${pIdx++}`);
      params.push(options.actorId.trim());
    }

    if (options?.targetId) {
      conditions.push(`target_id = $${pIdx++}`);
      params.push(options.targetId.trim());
    }

    if (options?.action) {
      conditions.push(`action = $${pIdx++}`);
      params.push(options.action.trim());
    }

    if (options?.targetType) {
      conditions.push(`target_type = $${pIdx++}`);
      params.push(options.targetType.trim());
    }

    const whereClause = conditions.join(" AND ");

    // Count
    const countSql = `SELECT COUNT(*) AS total FROM audit_logs WHERE ${whereClause};`;
    const countRes = await pool.query(countSql, params);
    const total = parseInt(countRes.rows[0]?.total || "0", 10);

    // Data
    const dataSql = `
      SELECT * FROM audit_logs
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${pIdx++} OFFSET $${pIdx++};
    `;
    params.push(limit, offset);

    const dataRes = await pool.query(dataSql, params);
    return {
      logs: dataRes.rows.map(mapAuditRow),
      total,
    };
  },
};
