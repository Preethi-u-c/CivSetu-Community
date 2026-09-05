import React from "react";
import { PageContainer } from "@/components/UI/PageContainer";
import { siteConfig } from "@/data/siteConfig";
import { Landmark, Shield, Users, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <PageContainer
      title="About Lakshmeshwar Town Municipal Council"
      subtitle="History, Governance, and Civic Mission of Lakshmeshwar (ಪುರಸಭೆ ಲಕ್ಷ್ಮೇಶ್ವರ)"
      breadcrumbs={[{ label: "About Us" }]}
    >
      <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
        <section>
          <h2 className="text-xl font-bold text-[#064E4A] dark:text-teal-300 mb-2">
            Historical & Cultural Heritage
          </h2>
          <p>
            Lakshmeshwar is a historic town in Gadag district, Karnataka, renowned for its ancient
            monuments, temples, and inscriptions dating back to the Kalyana Chalukyas and Seuna (Yadava)
            dynasties. Famed for the Someshwara temple complex, Jain basadis, and rich literary traditions,
            it holds deep historical significance in North Karnataka.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="p-4 rounded-lg bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 flex items-start gap-3">
            <Landmark className="w-6 h-6 text-[#064E4A] dark:text-teal-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Municipal Governance</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                The Town Municipal Council administers 23 wards across the municipal limits, ensuring
                essential infrastructure, clean roads, water networks, and street lighting.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-3">
            <Shield className="w-6 h-6 text-amber-700 dark:text-amber-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">CivSetu Initiative</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                CivSetu is our flagship transparent digital portal designed to bridge the connection
                between municipal authorities and citizens, providing seamless service delivery.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#064E4A] dark:text-teal-300 mb-2">
            Administrative Structure
          </h2>
          <p>
            Under the Urban Development Department, Government of Karnataka, Lakshmeshwar TMC is guided by
            the Administrator and headed operationally by the Chief Officer. The council works in close
            synergy with district administration in Gadag to deliver welfare schemes, Jalashri Kalyana water
            projects, and urban environmental sustainability.
          </p>
        </section>
      </div>
    </PageContainer>
  );
}
