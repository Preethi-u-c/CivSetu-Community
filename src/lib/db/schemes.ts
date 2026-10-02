import crypto from "crypto";
import { getPool, ensurePostgresTables } from "./postgres";
import {
  GovernmentScheme,
  CreateSchemeParams,
  UpdateSchemeParams,
  SchemeFilterOptions,
  SchemeStats,
} from "@/lib/types/schemes";

export * from "@/lib/types/schemes";

function mapSchemeRow(row: Record<string, unknown>): GovernmentScheme {
  const toIso = (val: unknown): string => {
    if (!val) return "";
    return val instanceof Date ? val.toISOString() : String(val);
  };

  let docs: string[] = [];
  if (Array.isArray(row.documents_required)) {
    docs = row.documents_required as string[];
  } else if (typeof row.documents_required === "string") {
    try {
      docs = JSON.parse(row.documents_required as string);
    } catch {
      docs = (row.documents_required as string).split(",").map((d) => d.trim());
    }
  }

  return {
    id: row.id as string,
    name: row.name as string,
    department: row.department as string,
    category: row.category as GovernmentScheme["category"],
    description: row.description as string,
    eligibility: row.eligibility as string,
    documentsRequired: docs,
    applicationProcess: row.application_process as string,
    benefits: row.benefits as string,
    deadline: (row.deadline as string) || null,
    officialLink: (row.official_link as string) || null,
    contactInfo: row.contact_info as string,
    status: (row.status as GovernmentScheme["status"]) || "Active",
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

export function generateSchemeId(): string {
  const year = new Date().getFullYear();
  const hex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `SCH-LMC-${year}-${hex}`;
}

export const schemesDb = {
  /**
   * Creates a new government scheme
   */
  async create(params: CreateSchemeParams): Promise<GovernmentScheme> {
    await ensurePostgresTables();
    const pool = getPool();

    const id = generateSchemeId();
    const name = params.name.trim();
    const department = params.department.trim();
    const category = params.category;
    const description = params.description.trim();
    const eligibility = params.eligibility.trim();
    const documentsRequired = params.documentsRequired || [];
    const applicationProcess = params.applicationProcess.trim();
    const benefits = params.benefits.trim();
    const deadline = params.deadline?.trim() || null;
    const officialLink = params.officialLink?.trim() || null;
    const contactInfo = params.contactInfo.trim();
    const status = params.status || "Active";

    const sql = `
      INSERT INTO government_schemes (
        id, name, department, category, description,
        eligibility, documents_required, application_process,
        benefits, deadline, official_link, contact_info,
        status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8,
        $9, $10, $11, $12,
        $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *;
    `;

    const values = [
      id,
      name,
      department,
      category,
      description,
      eligibility,
      documentsRequired,
      applicationProcess,
      benefits,
      deadline,
      officialLink,
      contactInfo,
      status,
    ];

    const res = await pool.query(sql, values);
    return mapSchemeRow(res.rows[0]);
  },

  /**
   * Lists schemes with category, department, and status filtering
   */
  async list(options: SchemeFilterOptions = {}): Promise<{ schemes: GovernmentScheme[]; total: number }> {
    await ensurePostgresTables();
    const pool = getPool();

    const conditions: string[] = ["1=1"];
    const params: unknown[] = [];
    let pIdx = 1;

    if (options.status && options.status !== "ALL") {
      conditions.push(`status = $${pIdx++}`);
      params.push(options.status);
    }

    if (options.category && options.category !== "ALL") {
      conditions.push(`category = $${pIdx++}`);
      params.push(options.category);
    }

    if (options.department && options.department !== "ALL") {
      conditions.push(`department = $${pIdx++}`);
      params.push(options.department);
    }

    if (options.search && options.search.trim()) {
      conditions.push(
        `(name ILIKE $${pIdx} OR description ILIKE $${pIdx} OR department ILIKE $${pIdx} OR benefits ILIKE $${pIdx} OR eligibility ILIKE $${pIdx})`
      );
      params.push(`%${options.search.trim()}%`);
      pIdx++;
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const countSql = `SELECT COUNT(*) AS count FROM government_schemes ${whereClause};`;
    const countRes = await pool.query(countSql, params);
    const total = parseInt(countRes.rows[0]?.count || "0", 10);

    const limit = Math.min(Math.max(Number(options.limit) || 20, 1), 100);
    const offset = Math.max(Number(options.offset) || 0, 0);

    const dataSql = `
      SELECT * FROM government_schemes
      ${whereClause}
      ORDER BY
        CASE WHEN status = 'Active' THEN 1 WHEN status = 'Draft' THEN 2 ELSE 3 END ASC,
        created_at DESC
      LIMIT $${pIdx++} OFFSET $${pIdx++};
    `;
    params.push(limit, offset);

    const dataRes = await pool.query(dataSql, params);
    return {
      schemes: dataRes.rows.map(mapSchemeRow),
      total,
    };
  },

  /**
   * Public list of active government schemes
   */
  async listPublic(options: SchemeFilterOptions = {}): Promise<GovernmentScheme[]> {
    const res = await this.list({
      ...options,
      status: "Active",
    });
    return res.schemes;
  },

  /**
   * Retrieves a scheme by ID
   */
  async getById(id: string): Promise<GovernmentScheme | null> {
    await ensurePostgresTables();
    const pool = getPool();
    const res = await pool.query("SELECT * FROM government_schemes WHERE id = $1 LIMIT 1;", [id.trim()]);
    if (res.rows.length === 0) return null;
    return mapSchemeRow(res.rows[0]);
  },

  /**
   * Updates an existing scheme
   */
  async update(id: string, updates: UpdateSchemeParams): Promise<GovernmentScheme> {
    await ensurePostgresTables();
    const pool = getPool();

    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Government scheme ${id} not found.`);
    }

    const fields: string[] = [];
    const params: unknown[] = [];
    let pIdx = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${pIdx++}`);
      params.push(updates.name.trim());
    }
    if (updates.department !== undefined) {
      fields.push(`department = $${pIdx++}`);
      params.push(updates.department.trim());
    }
    if (updates.category !== undefined) {
      fields.push(`category = $${pIdx++}`);
      params.push(updates.category);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${pIdx++}`);
      params.push(updates.description.trim());
    }
    if (updates.eligibility !== undefined) {
      fields.push(`eligibility = $${pIdx++}`);
      params.push(updates.eligibility.trim());
    }
    if (updates.documentsRequired !== undefined) {
      fields.push(`documents_required = $${pIdx++}`);
      params.push(updates.documentsRequired);
    }
    if (updates.applicationProcess !== undefined) {
      fields.push(`application_process = $${pIdx++}`);
      params.push(updates.applicationProcess.trim());
    }
    if (updates.benefits !== undefined) {
      fields.push(`benefits = $${pIdx++}`);
      params.push(updates.benefits.trim());
    }
    if (updates.deadline !== undefined) {
      fields.push(`deadline = $${pIdx++}`);
      params.push(updates.deadline ? updates.deadline.trim() : null);
    }
    if (updates.officialLink !== undefined) {
      fields.push(`official_link = $${pIdx++}`);
      params.push(updates.officialLink ? updates.officialLink.trim() : null);
    }
    if (updates.contactInfo !== undefined) {
      fields.push(`contact_info = $${pIdx++}`);
      params.push(updates.contactInfo.trim());
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${pIdx++}`);
      params.push(updates.status);
    }

    if (fields.length === 0) {
      return existing;
    }

    fields.push("updated_at = CURRENT_TIMESTAMP");
    params.push(id.trim());

    const sql = `
      UPDATE government_schemes
      SET ${fields.join(", ")}
      WHERE id = $${pIdx}
      RETURNING *;
    `;

    const res = await pool.query(sql, params);
    return mapSchemeRow(res.rows[0]);
  },

  /**
   * Deletes a scheme
   */
  async delete(id: string): Promise<boolean> {
    await ensurePostgresTables();
    const pool = getPool();
    const res = await pool.query("DELETE FROM government_schemes WHERE id = $1;", [id.trim()]);
    return (res.rowCount ?? 0) > 0;
  },

  /**
   * Returns stats for the admin schemes dashboard
   */
  async getStats(): Promise<SchemeStats> {
    await ensurePostgresTables();
    const pool = getPool();
    const sql = `
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'Active') AS active,
        COUNT(*) FILTER (WHERE status = 'Draft') AS drafts,
        COUNT(*) FILTER (WHERE status = 'Closed') AS closed
      FROM government_schemes;
    `;
    const res = await pool.query(sql);
    const r = res.rows[0];
    return {
      total: parseInt(r?.total || "0", 10),
      active: parseInt(r?.active || "0", 10),
      drafts: parseInt(r?.drafts || "0", 10),
      closed: parseInt(r?.closed || "0", 10),
    };
  },
};
