export interface MunicipalEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string; // ISO date YYYY-MM-DD
  startTime: string; // e.g. "10:00 AM"
  endTime?: string | null; // e.g. "02:00 PM"
  location: string;
  wardRelevance: string;
  imageUrl: string;
  category: EventCategory;
  organizer: string;
  isRegistrationRequired: boolean;
  registrationLink?: string | null;
  capacity?: number | null;
  registeredCount: number;
  status: "Published" | "Draft" | "Cancelled";
  createdAt: string;
  updatedAt: string;
}

export const EVENT_CATEGORIES = [
  "Festivals",
  "Public Meetings",
  "Municipal Programs",
  "Awareness Campaigns",
  "Cultural Events",
  "Civic Events",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export interface CreateEventParams {
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime?: string | null;
  location: string;
  wardRelevance?: string;
  imageUrl?: string;
  category: EventCategory;
  organizer: string;
  isRegistrationRequired?: boolean;
  registrationLink?: string | null;
  capacity?: number | null;
  status?: "Published" | "Draft" | "Cancelled";
}

export interface UpdateEventParams {
  title?: string;
  description?: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string | null;
  location?: string;
  wardRelevance?: string;
  imageUrl?: string;
  category?: EventCategory;
  organizer?: string;
  isRegistrationRequired?: boolean;
  registrationLink?: string | null;
  capacity?: number | null;
  status?: "Published" | "Draft" | "Cancelled";
}

export interface EventFilterOptions {
  timeFilter?: "all" | "upcoming" | "past";
  category?: string;
  ward?: string;
  search?: string;
  status?: "ALL" | "Published" | "Draft" | "Cancelled";
  limit?: number;
  offset?: number;
}

export interface EventStats {
  total: number;
  upcoming: number;
  past: number;
  registrationRequired: number;
}

export const DEFAULT_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80";
