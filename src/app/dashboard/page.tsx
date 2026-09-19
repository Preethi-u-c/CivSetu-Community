"use client";

import React from "react";
import Link from "next/link";
import { PageContainer } from "@/components/UI/PageContainer";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Home,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  LogOut,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  PlusCircle,
} from "lucide-react";

export default function DashboardPage() {
  const { citizen, loading, isAuthenticated, logout } = useAuth();

  // Loading state
  if (loading) {
    return (
      <PageContainer
        title="Citizen Portal"
        subtitle="Loading your official municipal account profile..."
        breadcrumbs={[{ label: "Citizen Portal" }]}
      >
        <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-[#064E4A] dark:text-teal-400 animate-spin mx-auto" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Connecting to Lakshmeshwar TMC citizen services...
          </p>
        </div>
      </PageContainer>
    );
  }

  // Unauthenticated State
  if (!isAuthenticated || !citizen) {
    return (
      <PageContainer
        title="Citizen Portal"
        subtitle="Official Citizen Services Gateway - Lakshmeshwar Town Municipal Council"
        breadcrumbs={[{ label: "Citizen Portal" }]}
      >
        <div className="max-w-md mx-auto py-8">
          <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-sm">
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/60 rounded-full flex items-center justify-center mx-auto text-amber-700 dark:text-amber-300">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Authentication Required
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Please log in to your registered CivSetu citizen account to access your personal dashboard and municipal applications.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/login"
                className="bg-[#064E4A] hover:bg-[#0B6B63] text-white px-6 py-2.5 rounded-lg text-sm font-bold transition shadow-sm"
              >
                Sign In to Account
              </Link>
              <Link
                href="/register"
                className="border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 px-6 py-2.5 rounded-lg text-sm font-semibold transition"
              >
                Register Citizen
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Authenticated Citizen Portal Placeholder Route
  return (
    <PageContainer
      title="Citizen Portal Dashboard"
      subtitle={`Welcome, ${citizen.fullName} | Lakshmeshwar Town Municipal Council`}
      breadcrumbs={[{ label: "Citizen Portal" }]}
    >
      <div className="max-w-3xl mx-auto py-2 sm:py-4 space-y-6">
        {/* Grievance Action Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-900 to-[#064E4A] text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Lodge an Official Municipal Grievance
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-400/20 text-teal-200 border border-teal-400/30">
                  Phase 4 Active
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-teal-100/90 leading-relaxed max-w-xl">
                Report drinking water pipeline leaks, dark streetlights, overflowing garbage, or road potholes directly to Lakshmeshwar TMC engineering sections with SLA deadline tracking.
              </p>
            </div>
          </div>
          <Link
            href="/complaints/new"
            className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-teal-50 text-[#064E4A] font-bold text-xs sm:text-sm rounded-xl transition shadow flex items-center justify-center gap-2 flex-shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-[#064E4A]" />
            <span>Register Complaint</span>
          </Link>
        </div>

        {/* Authenticated Citizen Profile Summary Card */}
        <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#064E4A] text-white flex items-center justify-center font-bold text-lg">
                {citizen.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base sm:text-lg">
                  {citizen.fullName}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                  ID: {citizen.id}
                </p>
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg text-xs font-semibold transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
              <Phone className="w-4 h-4 text-[#064E4A] dark:text-teal-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-[11px] font-medium">Registered Mobile</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">+91 {citizen.mobileNumber}</span>
                  {citizen.mobileVerified && (
                    <span title="Verified">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
              <Mail className="w-4 h-4 text-[#064E4A] dark:text-teal-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-[11px] font-medium">Email Address</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{citizen.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
              <MapPin className="w-4 h-4 text-[#064E4A] dark:text-teal-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-[11px] font-medium">Jurisdiction Ward</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{citizen.wardNumber}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
              <Home className="w-4 h-4 text-[#064E4A] dark:text-teal-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-[11px] font-medium">Residential Address</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{citizen.residentialAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Civic Quick Navigation */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Available Citizen Portals & Services
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              href="/complaints/new"
              className="p-4 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/30 hover:border-[#064E4A] dark:hover:border-teal-400 transition shadow-sm group"
            >
              <div className="flex items-center justify-between">
                <PlusCircle className="w-5 h-5 text-[#064E4A] dark:text-teal-400" />
                <ArrowRight className="w-4 h-4 text-teal-600 group-hover:translate-x-0.5 transition" />
              </div>
              <p className="mt-3 font-bold text-sm text-[#064E4A] dark:text-teal-200">Register Grievance</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Lodge civic issue with TMC SLA resolution
              </p>
            </Link>

            <Link
              href="/track"
              className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#071d1b] hover:border-[#064E4A] dark:hover:border-teal-400 transition shadow-sm group"
            >
              <div className="flex items-center justify-between">
                <Search className="w-5 h-5 text-[#064E4A] dark:text-teal-400" />
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#064E4A] dark:group-hover:text-teal-400 transition" />
              </div>
              <p className="mt-3 font-bold text-sm text-gray-900 dark:text-gray-100">Track Grievance</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Live lookup of filed applications by ID
              </p>
            </Link>

            <Link
              href="/citizen-services"
              className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#071d1b] hover:border-[#064E4A] dark:hover:border-teal-400 transition shadow-sm group"
            >
              <div className="flex items-center justify-between">
                <FileText className="w-5 h-5 text-[#064E4A] dark:text-teal-400" />
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#064E4A] dark:group-hover:text-teal-400 transition" />
              </div>
              <p className="mt-3 font-bold text-sm text-gray-900 dark:text-gray-100">Municipal Services</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Browse official TMC civic programs & utilities
              </p>
            </Link>

            <Link
              href="/wards"
              className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#071d1b] hover:border-[#064E4A] dark:hover:border-teal-400 transition shadow-sm group"
            >
              <div className="flex items-center justify-between">
                <MapPin className="w-5 h-5 text-[#064E4A] dark:text-teal-400" />
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#064E4A] dark:group-hover:text-teal-400 transition" />
              </div>
              <p className="mt-3 font-bold text-sm text-gray-900 dark:text-gray-100">Ward Details</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                View 23 Lakshmeshwar TMC ward jurisdictions
              </p>
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
