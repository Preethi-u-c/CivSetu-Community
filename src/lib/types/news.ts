export interface NewsArticle {
  id: string;
  headline: string;
  imageUrl: string;
  summary: string;
  article: string;
  category: string;
  wardRelevance: string;
  isPublished: boolean;
  publishedAt: string;
  authorName: string;
  readTimeMinutes: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNewsArticleParams {
  headline: string;
  imageUrl?: string;
  summary: string;
  article: string;
  category: string;
  wardRelevance?: string;
  isPublished?: boolean;
  publishedAt?: string | Date;
  authorName?: string;
  readTimeMinutes?: number;
}

export interface UpdateNewsArticleParams {
  headline?: string;
  imageUrl?: string;
  summary?: string;
  article?: string;
  category?: string;
  wardRelevance?: string;
  isPublished?: boolean;
  publishedAt?: string | Date;
  authorName?: string;
  readTimeMinutes?: number;
}

export interface NewsFilterOptions {
  category?: string;
  ward?: string;
  search?: string;
  status?: "ALL" | "Published" | "Draft";
  isPublished?: boolean;
  limit?: number;
  offset?: number;
}

export interface NewsStats {
  total: number;
  published: number;
  drafts: number;
  totalViews: number;
}

export const NEWS_CATEGORIES = [
  "Civic Development",
  "Community & Culture",
  "Public Health",
  "Environment",
  "Infrastructure",
  "Municipal Governance",
  "Education & Youth",
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export const DEFAULT_NEWS_IMAGE =
  "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80";
