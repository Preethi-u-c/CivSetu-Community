import { getPool, ensurePostgresTables, NoticeRecord } from "./postgres";
import crypto from "crypto";

export type { NoticeRecord };

export interface CreateNoticeParams {
  title: string;
  description: string;
  category: string;
  targetScope: "Entire Municipality" | "Specific Wards";
  targetWards?: string | null;
  priority: "Normal" | "High" | "Urgent";
  isEmergency?: boolean;
  status?: "Draft" | "Published" | "Archived";
  publishDate?: string;
  expiryDate?: string | null;
  issuedById?: string | null;
  issuedByName: string;
  issuedByDepartment: string;
}

export interface NoticeFilterOptions {
  status?: string;
  category?: string;
  priority?: string;
  targetScope?: string;
  isEmergency?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface NoticeStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  emergency: number;
}

function mapNoticeRow(row: Record<string, unknown>): NoticeRecord {
  const toIso = (val: unknown): string => {
    if (!val) return "";
    return val instanceof Date ? val.toISOString() : String(val);
  };

  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    category: row.category as string,
    targetScope: row.target_scope as "Entire Municipality" | "Specific Wards",
    targetWards: (row.target_wards as string) || null,
    priority: row.priority as "Normal" | "High" | "Urgent",
    isEmergency: Boolean(row.is_emergency),
    status: row.status as "Draft" | "Published" | "Archived",
    publishDate: toIso(row.publish_date),
    expiryDate: row.expiry_date ? toIso(row.expiry_date) : null,
    issuedById: (row.issued_by_id as string) || null,
    issuedByName: row.issued_by_name as string,
    issuedByDepartment: row.issued_by_department as string,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

export function generateNoticeId(): string {
  const year = new Date().getFullYear();
  const hex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `NOT-LMC-${year}-${hex}`;
}

export const noticeDb = {
  /**
   * Creates a new official municipal notice in PostgreSQL
   */
  async create(params: CreateNoticeParams): Promise<NoticeRecord> {
    await ensurePostgresTables();
    const pool = getPool();

    const id = generateNoticeId();
    const status = params.status || "Published";
    const priority = params.priority || "Normal";
    const targetScope = params.targetScope || "Entire Municipality";
    const isEmergency = Boolean(params.isEmergency);
    const publishDate = params.publishDate ? new Date(params.publishDate) : new Date();
    const expiryDate = params.expiryDate ? new Date(params.expiryDate) : null;

    const sql = `
      INSERT INTO notices (
        id, title, description, category, target_scope, target_wards,
        priority, is_emergency, status, publish_date, expiry_date,
        issued_by_id, issued_by_name, issued_by_department,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13, $14,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *;
    `;

    const values = [
      id,
      params.title.trim(),
      params.description.trim(),
      params.category.trim(),
      targetScope,
      params.targetWards?.trim() || null,
      priority,
      isEmergency,
      status,
      publishDate,
      expiryDate,
      params.issuedById || null,
      params.issuedByName.trim(),
      params.issuedByDepartment.trim(),
    ];

    const res = await pool.query(sql, values);
    return mapNoticeRow(res.rows[0]);
  },

  /**
   * Lists notices with multi-filtering, search, and pagination
   */
  async list(options: NoticeFilterOptions = {}): Promise<{ notices: NoticeRecord[]; total: number }> {
    await ensurePostgresTables();
    const pool = getPool();

    const conditions: string[] = ["1=1"];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (options.status && options.status !== "ALL") {
      conditions.push(`status = $${paramIndex++}`);
      params.push(options.status);
    }

    if (options.category && options.category !== "ALL") {
      conditions.push(`category = $${paramIndex++}`);
      params.push(options.category);
    }

    if (options.priority && options.priority !== "ALL") {
      conditions.push(`priority = $${paramIndex++}`);
      params.push(options.priority);
    }

    if (options.targetScope && options.targetScope !== "ALL") {
      conditions.push(`target_scope = $${paramIndex++}`);
      params.push(options.targetScope);
    }

    if (options.isEmergency !== undefined) {
      conditions.push(`is_emergency = $${paramIndex++}`);
      params.push(options.isEmergency);
    }

    if (options.search && options.search.trim()) {
      conditions.push(
        `(id ILIKE $${paramIndex} OR title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR target_wards ILIKE $${paramIndex} OR issued_by_department ILIKE $${paramIndex})`
      );
      params.push(`%${options.search.trim()}%`);
      paramIndex++;
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const countSql = `SELECT COUNT(*) AS count FROM notices ${whereClause};`;
    const countRes = await pool.query(countSql, params);
    const total = parseInt(countRes.rows[0]?.count || "0", 10);

    const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 100);
    const offset = Math.max(Number(options.offset) || 0, 0);

    const dataSql = `
      SELECT * FROM notices
      ${whereClause}
      ORDER BY
        CASE WHEN is_emergency = true THEN 1 ELSE 2 END ASC,
        publish_date DESC,
        created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;
    params.push(limit, offset);

    const dataRes = await pool.query(dataSql, params);
    return {
      notices: dataRes.rows.map(mapNoticeRow),
      total,
    };
  },

  /**
   * Retrieves a notice by its ID
   */
  async getById(id: string): Promise<NoticeRecord | null> {
    await ensurePostgresTables();
    const pool = getPool();
    const res = await pool.query("SELECT * FROM notices WHERE id = $1 LIMIT 1;", [id.trim()]);
    if (res.rows.length === 0) return null;
    return mapNoticeRow(res.rows[0]);
  },

  /**
   * Updates an existing notice
   */
  async update(id: string, updates: Partial<NoticeRecord>): Promise<NoticeRecord> {
    await ensurePostgresTables();
    const pool = getPool();

    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Notice ${id} not found.`);
    }

    const fields: string[] = [];
    const params: unknown[] = [];
    let pIdx = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${pIdx++}`);
      params.push(updates.title.trim());
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${pIdx++}`);
      params.push(updates.description.trim());
    }
    if (updates.category !== undefined) {
      fields.push(`category = $${pIdx++}`);
      params.push(updates.category.trim());
    }
    if (updates.targetScope !== undefined) {
      fields.push(`target_scope = $${pIdx++}`);
      params.push(updates.targetScope);
    }
    if (updates.targetWards !== undefined) {
      fields.push(`target_wards = $${pIdx++}`);
      params.push(updates.targetWards);
    }
    if (updates.priority !== undefined) {
      fields.push(`priority = $${pIdx++}`);
      params.push(updates.priority);
    }
    if (updates.isEmergency !== undefined) {
      fields.push(`is_emergency = $${pIdx++}`);
      params.push(Boolean(updates.isEmergency));
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${pIdx++}`);
      params.push(updates.status);
    }
    if (updates.publishDate !== undefined) {
      fields.push(`publish_date = $${pIdx++}`);
      params.push(new Date(updates.publishDate));
    }
    if (updates.expiryDate !== undefined) {
      fields.push(`expiry_date = $${pIdx++}`);
      params.push(updates.expiryDate ? new Date(updates.expiryDate) : null);
    }

    fields.push("updated_at = CURRENT_TIMESTAMP");
    params.push(id.trim());

    const sql = `
      UPDATE notices
      SET ${fields.join(", ")}
      WHERE id = $${pIdx}
      RETURNING *;
    `;

    const res = await pool.query(sql, params);
    return mapNoticeRow(res.rows[0]);
  },

  /**
   * Deletes a notice
   */
  async delete(id: string): Promise<boolean> {
    await ensurePostgresTables();
    const pool = getPool();
    const res = await pool.query("DELETE FROM notices WHERE id = $1;", [id.trim()]);
    return (res.rowCount ?? 0) > 0;
  },

  /**
   * Summary counts for notice dashboard
   */
  async getStats(): Promise<NoticeStats> {
    await ensurePostgresTables();
    const pool = getPool();
    const sql = `
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'Published') AS published,
        COUNT(*) FILTER (WHERE status = 'Draft') AS draft,
        COUNT(*) FILTER (WHERE status = 'Archived') AS archived,
        COUNT(*) FILTER (WHERE is_emergency = true) AS emergency
      FROM notices;
    `;
    const res = await pool.query(sql);
    const r = res.rows[0];
    return {
      total: parseInt(r?.total || "0", 10),
      published: parseInt(r?.published || "0", 10),
      draft: parseInt(r?.draft || "0", 10),
      archived: parseInt(r?.archived || "0", 10),
      emergency: parseInt(r?.emergency || "0", 10),
    };
  },

  /**
   * Public list of published, active notices for CivSetu website
   */
  async listPublic(limit = 20): Promise<NoticeRecord[]> {
    await ensurePostgresTables();
    const pool = getPool();
    const sql = `
      SELECT * FROM notices
      WHERE status = 'Published'
        AND publish_date <= CURRENT_TIMESTAMP
        AND (expiry_date IS NULL OR expiry_date >= CURRENT_TIMESTAMP)
      ORDER BY
        CASE WHEN is_emergency = true THEN 1 ELSE 2 END ASC,
        publish_date DESC
      LIMIT $1;
    `;
    const res = await pool.query(sql, [limit]);
    return res.rows.map(mapNoticeRow);
  },
};
