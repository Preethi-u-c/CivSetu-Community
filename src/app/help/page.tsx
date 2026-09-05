import React from "react";
import { PageContainer } from "@/components/UI/PageContainer";
import { HelpCircle, Phone, Search, FileText } from "lucide-react";
import { siteConfig } from "@/data/siteConfig";

export default function HelpPage() {
  const faqs = [
    {
      q: "How can I register a citizen complaint regarding water supply or streetlights?",
      a: "You can submit an online grievance directly on the Contact Us page, call the municipal helpline (08382-272077), or dial PIGRS 1902. When submitted online, you receive an immediate statutory tracking ID (e.g. LMC-GRV-2026-XXXX) which can be tracked on the Status Tracker.",
    },
    {
      q: "Where can I download municipal application forms for property tax or NOC?",
      a: "Navigate to 'Applications for various services' from the homepage or visit the Applications section to download PDF forms for water connection, building plans, and trade licenses.",
    },
    {
      q: "How do I toggle the language to Kannada?",
      a: "Use the 'ಕನ್ನಡ' button located on the top accessibility utility bar on any page. You can switch back to English at any time.",
    },
    {
      q: "How do I change the font size for better readability?",
      a: "Click on 'A-' to decrease text size, 'A' for standard size, or 'A+' to enlarge font size on the top utility bar.",
    },
  ];

  return (
    <PageContainer
      title="Help & Frequently Asked Questions (FAQ)"
      subtitle="Assistance with portal navigation, civic services, and helpline instructions"
      breadcrumbs={[{ label: "Help" }]}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 space-y-1.5"
            >
              <h2 className="text-sm sm:text-base font-bold text-[#064E4A] dark:text-teal-300 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>{faq.q}</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 pl-6 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">Need Immediate Help?</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Call the official municipal control room or PIGRS toll-free number.
            </p>
          </div>
          <a
            href={`tel:${siteConfig.pigrsNumber}`}
            className="px-4 py-2 bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-bold rounded-lg shadow-sm"
          >
            Call {siteConfig.pigrsNumber}
          </a>
        </div>
      </div>
    </PageContainer>
  );
}
