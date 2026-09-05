import React from "react";
import Link from "next/link";
import { PageContainer } from "@/components/UI/PageContainer";
import {
  Droplets,
  Home,
  FileBadge,
  Lightbulb,
  Trash2,
  HeartPulse,
  ArrowRight,
} from "lucide-react";

export default function CitizenServicesPage() {
  const services = [
    {
      title: "Drinking Water Supply & Metering",
      desc: "Apply for new piped water connections, meter inspections, leak reporting, and monthly bill pay.",
      icon: Droplets,
      badge: "Essential",
      color: "text-blue-600",
    },
    {
      title: "Property Tax & Khata Services",
      desc: "Self-assessment property tax payments, Form-3 / Sasya Khata extract downloads, and ownership transfer.",
      icon: Home,
      badge: "Revenue",
      color: "text-emerald-600",
    },
    {
      title: "Trade License & Commercial Registrations",
      desc: "Issue and renewal of shop and establishment licenses under Karnataka Municipalities Act.",
      icon: FileBadge,
      badge: "Commerce",
      color: "text-amber-600",
    },
    {
      title: "Street Lighting & Maintenance",
      desc: "Report non-functional streetlights, LED replacements, and new pole installation requests.",
      icon: Lightbulb,
      badge: "Public Works",
      color: "text-yellow-600",
    },
    {
      title: "Solid Waste Management & Sanitation",
      desc: "Door-to-door waste collection schedules, commercial waste disposal, and drainage cleaning drives.",
      icon: Trash2,
      badge: "Sanitation",
      color: "text-teal-600",
    },
    {
      title: "Birth & Death Registration",
      desc: "Online certificate download, corrections in registrar records, and delayed event registration.",
      icon: HeartPulse,
      badge: "Civil Registry",
      color: "text-rose-600",
    },
  ];

  return (
    <PageContainer
      title="Citizen Services"
      subtitle="Public Municipal Services & Utilities provided by Lakshmeshwar Town Municipal Council"
      breadcrumbs={[{ label: "Citizen Services" }]}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 p-3 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-xs">
        <span className="text-gray-700 dark:text-gray-300">
          Need to submit a municipal form or check on a previously filed service request?
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/applications"
            className="font-bold text-[#064E4A] dark:text-teal-300 hover:underline"
          >
            Apply Online →
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href="/track"
            className="font-bold text-[#064E4A] dark:text-teal-300 hover:underline"
          >
            Track Status →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#061817] hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
                    <Icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {item.badge}
                  </span>
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {item.title}
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <Link
                href="/applications"
                className="mt-4 flex items-center justify-between w-full pt-3 border-t border-gray-200 dark:border-gray-800 text-xs font-bold text-[#064E4A] dark:text-teal-300 hover:text-[#B98519] transition"
              >
                <span>Access Service & Apply</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}
