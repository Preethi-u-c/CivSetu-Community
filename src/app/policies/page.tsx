import React from "react";
import Link from "next/link";
import { PageContainer } from "@/components/UI/PageContainer";
import { Shield, Lock, FileText, ExternalLink, Copyright, AlertCircle } from "lucide-react";

export default function PoliciesPage() {
  const policyList = [
    { title: "Copyright Policy", href: "/copyright-policy", icon: Copyright, desc: "Guidelines on reproduction of content and official notices." },
    { title: "Hyperlinking Policy", href: "/hyperlinking-policy", icon: ExternalLink, desc: "Inbound and outbound link regulations for government web resources." },
    { title: "Privacy Policy", href: "/privacy-policy", icon: Shield, desc: "Protection of citizen personal information and data privacy." },
    { title: "Security Policy", href: "/security-policy", icon: Lock, desc: "Technical safeguard measures, encryption, and audit protocols." },
    { title: "Terms and Conditions", href: "/terms", icon: FileText, desc: "Legal framework governing user rights and council liability." },
    { title: "Disclaimer", href: "/disclaimer", icon: AlertCircle, desc: "Accuracy statement and statutory legal disclaimers." },
  ];

  return (
    <PageContainer
      title="Website Policies"
      subtitle="Statutory Guidelines, Governance Standards, and Compliance Framework for CivSetu"
      breadcrumbs={[{ label: "Website Policies" }]}
    >
      <div className="space-y-6">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          CivSetu and the Lakshmeshwar Town Municipal Council adhere to Guidelines for Indian Government
          Websites (GIGW) to deliver secure, transparent, accessible, and citizen-friendly services.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policyList.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-[#064E4A] hover:shadow-sm transition flex items-start gap-3 bg-gray-50/50 dark:bg-gray-800/40"
              >
                <div className="p-2 rounded bg-teal-100 dark:bg-teal-950 text-[#064E4A] dark:text-teal-300 flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">{item.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
