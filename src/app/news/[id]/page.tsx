import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { newsDb } from "@/lib/db/news";
import { PageContainer } from "@/components/UI/PageContainer";
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  ArrowLeft,
  Building,
  User,
  Eye,
  Share2,
  Newspaper,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewsArticleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const article = await newsDb.getById(params.id, true);

  if (!article || !article.isPublished) {
    notFound();
  }

  const publishDateFormatted = new Date(article.publishedAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <PageContainer
      title={article.headline}
      subtitle={`Lakshmeshwar Community News • ${article.category}`}
      breadcrumbs={[
        { label: "Local News", href: "/news" },
        { label: article.headline },
      ]}
    >
      <article className="max-w-4xl mx-auto space-y-6">
        {/* Top Metadata Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-gray-800 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category */}
            <span className="px-3 py-1 rounded-lg font-bold bg-[#064E4A] text-white shadow-sm flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>{article.category}</span>
            </span>

            {/* Ward Relevance */}
            <span className="px-3 py-1 rounded-lg font-semibold bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#064E4A] dark:text-teal-400" />
              <span>Ward Relevance: {article.wardRelevance}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readTimeMinutes} min read</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{article.viewsCount} views</span>
            </span>
          </div>
        </div>

        {/* Featured Image */}
        <div className="relative rounded-2xl overflow-hidden shadow-md max-h-[460px] w-full bg-gray-100 dark:bg-gray-800">
          <img
            src={article.imageUrl}
            alt={article.headline}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Author & Publication Byline */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-gray-50 dark:bg-[#061817] border border-gray-200 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#064E4A] text-white flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-gray-100">
                Reported by: {article.authorName}
              </p>
              <p className="text-[11px] text-gray-500">
                CivSetu Lakshmeshwar Editorial Bureau
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-gray-500">
            <Calendar className="w-3.5 h-3.5 text-[#064E4A] dark:text-teal-400" />
            <span>Published: {publishDateFormatted}</span>
          </div>
        </div>

        {/* Summary Executive Callout */}
        <div className="p-5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border-l-4 border-[#064E4A] dark:border-teal-400 text-xs sm:text-sm font-medium text-teal-950 dark:text-teal-100 leading-relaxed shadow-sm">
          <strong className="block text-xs uppercase tracking-wider font-bold text-[#064E4A] dark:text-teal-300 mb-1">
            Story Summary & Overview
          </strong>
          {article.summary}
        </div>

        {/* Full Article Text Body */}
        <div className="prose prose-teal dark:prose-invert max-w-none text-sm sm:text-base text-gray-800 dark:text-gray-200 leading-relaxed space-y-4 whitespace-pre-line bg-white dark:bg-[#071d1b] p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          {article.article}
        </div>

        {/* Article Footer & Navigation */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#064E4A] dark:text-teal-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All News Articles</span>
          </Link>

          <Link
            href={`/notices?ward=${encodeURIComponent(article.wardRelevance)}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-teal-700 transition"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Check Official Notices for {article.wardRelevance}</span>
          </Link>
        </div>
      </article>
    </PageContainer>
  );
}
