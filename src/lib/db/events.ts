import crypto from "crypto";
import { getPool, ensurePostgresTables } from "./postgres";
import { extractWardNumber } from "./notices";
import {
  MunicipalEvent,
  CreateEventParams,
  UpdateEventParams,
  EventFilterOptions,
  EventStats,
  DEFAULT_EVENT_IMAGE,
} from "@/lib/types/events";

export * from "@/lib/types/events";

function mapEventRow(row: Record<string, unknown>): MunicipalEvent {
  const toDateString = (val: unknown): string => {
    if (!val) return "";
    if (val instanceof Date) {
      return val.toISOString().split("T")[0];
    }
    return String(val).split("T")[0];
  };

  const toIso = (val: unknown): string => {
    if (!val) return "";
    return val instanceof Date ? val.toISOString() : String(val);
  };

  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    eventDate: toDateString(row.event_date),
    startTime: row.start_time as string,
    endTime: (row.end_time as string) || null,
    location: row.location as string,
    wardRelevance: (row.ward_relevance as string) || "All Wards",
    imageUrl: (row.image_url as string) || DEFAULT_EVENT_IMAGE,
    category: row.category as MunicipalEvent["category"],
    organizer: (row.organizer as string) || "Lakshmeshwar Town Municipal Council",
    isRegistrationRequired: Boolean(row.is_registration_required),
    registrationLink: (row.registration_link as string) || null,
    capacity: row.capacity !== null && row.capacity !== undefined ? Number(row.capacity) : null,
    registeredCount: Number(row.registered_count) || 0,
    status: (row.status as MunicipalEvent["status"]) || "Published",
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

export function generateEventId(): string {
  const year = new Date().getFullYear();
  const hex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `EVT-LMC-${year}-${hex}`;
}

let cachedPublicEvents: MunicipalEvent[] | null = null;
let cacheExpiry = 0;

export function invalidateEventsCache(): void {
  cachedPublicEvents = null;
  cacheExpiry = 0;
}

export const eventsDb = {
  /**
   * Creates a new municipal event
   */
  async create(params: CreateEventParams): Promise<MunicipalEvent> {
    invalidateEventsCache();
    await ensurePostgresTables();
    const pool = getPool();

    const id = generateEventId();
    const title = params.title.trim();
    const description = params.description.trim();
    const eventDate = params.eventDate;
    const startTime = params.startTime.trim();
    const endTime = params.endTime?.trim() || null;
    const location = params.location.trim();
    const wardRelevance = params.wardRelevance?.trim() || "All Wards";
    const imageUrl = params.imageUrl?.trim() || DEFAULT_EVENT_IMAGE;
    const category = params.category;
    const organizer = params.organizer.trim();
    const isRegistrationRequired = Boolean(params.isRegistrationRequired);
    const registrationLink = params.registrationLink?.trim() || null;
    const capacity = params.capacity !== undefined && params.capacity !== null ? Number(params.capacity) : null;
    const status = params.status || "Published";

    const sql = `
      INSERT INTO events (
        id, title, description, event_date, start_time, end_time,
        location, ward_relevance, image_url, category, organizer,
        is_registration_required, registration_link, capacity,
        registered_count, status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13, $14,
        0, $15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *;
    `;

    const values = [
      id,
      title,
      description,
      eventDate,
      startTime,
      endTime,
      location,
      wardRelevance,
      imageUrl,
      category,
      organizer,
      isRegistrationRequired,
      registrationLink,
      capacity,
      status,
    ];

    const res = await pool.query(sql, values);
    return mapEventRow(res.rows[0]);
  },

  /**
   * Lists events with upcoming/past filtering, categories, wards, and pagination
   */
  async list(options: EventFilterOptions = {}): Promise<{ events: MunicipalEvent[]; total: number }> {
    await ensurePostgresTables();
    const pool = getPool();

    const conditions: string[] = ["1=1"];
    const params: unknown[] = [];
    let pIdx = 1;

    // Status filter
    if (options.status && options.status !== "ALL") {
      conditions.push(`status = $${pIdx++}`);
      params.push(options.status);
    }

    // Time filter: upcoming vs past
    if (options.timeFilter === "upcoming") {
      conditions.push(`event_date >= CURRENT_DATE`);
    } else if (options.timeFilter === "past") {
      conditions.push(`event_date < CURRENT_DATE`);
    }

    // Category filter
    if (options.category && options.category !== "ALL") {
      conditions.push(`category = $${pIdx++}`);
      params.push(options.category);
    }

    // Ward relevance filter
    if (options.ward && options.ward.trim() && options.ward !== "ALL") {
      const wardNum = extractWardNumber(options.ward);
      if (wardNum !== null) {
        const pad = String(wardNum).padStart(2, "0");
        const patterns: string[] = [
          `%Ward ${pad}%`,
          `%Ward No. ${pad}%`,
        ];
        if (wardNum < 10) {
          patterns.push(
            `%Ward ${wardNum},%`,
            `%Ward ${wardNum}`,
            `Ward ${wardNum}`,
            `%Ward No. ${wardNum},%`,
            `%Ward No. ${wardNum}`
          );
        } else {
          patterns.push(
            `%Ward ${wardNum}%`,
            `%Ward No. ${wardNum}%`
          );
        }

        const wardMatchClauses = patterns.map((_, i) => `ward_relevance ILIKE $${pIdx + i}`).join(" OR ");
        conditions.push(`(
          ward_relevance ILIKE '%All Wards%'
          OR ward_relevance ILIKE '%Entire Municipality%'
          OR ward_relevance ILIKE '%All Citizens%'
          OR ${wardMatchClauses}
        )`);
        params.push(...patterns);
        pIdx += patterns.length;
      } else {
        conditions.push(`(
          ward_relevance ILIKE '%All Wards%'
          OR ward_relevance ILIKE '%Entire Municipality%'
          OR ward_relevance ILIKE $${pIdx++}
        )`);
        params.push(`%${options.ward.trim()}%`);
      }
    }

    // Keyword search
    if (options.search && options.search.trim()) {
      conditions.push(
        `(title ILIKE $${pIdx} OR description ILIKE $${pIdx} OR location ILIKE $${pIdx} OR organizer ILIKE $${pIdx} OR category ILIKE $${pIdx})`
      );
      params.push(`%${options.search.trim()}%`);
      pIdx++;
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const countSql = `SELECT COUNT(*) AS count FROM events ${whereClause};`;
    const countRes = await pool.query(countSql, params);
    const total = parseInt(countRes.rows[0]?.count || "0", 10);

    const limit = Math.min(Math.max(Number(options.limit) || 20, 1), 100);
    const offset = Math.max(Number(options.offset) || 0, 0);

    // Ordering: upcoming events should be chronologically earliest first; past events chronologically newest first
    let orderByClause = "event_date DESC, start_time DESC";
    if (options.timeFilter === "upcoming") {
      orderByClause = "event_date ASC, start_time ASC";
    }

    const dataSql = `
      SELECT * FROM events
      ${whereClause}
      ORDER BY ${orderByClause}, created_at DESC
      LIMIT $${pIdx++} OFFSET $${pIdx++};
    `;
    params.push(limit, offset);

    const dataRes = await pool.query(dataSql, params);
    return {
      events: dataRes.rows.map(mapEventRow),
      total,
    };
  },

  /**
   * Public list of published events with 60-second in-memory caching
   */
  async listPublic(options: EventFilterOptions = {}): Promise<MunicipalEvent[]> {
    const isUnfiltered =
      (!options.category || options.category === "ALL") &&
      (!options.ward || options.ward === "ALL") &&
      (!options.search || !options.search.trim()) &&
      (!options.timeFilter || options.timeFilter === "all") &&
      (!options.offset || options.offset === 0);

    const now = Date.now();
    if (isUnfiltered && cachedPublicEvents && now < cacheExpiry) {
      const lim = options.limit || 50;
      return cachedPublicEvents.slice(0, lim);
    }

    const res = await this.list({
      ...options,
      status: "Published",
    });

    if (isUnfiltered) {
      cachedPublicEvents = res.events;
      cacheExpiry = now + 60000;
    }

    return res.events;
  },

  /**
   * Retrieves an event by ID
   */
  async getById(id: string): Promise<MunicipalEvent | null> {
    await ensurePostgresTables();
    const pool = getPool();
    const res = await pool.query("SELECT * FROM events WHERE id = $1 LIMIT 1;", [id.trim()]);
    if (res.rows.length === 0) return null;
    return mapEventRow(res.rows[0]);
  },

  /**
   * Updates an existing event
   */
  async update(id: string, updates: UpdateEventParams): Promise<MunicipalEvent> {
    invalidateEventsCache();
    await ensurePostgresTables();
    const pool = getPool();

    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Event ${id} not found.`);
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
    if (updates.eventDate !== undefined) {
      fields.push(`event_date = $${pIdx++}`);
      params.push(updates.eventDate);
    }
    if (updates.startTime !== undefined) {
      fields.push(`start_time = $${pIdx++}`);
      params.push(updates.startTime.trim());
    }
    if (updates.endTime !== undefined) {
      fields.push(`end_time = $${pIdx++}`);
      params.push(updates.endTime ? updates.endTime.trim() : null);
    }
    if (updates.location !== undefined) {
      fields.push(`location = $${pIdx++}`);
      params.push(updates.location.trim());
    }
    if (updates.wardRelevance !== undefined) {
      fields.push(`ward_relevance = $${pIdx++}`);
      params.push(updates.wardRelevance.trim());
    }
    if (updates.imageUrl !== undefined) {
      fields.push(`image_url = $${pIdx++}`);
      params.push(updates.imageUrl.trim());
    }
    if (updates.category !== undefined) {
      fields.push(`category = $${pIdx++}`);
      params.push(updates.category);
    }
    if (updates.organizer !== undefined) {
      fields.push(`organizer = $${pIdx++}`);
      params.push(updates.organizer.trim());
    }
    if (updates.isRegistrationRequired !== undefined) {
      fields.push(`is_registration_required = $${pIdx++}`);
      params.push(Boolean(updates.isRegistrationRequired));
    }
    if (updates.registrationLink !== undefined) {
      fields.push(`registration_link = $${pIdx++}`);
      params.push(updates.registrationLink ? updates.registrationLink.trim() : null);
    }
    if (updates.capacity !== undefined) {
      fields.push(`capacity = $${pIdx++}`);
      params.push(updates.capacity !== null ? Number(updates.capacity) : null);
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
      UPDATE events
      SET ${fields.join(", ")}
      WHERE id = $${pIdx}
      RETURNING *;
    `;

    const res = await pool.query(sql, params);
    return mapEventRow(res.rows[0]);
  },

  /**
   * Deletes an event
   */
  async delete(id: string): Promise<boolean> {
    invalidateEventsCache();
    await ensurePostgresTables();
    const pool = getPool();
    const res = await pool.query("DELETE FROM events WHERE id = $1;", [id.trim()]);
    return (res.rowCount ?? 0) > 0;
  },

  /**
   * Returns stats for the admin events dashboard
   */
  async getStats(): Promise<EventStats> {
    await ensurePostgresTables();
    const pool = getPool();
    const sql = `
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE event_date >= CURRENT_DATE AND status = 'Published') AS upcoming,
        COUNT(*) FILTER (WHERE event_date < CURRENT_DATE AND status = 'Published') AS past,
        COUNT(*) FILTER (WHERE is_registration_required = true) AS registration_required
      FROM events;
    `;
    const res = await pool.query(sql);
    const r = res.rows[0];
    return {
      total: parseInt(r?.total || "0", 10),
      upcoming: parseInt(r?.upcoming || "0", 10),
      past: parseInt(r?.past || "0", 10),
      registrationRequired: parseInt(r?.registration_required || "0", 10),
    };
  },
};
