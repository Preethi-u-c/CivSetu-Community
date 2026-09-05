import React from "react";
import { PageContainer } from "@/components/UI/PageContainer";
import { wardsData } from "@/data/wards";
import { Users, Phone, MapPin } from "lucide-react";

export default function MembersPage() {
  return (
    <PageContainer
      title="Know Your Members"
      subtitle="Elected Council Representatives, Ward Corporators, and Committee Leads of Lakshmeshwar TMC"
      breadcrumbs={[{ label: "Know Your Members" }]}
    >
      <div className="space-y-6">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          The Lakshmeshwar Town Municipal Council comprises elected members and designated ward
          representatives dedicated to civic governance, public infrastructure, and ward welfare.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wardsData.map((ward) => (
            <div
              key={ward.wardNumber}
              className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#061817] hover:border-[#064E4A] transition"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
                <span className="font-bold text-[#064E4A] dark:text-teal-300">
                  Ward {ward.wardNumber}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 font-semibold">
                  Pop: {ward.population}
                </span>
              </div>
              <div className="mt-3 space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {ward.representative}
                </p>
                <p className="text-gray-500 dark:text-gray-400">{ward.name}</p>
                <div className="flex items-center gap-1.5 pt-1 text-[#064E4A] dark:text-teal-400">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{ward.contact}</span>
                </div>
                <div className="text-[11px] text-gray-500 pt-1">
                  <span className="font-medium">Key Areas:</span> {ward.landmarks.join(", ")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
