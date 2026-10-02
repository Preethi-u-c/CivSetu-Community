"use client";

import React from "react";
import Link from "next/link";
import { Users, UserCheck, Briefcase, FileText } from "lucide-react";
import { QuickService } from "@/data/services";
import { useAccessibility } from "@/context/AccessibilityContext";

interface QuickServiceCardProps {
  service: QuickService;
}

export const QuickServiceCard: React.FC<QuickServiceCardProps> = ({ service }) => {
  const { language } = useAccessibility();
  const isKn = language === "kn";

  const getBgColor = (id: string) => {
    switch (id) {
      case "members":
        return "bg-[#064E4A]";
      case "citizen-services":
        return "bg-[#3F6212]"; // Deep Olive Green
      case "applications":
        return "bg-[#B45309]"; // Amber / Warm Brown
      case "city-summary":
        return "bg-[#0F766E]"; // Teal / Cyan
      default:
        return "bg-[#064E4A]";
    }
  };

  const renderIcon = () => {
    switch (service.iconName) {
      case "Users":
        return <Users className="w-6 h-6 text-white" />;
      case "UserCheck":
        return <UserCheck className="w-6 h-6 text-white" />;
      case "Briefcase":
        return <Briefcase className="w-6 h-6 text-white" />;
      case "FileText":
        return <FileText className="w-6 h-6 text-white" />;
      default:
        return <FileText className="w-6 h-6 text-white" />;
    }
  };

  return (
    <Link
      href={service.href}
      prefetch={true}
      className="group block bg-white dark:bg-[#071f1d] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-[#064E4A]/40 transition-all"
    >
      <div className="flex items-center gap-4">
        {/* Circular Colored Icon Badge */}
        <div
          className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform ${getBgColor(
            service.id
          )}`}
        >
          {renderIcon()}
        </div>

        {/* Service Title */}
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-[#064E4A] dark:group-hover:text-teal-300 transition-colors leading-tight">
            {isKn ? service.titleKn : service.title}
          </h2>
        </div>
      </div>
    </Link>
  );
};
