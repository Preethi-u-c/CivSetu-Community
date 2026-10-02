import React from "react";
import { notFound } from "next/navigation";
import { noticeDb } from "@/lib/db/notices";
import { db } from "@/lib/db/storage";
import { notices as initialNotices } from "@/data/notices";
import { PageContainer } from "@/components/UI/PageContainer";
import {
  Calendar,
  Tag,
  ArrowLeft,
  AlertTriangle,
  MapPin,
  Clock,
  Building,
  Share2,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NoticeDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  // 1. Try PostgreSQL by notice ID or slug
  let pgNotice = null;
  try {
    pgNotice = await noticeDb.getById(params.slug);
  } catch (err) {
    console.error("Failed to query notice from PostgreSQL:", err);
  }

  // 2. Fallback to memory DB / initial notices
  const legacyNotice = pgNotice
    ? null
    : (db.notices.getBySlug(params.slug) || initialNotices.find((n) => n.slug === params.slug) || null);

  if (!pgNotice && !legacyNotice) {
    notFound();
  }

  const title = pgNotice ? pgNotice.title : legacyNotice!.title;
  const category = pgNotice ? pgNotice.category : legacyNotice!.category;
  const isEmergency = pgNotice ? pgNotice.isEmergency : false;
  const priority = pgNotice ? pgNotice.priority : "Normal";
  const publishDate = pgNotice
    ? new Date(pgNotice.publishDate).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : legacyNotice!.date;

  return (
    <PageContainer
      title={title}
      subtitle={`Official Municipal Gazette Notification • ${category}`}
      breadcrumbs={[
        { label: "Announcements & Gazette", href: "/notices" },
        { label: title },
      ]}
    >
      <div className="space-y-6">
        {/* Emergency Banner if applicable */}
        {isEmergency && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 text-rose-900 dark:text-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="font-bold text-sm">URGENT CIVIC EMERGENCY ALERT</p>
              <p className="text-xs mt-0.5 text-rose-800 dark:text-rose-300">
                This notice contains critical emergency guidance issued by municipal authorities. Please adhere to the instructions immediately.
              </p>
            </div>
          </div>
        )}

        {/* Metadata badges */}
        <div className="flex flex-wrap items-center gap-3 text-xs pb-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 font-semibold">
            <Tag className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            <span>Category: {category}</span>
          </div>

          <span className="text-gray-300 dark:text-gray-700">•</span>

          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
            <Calendar className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            <span>Published: {publishDate}</span>
          </div>

          {pgNotice && pgNotice.expiryDate && (
            <>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
                <Clock className="w-4 h-4" />
                <span>
                  Valid until:{" "}
                  {new Date(pgNotice.expiryDate).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </>
          )}

          {pgNotice && (
            <>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <div className="flex items-center gap-1.5 text-[#064E4A] dark:text-teal-300 font-semibold">
                <MapPin className="w-4 h-4" />
                <span>
                  Target Scope: {pgNotice.targetScope}{" "}
                  {pgNotice.targetWards ? `(${pgNotice.targetWards})` : ""}
                </span>
              </div>
            </>
          )}

          {pgNotice && (
            <span
              className={`ml-auto text-[10px] font-bold px-2.5 py-0.5 rounded ${
                priority === "Urgent"
                  ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                  : priority === "High"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  : "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300"
              }`}
            >
              Priority: {priority}
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className="space-y-4 text-sm sm:text-base text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line bg-gray-50/50 dark:bg-[#061817]/40 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
          {pgNotice ? (
            <p>{pgNotice.description}</p>
          ) : (
            <>
              {legacyNotice?.titleKn && (
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {legacyNotice.titleKn}
                </p>
              )}
              <p>{legacyNotice?.content}</p>
              {legacyNotice?.contentKn && (
                <p className="text-gray-600 dark:text-gray-400">{legacyNotice.contentKn}</p>
              )}
            </>
          )}
        </div>

        {/* Issued By Signature Card */}
        {pgNotice && (
          <div className="p-4 rounded-xl border border-teal-100 dark:border-teal-900/50 bg-teal-50/30 dark:bg-teal-950/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#064E4A] text-white">
                <Building className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-gray-900 dark:text-gray-100">
                  Issued By: {pgNotice.issuedByName}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  {pgNotice.issuedByDepartment}
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-gray-400">ID: #{pgNotice.id}</span>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-wrap justify-between items-center gap-3">
          <Link
            href="/notices"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#064E4A] dark:text-teal-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Announcements</span>
          </Link>

          <span className="text-[11px] text-gray-400">
            Lakshmeshwar Town Municipal Council Official Gazette
          </span>
        </div>
      </div>
    </PageContainer>
  );
}
