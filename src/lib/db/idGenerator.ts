/**
 * Municipal Statutory Reference ID Generator
 * Formats:
 * - Grievance: LMC-GRV-YYYY-XXXX (e.g. LMC-GRV-2026-1042)
 * - Application: LMC-APP-YYYY-XXXX (e.g. LMC-APP-2026-5089)
 * - Feedback: LMC-FB-YYYY-XXXX (e.g. LMC-FB-2026-0031)
 */

export function generateGrievanceId(currentCount: number): string {
  const year = new Date().getFullYear();
  const sequence = (1000 + currentCount + 1).toString();
  return `LMC-GRV-${year}-${sequence}`;
}

export function generateApplicationId(currentCount: number): string {
  const year = new Date().getFullYear();
  const sequence = (5000 + currentCount + 1).toString();
  return `LMC-APP-${year}-${sequence}`;
}

export function generateFeedbackId(currentCount: number): string {
  const year = new Date().getFullYear();
  const sequence = (currentCount + 1).toString().padStart(4, "0");
  return `LMC-FB-${year}-${sequence}`;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}
