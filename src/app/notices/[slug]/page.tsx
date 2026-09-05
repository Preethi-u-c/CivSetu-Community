import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db/storage";
import { notices as initialNotices } from "@/data/notices";
import { PageContainer } from "@/components/UI/PageContainer";
import { Calendar, Tag, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function NoticeDetailPage({ params }: { params: { slug: string } }) {
  // Query from database repository, fallback to initial notices
  const notice = db.notices.getBySlug(params.slug) || initialNotices.find((n) => n.slug === params.slug);

  if (!notice) {
    notFound();
  }

  return (
    <PageContainer
      title={notice.title}
      subtitle={`Official Municipal Gazette Notification - ${notice.category}`}
      breadcrumbs={[
        { label: "What's New Notices", href: "/#notices" },
        { label: notice.title },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pb-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
            <span>Published Date: {notice.date} ({notice.relativeTime})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
            <span>Category: {notice.category}</span>
          </div>
        </div>

        <div className="space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {notice.titleKn}
          </p>
          <p>{notice.content}</p>
          <p>{notice.contentKn}</p>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#064E4A] dark:text-teal-400 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Homepage</span>
          </Link>
          <span className="text-[11px] text-gray-400">
            Lakshmeshwar Town Municipal Council Notification
          </span>
        </div>
      </div>
    </PageContainer>
  );
}
