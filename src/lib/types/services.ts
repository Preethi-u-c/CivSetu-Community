export interface CitizenService {
  id: string;
  name: string;
  category: ServiceCategory;
  department: string;
  description: string;
  eligibility: string;
  requiredDocuments: string[];
  procedure: string;
  expectedTimeline: string;
  contact: string;
  onlineApplicationLink?: string | null;
  fee?: string | null;
  status: "Active" | "Draft" | "Suspended";
  createdAt: string;
  updatedAt: string;
}

export const SERVICE_CATEGORIES = [
  "Water Services",
  "Sanitation & Waste Management",
  "Property & Khata Services",
  "Birth & Death Registry",
  "Certificates & Licenses",
  "Municipal Applications",
  "Grievance Services",
  "Emergency Contacts",
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export const SERVICE_DEPARTMENTS = [
  "Water Supply & Engineering Section",
  "Public Health & Sanitation Section",
  "Town Revenue & Khata Department",
  "Civil Registrar of Births & Deaths",
  "Town Planning & Building Sanction",
  "Trade Licensing & Commercial Cell",
  "Public Grievance Redressal Cell",
  "Disaster Management & Control Room",
] as const;

export interface CreateServiceParams {
  name: string;
  category: ServiceCategory;
  department: string;
  description: string;
  eligibility: string;
  requiredDocuments: string[];
  procedure: string;
  expectedTimeline: string;
  contact: string;
  onlineApplicationLink?: string | null;
  fee?: string | null;
  status?: "Active" | "Draft" | "Suspended";
}

export interface UpdateServiceParams {
  name?: string;
  category?: ServiceCategory;
  department?: string;
  description?: string;
  eligibility?: string;
  requiredDocuments?: string[];
  procedure?: string;
  expectedTimeline?: string;
  contact?: string;
  onlineApplicationLink?: string | null;
  fee?: string | null;
  status?: "Active" | "Draft" | "Suspended";
}

export interface ServiceFilterOptions {
  category?: string;
  department?: string;
  status?: "ALL" | "Active" | "Draft" | "Suspended";
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ServiceStats {
  total: number;
  active: number;
  drafts: number;
  suspended: number;
}
