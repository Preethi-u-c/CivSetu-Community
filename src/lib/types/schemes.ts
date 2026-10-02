export interface GovernmentScheme {
  id: string;
  name: string;
  department: string;
  category: SchemeCategory;
  description: string;
  eligibility: string;
  documentsRequired: string[];
  applicationProcess: string;
  benefits: string;
  deadline?: string | null;
  officialLink?: string | null;
  contactInfo: string;
  status: "Active" | "Draft" | "Closed";
  createdAt: string;
  updatedAt: string;
}

export const SCHEME_CATEGORIES = [
  "Housing & Urban Development",
  "Financial Assistance",
  "Healthcare & Nutrition",
  "Education & Youth Welfare",
  "Women & Child Development",
  "Social Security & Pensions",
  "Livelihood & Skill Development",
  "Sanitation & Clean Energy",
] as const;

export type SchemeCategory = (typeof SCHEME_CATEGORIES)[number];

export const SCHEME_DEPARTMENTS = [
  "Directorate of Municipal Administration (DMA)",
  "Social Welfare Department, Karnataka",
  "Housing & Urban Development Department",
  "Women & Child Development Department",
  "Revenue Department, Karnataka",
  "Health & Family Welfare Department",
  "Skill Development, Entrepreneurship & Livelihood",
  "Ministry of Housing & Urban Affairs (MoHUA)",
] as const;

export interface CreateSchemeParams {
  name: string;
  department: string;
  category: SchemeCategory;
  description: string;
  eligibility: string;
  documentsRequired: string[];
  applicationProcess: string;
  benefits: string;
  deadline?: string | null;
  officialLink?: string | null;
  contactInfo: string;
  status?: "Active" | "Draft" | "Closed";
}

export interface UpdateSchemeParams {
  name?: string;
  department?: string;
  category?: SchemeCategory;
  description?: string;
  eligibility?: string;
  documentsRequired?: string[];
  applicationProcess?: string;
  benefits?: string;
  deadline?: string | null;
  officialLink?: string | null;
  contactInfo?: string;
  status?: "Active" | "Draft" | "Closed";
}

export interface SchemeFilterOptions {
  category?: string;
  department?: string;
  status?: "ALL" | "Active" | "Draft" | "Closed";
  search?: string;
  limit?: number;
  offset?: number;
}

export interface SchemeStats {
  total: number;
  active: number;
  drafts: number;
  closed: number;
}
