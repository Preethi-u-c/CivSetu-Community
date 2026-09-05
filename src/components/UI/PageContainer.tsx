"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface PageContainerProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  breadcrumbs = [],
  children,
}) => {
  return (
    <div className="max-w-[1380px] mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
        <Link href="/" className="hover:text-[#064E4A] flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-[#064E4A]">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-gray-800 dark:text-gray-200 font-semibold">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Page Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064E4A] dark:text-[#2DD4BF]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-[#071f1d] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
};
