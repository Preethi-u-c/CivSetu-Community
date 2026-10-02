import crypto from "crypto";
import { getPool, ensurePostgresTables } from "./postgres";
import { extractWardNumber } from "./notices";

export * from "@/lib/types/news";
import {
  NewsArticle,
  CreateNewsArticleParams,
  UpdateNewsArticleParams,
  NewsFilterOptions,
  NewsStats,
  DEFAULT_NEWS_IMAGE,
} from "@/lib/types/news";

function mapNewsRow(row: Record<string, unknown>): NewsArticle {
  const toIso = (val: unknown): string => {
    if (!val) return "";
    return val instanceof Date ? val.toISOString() : String(val);
  };

  return {
    id: row.id as string,
    headline: row.headline as string,
    imageUrl: (row.image_url as string) || DEFAULT_NEWS_IMAGE,
    summary: row.summary as string,
    article: row.article as string,
    category: (row.category as string) || "Civic Development",
    wardRelevance: (row.ward_relevance as string) || "All Wards",
    isPublished: Boolean(row.is_published),
    publishedAt: toIso(row.published_at),
    authorName: (row.author_name as string) || "CivSetu News Desk",
    readTimeMinutes: Number(row.read_time_minutes) || 3,
    viewsCount: Number(row.views_count) || 0,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

export function generateNewsId(): string {
  const year = new Date().getFullYear();
  const hex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `NEWS-LMC-${year}-${hex}`;
}

export const newsDb = {
  /**
   * Creates a new news article in PostgreSQL
   */
  async create(params: CreateNewsArticleParams): Promise<NewsArticle> {
    await ensurePostgresTables();
    const pool = getPool();

    const id = generateNewsId();
    const headline = params.headline.trim();
    const imageUrl = params.imageUrl?.trim() || DEFAULT_NEWS_IMAGE;
    const summary = params.summary.trim();
    const article = params.article.trim();
    const category = params.category.trim();
    const wardRelevance = params.wardRelevance?.trim() || "All Wards";
    const isPublished = params.isPublished !== undefined ? Boolean(params.isPublished) : true;
    const publishedAt = params.publishedAt ? new Date(params.publishedAt) : new Date();
    const authorName = params.authorName?.trim() || "CivSetu News Desk";
    const readTimeMinutes = params.readTimeMinutes && params.readTimeMinutes > 0
      ? params.readTimeMinutes
      : Math.max(1, Math.ceil(article.split(/\s+/).length / 200));

    const sql = `
      INSERT INTO news_articles (
        id, headline, image_url, summary, article, category,
        ward_relevance, is_published, published_at, author_name,
        read_time_minutes, views_count, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10,
        $11, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *;
    `;

    const values = [
      id,
      headline,
      imageUrl,
      summary,
      article,
      category,
      wardRelevance,
      isPublished,
      publishedAt,
      authorName,
      readTimeMinutes,
    ];

    const res = await pool.query(sql, values);
    return mapNewsRow(res.rows[0]);
  },

  /**
   * Lists news articles with filtering, pagination, and total count (for admin and public)
   */
  async list(options: NewsFilterOptions = {}): Promise<{ articles: NewsArticle[]; total: number }> {
    await ensurePostgresTables();
    const pool = getPool();

    const conditions: string[] = ["1=1"];
    const params: unknown[] = [];
    let paramIndex = 1;

    // Filter by publication status
    if (options.status && options.status !== "ALL") {
      if (options.status === "Published") {
        conditions.push(`is_published = true`);
      } else if (options.status === "Draft") {
        conditions.push(`is_published = false`);
      }
    } else if (options.isPublished !== undefined) {
      conditions.push(`is_published = $${paramIndex++}`);
      params.push(options.isPublished);
    }

    // Filter by category
    if (options.category && options.category !== "ALL") {
      conditions.push(`category = $${paramIndex++}`);
      params.push(options.category);
    }

    // Filter by ward relevance
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

        const wardMatchClauses = patterns.map((_, i) => `ward_relevance ILIKE $${paramIndex + i}`).join(" OR ");
        conditions.push(`(
          ward_relevance ILIKE '%All Wards%'
          OR ward_relevance ILIKE '%Entire Municipality%'
          OR ward_relevance ILIKE '%All Citizens%'
          OR ${wardMatchClauses}
        )`);
        params.push(...patterns);
        paramIndex += patterns.length;
      } else {
        conditions.push(`(
          ward_relevance ILIKE '%All Wards%'
          OR ward_relevance ILIKE '%Entire Municipality%'
          OR ward_relevance ILIKE $${paramIndex++}
        )`);
        params.push(`%${options.ward.trim()}%`);
      }
    }

    // Keyword search
    if (options.search && options.search.trim()) {
      conditions.push(
        `(headline ILIKE $${paramIndex} OR summary ILIKE $${paramIndex} OR article ILIKE $${paramIndex} OR category ILIKE $${paramIndex} OR ward_relevance ILIKE $${paramIndex})`
      );
      params.push(`%${options.search.trim()}%`);
      paramIndex++;
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const countSql = `SELECT COUNT(*) AS count FROM news_articles ${whereClause};`;
    const countRes = await pool.query(countSql, params);
    const total = parseInt(countRes.rows[0]?.count || "0", 10);

    const limit = Math.min(Math.max(Number(options.limit) || 20, 1), 100);
    const offset = Math.max(Number(options.offset) || 0, 0);

    const dataSql = `
      SELECT * FROM news_articles
      ${whereClause}
      ORDER BY published_at DESC, created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;
    params.push(limit, offset);

    const dataRes = await pool.query(dataSql, params);
    return {
      articles: dataRes.rows.map(mapNewsRow),
      total,
    };
  },

  /**
   * Public list of published news articles
   */
  async listPublic(
    options: {
      category?: string;
      ward?: string;
      search?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<NewsArticle[]> {
    const res = await this.list({
      ...options,
      isPublished: true,
    });
    return res.articles;
  },

  /**
   * Retrieves a single article by ID, optionally incrementing view count
   */
  async getById(id: string, incrementViews = false): Promise<NewsArticle | null> {
    await ensurePostgresTables();
    const pool = getPool();

    if (incrementViews) {
      await pool.query(
        "UPDATE news_articles SET views_count = views_count + 1 WHERE id = $1;",
        [id.trim()]
      );
    }

    const res = await pool.query(
      "SELECT * FROM news_articles WHERE id = $1 LIMIT 1;",
      [id.trim()]
    );
    if (res.rows.length === 0) return null;
    return mapNewsRow(res.rows[0]);
  },

  /**
   * Updates an existing news article
   */
  async update(id: string, updates: UpdateNewsArticleParams): Promise<NewsArticle> {
    await ensurePostgresTables();
    const pool = getPool();

    const existing = await this.getById(id, false);
    if (!existing) {
      throw new Error(`News article ${id} not found.`);
    }

    const fields: string[] = [];
    const params: unknown[] = [];
    let pIdx = 1;

    if (updates.headline !== undefined) {
      fields.push(`headline = $${pIdx++}`);
      params.push(updates.headline.trim());
    }
    if (updates.imageUrl !== undefined) {
      fields.push(`image_url = $${pIdx++}`);
      params.push(updates.imageUrl.trim());
    }
    if (updates.summary !== undefined) {
      fields.push(`summary = $${pIdx++}`);
      params.push(updates.summary.trim());
    }
    if (updates.article !== undefined) {
      fields.push(`article = $${pIdx++}`);
      params.push(updates.article.trim());
    }
    if (updates.category !== undefined) {
      fields.push(`category = $${pIdx++}`);
      params.push(updates.category.trim());
    }
    if (updates.wardRelevance !== undefined) {
      fields.push(`ward_relevance = $${pIdx++}`);
      params.push(updates.wardRelevance.trim());
    }
    if (updates.isPublished !== undefined) {
      fields.push(`is_published = $${pIdx++}`);
      params.push(Boolean(updates.isPublished));
    }
    if (updates.publishedAt !== undefined) {
      fields.push(`published_at = $${pIdx++}`);
      params.push(new Date(updates.publishedAt));
    }
    if (updates.authorName !== undefined) {
      fields.push(`author_name = $${pIdx++}`);
      params.push(updates.authorName.trim());
    }
    if (updates.readTimeMinutes !== undefined) {
      fields.push(`read_time_minutes = $${pIdx++}`);
      params.push(Number(updates.readTimeMinutes));
    }

    if (fields.length === 0) {
      return existing;
    }

    fields.push("updated_at = CURRENT_TIMESTAMP");
    params.push(id.trim());

    const sql = `
      UPDATE news_articles
      SET ${fields.join(", ")}
      WHERE id = $${pIdx}
      RETURNING *;
    `;

    const res = await pool.query(sql, params);
    return mapNewsRow(res.rows[0]);
  },

  /**
   * Toggles the publish state of an article (published <-> draft)
   */
  async togglePublish(id: string): Promise<NewsArticle> {
    await ensurePostgresTables();
    const pool = getPool();

    const existing = await this.getById(id, false);
    if (!existing) {
      throw new Error(`News article ${id} not found.`);
    }

    const nextState = !existing.isPublished;
    const sql = `
      UPDATE news_articles
      SET is_published = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;
    const res = await pool.query(sql, [nextState, id.trim()]);
    return mapNewsRow(res.rows[0]);
  },

  /**
   * Deletes a news article
   */
  async delete(id: string): Promise<boolean> {
    await ensurePostgresTables();
    const pool = getPool();
    const res = await pool.query("DELETE FROM news_articles WHERE id = $1;", [id.trim()]);
    return (res.rowCount ?? 0) > 0;
  },

  /**
   * Aggregates stats for the admin news dashboard
   */
  async getStats(): Promise<NewsStats> {
    await ensurePostgresTables();
    const pool = getPool();
    const sql = `
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE is_published = true) AS published,
        COUNT(*) FILTER (WHERE is_published = false) AS drafts,
        COALESCE(SUM(views_count), 0) AS total_views
      FROM news_articles;
    `;
    const res = await pool.query(sql);
    const r = res.rows[0];
    return {
      total: parseInt(r?.total || "0", 10),
      published: parseInt(r?.published || "0", 10),
      drafts: parseInt(r?.drafts || "0", 10),
      totalViews: parseInt(r?.total_views || "0", 10),
    };
  },
};
