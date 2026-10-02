"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Layers,
  Search,
  Building,
  ArrowRight,
  RefreshCw,
  Clock,
  Phone,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Filter,
  FileCheck2,
  Droplets,
  Trash2,
  Home,
  HeartPulse,
  Award,
  AlertTriangle,
  Briefcase,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import {
  CitizenService,
  SERVICE_CATEGORIES,
  SERVICE_DEPARTMENTS,
  ServiceCategory,
} from "@/lib/types/services";

function ServicesContent() {
  const searchParams = useSearchParams();

  const urlCategory = searchParams?.get("category") || "ALL";
  const urlDepartment = searchParams?.get("department") || "ALL";

  const [services, setServices] = useState<CitizenService[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [selectedDepartment, setSelectedDepartment] = useState(urlDepartment);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== "ALL") params.set("category", activeCategory);
      if (selectedDepartment !== "ALL") params.set("department", selectedDepartment);
      if (search.trim()) params.set("search", search.trim());
      params.set("limit", "50");

      const res = await fetch(`/api/services?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setServices(json.data);
      }
    } catch (err) {
      console.error("Failed to load citizen services:", err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, selectedDepartment, search]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

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

  const getCategoryTheme = (cat: string) => {
    if (cat.includes("Water")) {
      return {
        badge: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200",
        iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
      };
    }
    if (cat.includes("Sanitation")) {
      return {
        badge: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-200",
        iconBg: "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400",
      };
    }
    if (cat.includes("Property")) {
      return {
        badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200",
        iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
      };
    }
    if (cat.includes("Birth")) {
      return {
        badge: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200",
        iconBg: "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400",
      };
    }
    if (cat.includes("Certificates")) {
      return {
        badge: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200",
        iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
      };
    }
    if (cat.includes("Emergency")) {
      return {
        badge: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200",
        iconBg: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
      };
    }
    return {
      badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200",
      iconBg: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400",
    };
  };

  return (
    <div className="max-w-[1380px] mx-auto px-4 py-6 space-y-8">
      {/* Editorial Header */}
      <div className="bg-gradient-to-r from-[#064E4A] to-[#0B6B63] text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-teal-200 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Lakshmeshwar Town Municipal Council • Citizen Services Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Municipal Citizen Services & Utilities
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            Access transparent municipal procedures, statutory turnaround times (SLA), eligibility guidelines, document checklists, and application links for all municipal utilities in Lakshmeshwar.
          </p>
        </div>

        {/* Quick Access Badges */}
        <div className="mt-5 pt-4 border-t border-teal-600/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-teal-200 block text-[11px]">Catalog Services</span>
            <strong className="text-base text-white font-bold">{services.length} Public Services</strong>
          </div>
          <div>
            <span className="text-teal-200 block text-[11px]">Online Tracking</span>
            <strong className="text-base text-white font-bold">Real-Time SLA</strong>
          </div>
          <div>
            <span className="text-teal-200 block text-[11px]">Emergency Hotline</span>
            <strong className="text-base text-white font-bold">24x7 Desk (08378-220034)</strong>
          </div>
          <div>
            <span className="text-teal-200 block text-[11px]">Service Center</span>
            <strong className="text-base text-white font-bold">TMC Janaseva Counter</strong>
          </div>
        </div>
      </div>

      {/* Emergency Alert Ribbon */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200 font-semibold">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            Facing an urgent civic breakdown like burst drinking water pipe, fallen tree, or clogged drainage?
          </span>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
          <Link
            href="/complaints/new"
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition"
          >
            Lodge Urgent Grievance
          </Link>
          <a
            href="tel:08378220034"
            className="px-3 py-1.5 border border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-800 text-amber-900 dark:text-amber-200 font-bold rounded-lg hover:bg-amber-100 transition"
          >
            Call 08378-220034
          </a>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search service name, procedure, department, or required documents..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
            >
              <option value="ALL">All Categories</option>
              {SERVICE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Department Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
            >
              <option value="ALL">All Departments</option>
              {SERVICE_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-gray-400 text-[11px] font-semibold flex items-center gap-1 flex-shrink-0 mr-1">
            <Filter className="w-3 h-3" /> Quick filters:
          </span>
          <button
            onClick={() => setActiveCategory("ALL")}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap transition text-xs font-semibold ${
              activeCategory === "ALL"
                ? "bg-[#064E4A] text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            All Services
          </button>
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition text-xs font-semibold ${
                activeCategory === cat
                  ? "bg-[#064E4A] text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#064E4A] dark:text-teal-400 animate-spin mx-auto" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading citizen services catalog...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base">
            No citizen services found matching your criteria
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Try adjusting your search query or choosing another service category.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setActiveCategory("ALL");
                setSelectedDepartment("ALL");
                setSearch("");
              }}
              className="px-4 py-2 bg-[#064E4A] hover:bg-[#0B6B63] text-white rounded-lg text-xs font-semibold transition"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = getCategoryIcon(service.category);
            const theme = getCategoryTheme(service.category);

            return (
              <div
                key={service.id}
                className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Category Badge & SLA Timeline */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${theme.badge}`}
                    >
                      {service.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      {service.expectedTimeline}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-3 pt-1">
                    <div className={`p-2.5 rounded-xl border border-gray-200/60 dark:border-gray-700/60 ${theme.iconBg} flex-shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100 group-hover:text-[#064E4A] dark:group-hover:text-teal-300 transition leading-snug">
                        {service.name}
                      </h3>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-teal-600" />
                        <span className="truncate max-w-[200px]">{service.department}</span>
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Fee & Eligibility Snippet */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400 font-semibold">Statutory Fee:</span>
                      <strong className="text-gray-800 dark:text-gray-200">{service.fee || "Free of Cost"}</strong>
                    </div>
                    <div className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2">
                      <span className="text-gray-400 font-semibold mr-1">Eligibility:</span>
                      {service.eligibility}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1 text-[11px]">
                      <FileCheck2 className="w-3.5 h-3.5 text-teal-600" />
                      <strong>{service.requiredDocuments.length}</strong> required documents
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">{service.id}</span>
                  </div>

                  <Link
                    href={`/services/${service.id}`}
                    className="w-full py-2.5 px-4 bg-gray-50 hover:bg-[#064E4A] hover:text-white dark:bg-gray-800/80 dark:hover:bg-[#064E4A] text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 group-hover:bg-[#064E4A] group-hover:text-white shadow-sm"
                  >
                    <span>View Guidelines & How to Apply</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1380px] mx-auto px-4 py-16 text-center">
          <RefreshCw className="w-8 h-8 text-[#064E4A] animate-spin mx-auto" />
        </div>
      }
    >
      <ServicesContent />
    </Suspense>
  );
}
