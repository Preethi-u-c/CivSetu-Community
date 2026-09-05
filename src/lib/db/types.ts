export type GrievanceStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "REJECTED";

export type GrievancePriority = "NORMAL" | "HIGH" | "URGENT";

export interface TimelineEvent {
  status: string;
  timestamp: string; // ISO string
  note: string;
  updatedBy?: string;
}

export interface GrievanceRecord {
  id: string; // e.g., LMC-GRV-2026-1001
  citizenName: string;
  mobileNumber: string;
  wardNumber?: string;
  category: string; // water, sanitation, roads, streetlights, tax, other
  subject: string;
  description: string;
  priority: GrievancePriority;
  status: GrievanceStatus;
  assignedDepartment?: string;
  officialRemarks?: string;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
}

export type ApplicationStatus =
  | "SUBMITTED"
  | "UNDER_VERIFICATION"
  | "INSPECTION_SCHEDULED"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED";

export interface ServiceApplicationRecord {
  id: string; // e.g., LMC-APP-2026-5001
  serviceCode: string; // e.g. Form TMC-W1, TMC-BP4, etc.
  serviceName: string;
  applicantName: string;
  mobileNumber: string;
  email?: string;
  wardNumber?: string;
  address: string;
  details: Record<string, string>;
  status: ApplicationStatus;
  officialRemarks?: string;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
}

export type FeedbackStatus =
  | "PENDING"
  | "REVIEWED"
  | "FLAGGED_FOR_COUNCIL"
  | "ARCHIVED";

export interface FeedbackRecord {
  id: string; // e.g., LMC-FB-2026-0001
  citizenName: string;
  mobileNumber: string;
  wardNumber?: string;
  category: string;
  suggestion: string;
  status: FeedbackStatus;
  officialNote?: string;
  createdAt: string;
}

export interface NoticeRecord {
  id: string;
  title: string;
  titleKn: string;
  slug: string;
  category: string;
  categoryKn: string;
  relativeTime: string;
  relativeTimeKn: string;
  date: string;
  content: string;
  contentKn: string;
  isPublished: boolean;
  isPinned: boolean;
  fileUrl?: string;
  createdAt: string;
}

export interface VisitorStatsRecord {
  totalVisitors: number;
  uniqueVisitors: number;
  registeredUsers: number;
  lastRegisteredUser: string;
  publishedNotices: number;
  ipPlaceholder: string;
  sinceDate: string;
  visitorIpHashes: string[];
  lastVisitAt: string;
}

export interface DatabaseSchema {
  grievances: GrievanceRecord[];
  applications: ServiceApplicationRecord[];
  feedbacks: FeedbackRecord[];
  notices: NoticeRecord[];
  visitorStats: VisitorStatsRecord;
  lastUpdated: string;
}
