/**
 * Production Security & Data Validation Suite for CivSetu
 * Lakshmeshwar Town Municipal Council (TMC)
 */

export const CANONICAL_CATEGORIES = [
  "Water Supply & Piped Lines",
  "Water Supply & Metering",
  "Street Lighting & Electrical",
  "Solid Waste Management & Sanitation",
  "Roads, Footpaths & Drainage",
  "Public Health & Mosquito Control",
  "Revenue, Tax & Property Assessment",
  "Town Planning & Building Permissions",
  "Birth, Death & Trade Licensing",
  "Other Civic Issues",
] as const;

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Strips dangerous HTML tags and script injections to prevent XSS
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/[&<>"']/g, (match) => {
      const entities: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return entities[match] || match;
    })
    .trim();
}

/**
 * Validates a complaint tracking ID (e.g., CMP-LMC-2026-XXXXX or CMP-TEST-...)
 */
export function isValidComplaintId(id: unknown): boolean {
  if (typeof id !== "string") return false;
  return /^CMP-[A-Z0-9_-]{4,32}$/i.test(id.trim());
}

/**
 * Validates municipal ward input (Ward 1-23 or numeric 1-23)
 */
export function validateWard(ward: unknown): { isValid: boolean; normalized?: string; error?: string } {
  if (typeof ward !== "string" && typeof ward !== "number") {
    return { isValid: false, error: "Ward identifier must be a valid string or integer." };
  }

  const str = String(ward).trim();
  const match = str.match(/\b([1-9]|1[0-9]|2[0-3])\b/);
  if (!match) {
    return { isValid: false, error: "Ward must be between Ward 01 and Ward 23 in Lakshmeshwar TMC." };
  }

  const wardNum = parseInt(match[1], 10);
  if (wardNum >= 1 && wardNum <= 23) {
    const padded = String(wardNum).padStart(2, "0");
    return { isValid: true, normalized: `Ward ${padded}` };
  }

  return { isValid: false, error: "Ward must be between 1 and 23." };
}

/**
 * Validates Indian 10-digit mobile number
 */
export function isValidMobileNumber(mobile: unknown): boolean {
  if (typeof mobile !== "string") return false;
  const cleaned = mobile.replace(/\D/g, "");
  return cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Validates RFC-5322 standard email address format
 */
export function isValidEmail(email: unknown): boolean {
  if (typeof email !== "string") return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
}

/**
 * Validates complaint creation payload thoroughly
 */
export function validateComplaintSubmission(payload: {
  category?: unknown;
  title?: unknown;
  description?: unknown;
  ward?: unknown;
  priority?: unknown;
  photoUrl?: unknown;
}): ValidationResult {
  const errors: string[] = [];

  // 1. Category validation
  if (!payload.category || typeof payload.category !== "string" || !payload.category.trim()) {
    errors.push("Complaint category is required.");
  }

  // 2. Title validation (5 - 200 chars)
  if (!payload.title || typeof payload.title !== "string" || payload.title.trim().length < 5) {
    errors.push("Grievance title must be at least 5 characters.");
  } else if (payload.title.trim().length > 200) {
    errors.push("Grievance title cannot exceed 200 characters.");
  }

  // 3. Description validation (10 - 4000 chars)
  if (!payload.description || typeof payload.description !== "string" || payload.description.trim().length < 10) {
    errors.push("Grievance description must be at least 10 characters.");
  } else if (payload.description.trim().length > 4000) {
    errors.push("Grievance description cannot exceed 4000 characters.");
  }

  // 4. Ward validation
  const wardCheck = validateWard(payload.ward);
  if (!wardCheck.isValid) {
    errors.push(wardCheck.error || "Invalid ward selection.");
  }

  // 5. Priority validation
  const validPriorities = ["Low", "Medium", "High", "Urgent"];
  if (payload.priority && !validPriorities.includes(String(payload.priority))) {
    errors.push(`Priority must be one of: ${validPriorities.join(", ")}`);
  }

  // 6. Photo URL / Base64 size validation (max 5MB)
  if (payload.photoUrl && typeof payload.photoUrl === "string") {
    if (payload.photoUrl.startsWith("data:image/")) {
      // 5MB base64 is ~7,000,000 chars
      if (payload.photoUrl.length > 7000000) {
        errors.push("Uploaded complaint photo exceeds the 5MB maximum file size limit.");
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitizes an object by removing sensitive fields before JSON serialization
 */
export function stripSensitiveSecrets<T extends Record<string, any>>(obj: T): Partial<T> {
  if (!obj || typeof obj !== "object") return obj;

  const forbiddenKeys = new Set([
    "password_hash",
    "passwordHash",
    "password",
    "otp_hash",
    "otpHash",
    "secret",
    "DATABASE_URL",
    "AUTH_SECRET",
    "EMAIL_PASS",
    "TWILIO_AUTH_TOKEN",
  ]);

  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (!forbiddenKeys.has(key)) {
      if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
        clean[key] = stripSensitiveSecrets(value);
      } else {
        clean[key] = value;
      }
    }
  }

  return clean as Partial<T>;
}
