import React from "react";
import Link from "next/link";
import { PageContainer } from "@/components/UI/PageContainer";
import { Network, ExternalLink } from "lucide-react";

export default function SitemapPage() {
  const sections = [
    {
      title: "Main Navigation",
      links: [
        { label: "Home", href: "/" },
        { label: "About Us", href: "/about" },
        { label: "Contact Us", href: "/contact" },
        { label: "Login / Authentication", href: "/login" },
      ],
    },
    {
      title: "Citizen Services & Council",
      links: [
        { label: "Know Your Members", href: "/members" },
        { label: "Citizen Services Portal", href: "/citizen-services" },
        { label: "Applications & Forms", href: "/applications" },
        { label: "Track Application / Grievance Status", href: "/track" },
        { label: "City Demographics & Summary", href: "/city-summary" },
        { label: "Municipal Administration Desk", href: "/admin" },
      ],
    },
    {
      title: "Key Dignitaries & Officials",
      links: [
        { label: "Sri D.K. Shivakumar (Hon'ble Dy. CM)", href: "/officials/dk-shivakumar" },
        { label: "Sri M.C. Sudhakar (Hon'ble Minister)", href: "/officials/mc-sudhakar" },
        { label: "Sri. Sarangappa M (Administrator)", href: "/officials/sarangappa-m" },
        { label: "Sri. Purushottam Gudadinni (Chief Officer)", href: "/officials/purushottam-gudadinni" },
      ],
    },
    {
      title: "Statutory Policies & Citizen Redressal",
      links: [
        { label: "Website Policies", href: "/policies" },
        { label: "Copyright Policy", href: "/copyright-policy" },
        { label: "Hyperlinking Policy", href: "/hyperlinking-policy" },
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Security Policy", href: "/security-policy" },
        { label: "Terms & Conditions", href: "/terms" },
        { label: "Help & FAQs", href: "/help" },
        { label: "Disclaimer", href: "/disclaimer" },
        { label: "Post Back & Suggestions", href: "/feedback" },
      ],
    },
  ];

  return (
    <PageContainer
      title="Portal Sitemap"
      subtitle="Structured directory of all pages, services, and policies in CivSetu"
      breadcrumbs={[{ label: "Sitemap" }]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-3">
            <h2 className="text-base font-bold text-[#064E4A] dark:text-teal-300 pb-1 border-b border-gray-200 dark:border-gray-800">
              {section.title}
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-700 dark:text-gray-300 hover:text-[#064E4A] dark:hover:text-teal-400 hover:underline flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
