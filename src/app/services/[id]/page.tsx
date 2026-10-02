"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Layers,
  Building,
  ArrowLeft,
  ArrowRight,
  Share2,
  CheckCircle2,
  ExternalLink,
  Clock,
  Phone,
  FileCheck2,
  Award,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Check,
  Copy,
  ChevronRight,
  ListOrdered,
  FileText,
  ShieldCheck,
  Droplets,
  Trash2,
  Home,
  HeartPulse,
  Briefcase,
  AlertTriangle,
} from "lucide-react";
import { CitizenService } from "@/lib/types/services";

export default function ServiceDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [service, setService] = useState<CitizenService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Interactive Document Readiness Checklist
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadService() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/services/${id}`);
        const json = await res.json();
        if (json.success && json.data) {
          setService(json.data);
        } else {
          setError(json.error || "Citizen service not found or currently suspended.");
        }
      } catch (err) {
        console.error("Failed to load service:", err);
        setError("Failed to connect to municipal citizen services database.");
      } finally {
        setLoading(false);
      }
    }
    loadService();
  }, [id]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const toggleDocumentCheck = (doc: string) => {
    setCheckedDocs((prev) => ({
      ...prev,
      [doc]: !prev[doc],
    }));
  };

  const getCategoryIcon = (cat: string) => {
    if (cat.includes("Water")) return Droplets;
    if (cat.includes("Sanitation")) return Trash2;
    if (cat.includes("Property")) return Home;
    if (cat.includes("Birth")) return HeartPulse;
    if (cat.includes("Certificates")) return Award;
    if (cat.includes("Applications")) return Building;
    if (cat.includes("Grievance")) return ShieldCheck;
    if (cat.includes("Emergency")) return AlertTriangle;
    return Briefcase;
  };

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-500">Retrieving municipal service guidelines...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-[800px] mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Service Not Available</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">{error || "The requested service could not be found."}</p>
        <div className="pt-2">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#064E4A] hover:bg-[#0B6B63] text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Services Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  const Icon = getCategoryIcon(service.category);
  const completedDocsCount = service.requiredDocuments.filter((d) => checkedDocs[d]).length;
  const allDocsReady = completedDocsCount === service.requiredDocuments.length && service.requiredDocuments.length > 0;

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-xs font-bold text-teal-800 dark:text-teal-400 hover:text-teal-950 dark:hover:text-teal-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Services Directory</span>
        </Link>

        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Link Copied!" : "Share Service"}</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#064E4A] via-[#085A55] to-[#0B6B63] text-white p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                {service.category}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 bg-teal-800/80 text-teal-100 text-xs font-semibold rounded-full border border-teal-500/40">
                <Clock className="w-3.5 h-3.5 text-teal-300" />
                <span>SLA: {service.expectedTimeline}</span>
              </span>
            </div>

            <span className="text-xs text-teal-200 font-mono">
              Service ID: {service.id}
            </span>
          </div>

          <div className="flex items-start gap-4 pt-1">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white flex-shrink-0">
              <Icon className="w-7 h-7 text-amber-300" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                {service.name}
              </h1>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-teal-100">
                <Building className="w-4 h-4 text-amber-300 flex-shrink-0" />
                <span>{service.department}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Description */}
            <div className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Service Overview & Scope</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {service.description}
              </p>
            </div>

            {/* Eligibility Section */}
            <div className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Citizen Eligibility & Applicability</span>
              </h2>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {service.eligibility}
              </div>
            </div>

            {/* Step-by-Step Procedure */}
            <div className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-teal-600" />
                <span>Official Procedure & Application Steps</span>
              </h2>
              <div className="p-5 bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 rounded-2xl text-xs sm:text-sm text-teal-950 dark:text-teal-100 leading-relaxed whitespace-pre-line">
                {service.procedure}
              </div>
            </div>

            {/* Mandatory Required Documents Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-teal-600" />
                  <span>Mandatory Documents Checklist</span>
                </h2>
                <span className="text-xs font-semibold text-gray-500">
                  {completedDocsCount} of {service.requiredDocuments.length} checked
                </span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 space-y-2.5">
                <p className="text-[11px] text-gray-500 pb-1 border-b border-gray-200 dark:border-gray-700">
                  Tick off the documents in your possession to confirm application readiness before submission:
                </p>

                {service.requiredDocuments.map((doc, idx) => {
                  const isChecked = Boolean(checkedDocs[doc]);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleDocumentCheck(doc)}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer select-none ${
                        isChecked
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-teal-400"
                      }`}
                    >
                      <div className="mt-0.5">
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                        )}
                      </div>
                      <span className={`text-xs font-medium ${isChecked ? "line-through opacity-80" : ""}`}>
                        {doc}
                      </span>
                    </div>
                  );
                })}

                {allDocsReady && (
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs font-bold text-center mt-2">
                    ✓ All mandatory documents are verified! You can proceed with application submission.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Particulars Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 space-y-5">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-100 uppercase tracking-wider pb-2 border-b border-gray-200 dark:border-gray-700">
                Service Parameters
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-xs">Managing Department</span>
                  <strong className="text-gray-900 dark:text-gray-100 font-semibold">{service.department}</strong>
                </div>

                <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-xs">Statutory Timeline (SLA)</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                    <Clock className="w-4 h-4" />
                    <span>{service.expectedTimeline}</span>
                  </strong>
                </div>

                <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-xs">Prescribed Fee</span>
                  <strong className="text-gray-900 dark:text-gray-100 font-semibold">
                    {service.fee || "Free of Cost"}
                  </strong>
                </div>

                <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-xs">Category Classification</span>
                  <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-200">
                    {service.category}
                  </span>
                </div>
              </div>

              {/* Online Application Link CTA */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                {service.onlineApplicationLink ? (
                  service.onlineApplicationLink.startsWith("http") ? (
                    <a
                      href={service.onlineApplicationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow"
                    >
                      <span>Apply on Official Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <Link
                      href={service.onlineApplicationLink}
                      className="w-full py-3 px-4 bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow"
                    >
                      <span>Proceed to Online Application</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )
                ) : (
                  <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl text-center text-xs text-teal-950 dark:text-teal-200">
                    Visit Lakshmeshwar TMC Janaseva Counter to apply in person.
                  </div>
                )}
              </div>
            </div>

            {/* Assistance & Helpline Contact */}
            <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#071d1b] space-y-2 text-xs">
              <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-bold">
                <Phone className="w-4 h-4 text-[#064E4A] dark:text-teal-400" />
                <span>Contact & Officer In-Charge</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {service.contact}
              </p>
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-500">
                Lakshmeshwar Town Municipal Council • Office Hours: 10:00 AM – 5:30 PM
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
