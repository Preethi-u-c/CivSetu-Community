"use client";

import React from "react";
import Link from "next/link";
import {
  FileCheck,
  Network,
  Copyright,
  ExternalLink,
  ShieldCheck,
  Lock,
  FileText,
  HelpCircle,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { siteConfig } from "@/data/siteConfig";
import { useAccessibility } from "@/context/AccessibilityContext";

export const Footer: React.FC = () => {
  const { t, language } = useAccessibility();
  const isKn = language === "kn";
  const { footerAttribution } = siteConfig;

  const policyLinks = [
    { name: t.policy.websitePolicies, href: "/policies", icon: FileCheck },
    { name: t.policy.sitemap, href: "/sitemap", icon: Network },
    { name: t.policy.copyrightPolicy, href: "/copyright-policy", icon: Copyright },
    { name: t.policy.hyperlinkingPolicy, href: "/hyperlinking-policy", icon: ExternalLink },
    { name: t.policy.privacyPolicy, href: "/privacy-policy", icon: ShieldCheck },
    { name: t.policy.securityPolicy, href: "/security-policy", icon: Lock },
    { name: t.policy.termsAndConditions, href: "/terms", icon: FileText },
    { name: t.policy.help, href: "/help", icon: HelpCircle },
    { name: t.policy.disclaimer, href: "/disclaimer", icon: AlertCircle },
    { name: t.policy.feedback, href: "/feedback", icon: MessageSquare },
  ];

  return (
    <footer className="w-full mt-10">
      {/* 9. Website Policy Bar */}
      <div className="bg-[#064E4A] dark:bg-[#031d1c] text-white py-2.5 px-4 border-t border-teal-800">
        <div className="max-w-[1380px] mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px] sm:text-xs">
          {policyLinks.map((link, idx) => {
            const Icon = link.icon;
            return (
              <React.Fragment key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center gap-1 hover:text-amber-300 transition-colors text-gray-100 whitespace-nowrap"
                >
                  <Icon className="w-3.5 h-3.5 opacity-90" />
                  <span>{link.name}</span>
                </Link>
                {idx < policyLinks.length - 1 && (
                  <span className="text-teal-400/60 select-none">|</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 10. Final Ownership & Developer Footer */}
      <div className="bg-[#022422] dark:bg-[#011110] text-gray-200 py-8 px-4 text-center text-xs relative overflow-hidden">
        {/* Subtle decorative architectural backdrop */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative max-w-[1000px] mx-auto space-y-2 leading-relaxed">
          <p className="font-semibold text-gray-100 uppercase tracking-wide">
            CONTENT OWNED AND MAINTAINED BY: {footerAttribution.contentOwnedBy}
          </p>
          <p className="text-gray-300">
            Designed and Developed by: {footerAttribution.developedBy}
          </p>
          <div className="pt-2 text-gray-400 space-y-0.5 text-[11px]">
            <p>
              For any suggestions and complaints contact: {footerAttribution.contactPerson},
            </p>
            <p className="font-semibold text-gray-200 uppercase">
              {footerAttribution.councilName},
            </p>
            <p>
              Contact Number:{" "}
              <a
                href={`tel:${footerAttribution.contactNumber}`}
                className="text-amber-400 hover:underline"
              >
                {footerAttribution.contactNumber}
              </a>
              , e-mail :{" "}
              <a
                href={`mailto:${footerAttribution.email}`}
                className="text-amber-400 hover:underline"
              >
                {footerAttribution.email}
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
