import { NextRequest } from "next/server";

export interface RateLimitOptions {
  limit?: number;      // Maximum requests allowed within window
  windowMs?: number;   // Sliding window duration in milliseconds
  identifier?: string; // Optional custom identifier (defaults to client IP)
}

export interface RateLimitResult {
  isAllowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

interface RequestRecord {
  timestamps: number[];
}

// Global in-memory storage for sliding window rate limiting
declare global {
  // eslint-disable-next-line no-var
  var __civsetuRateLimitMap: Map<string, RequestRecord> | undefined;
}

function getRateLimitMap(): Map<string, RequestRecord> {
  if (!globalThis.__civsetuRateLimitMap) {
    globalThis.__civsetuRateLimitMap = new Map();
  }
  return globalThis.__civsetuRateLimitMap;
}

/**
 * Extracts a client IP or fallback identifier from NextRequest headers
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

/**
 * Checks sliding-window rate limit for a given key
 */
export function checkRateLimitByKey(
  key: string,
  limit: number = 60,
  windowMs: number = 60000
): RateLimitResult {
  const map = getRateLimitMap();
  const now = Date.now();
  const windowStart = now - windowMs;

  const record = map.get(key) || { timestamps: [] };

  // Filter out timestamps outside the active sliding window
  const activeTimestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (activeTimestamps.length >= limit) {
    const oldest = activeTimestamps[0];
    const resetMs = oldest + windowMs - now;
    return {
      isAllowed: false,
      limit,
      remaining: 0,
      resetSeconds: Math.max(1, Math.ceil(resetMs / 1000)),
    };
  }

  // Record this request
  activeTimestamps.push(now);
  map.set(key, { timestamps: activeTimestamps });

  return {
    isAllowed: true,
    limit,
    remaining: limit - activeTimestamps.length,
    resetSeconds: Math.ceil(windowMs / 1000),
  };
}

/**
 * Middleware rate-limiter helper for NextRequest
 */
export function enforceRateLimit(
  req: NextRequest,
  bucket: "auth" | "complaints" | "general" | "ai" = "general",
  options?: RateLimitOptions
): RateLimitResult {
  const ip = options?.identifier || getClientIp(req);
  const key = `${bucket}:${ip}`;

  const limits: Record<string, { limit: number; windowMs: number }> = {
    auth: { limit: 10, windowMs: 60000 },        // 10 auth requests / min
    complaints: { limit: 15, windowMs: 60000 },  // 15 complaints / min
    ai: { limit: 20, windowMs: 60000 },          // 20 AI queries / min
    general: { limit: 120, windowMs: 60000 },    // 120 general requests / min
  };

  const config = limits[bucket] || limits.general;
  const limit = options?.limit ?? config.limit;
  const windowMs = options?.windowMs ?? config.windowMs;

  return checkRateLimitByKey(key, limit, windowMs);
}
