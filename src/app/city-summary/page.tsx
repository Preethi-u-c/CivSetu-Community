import React from "react";
import { PageContainer } from "@/components/UI/PageContainer";
import { wardsData } from "@/data/wards";
import { Building2, Users, Map, Droplet, Zap, Landmark } from "lucide-react";

export default function CitySummaryPage() {
  const totalPopulation = wardsData.reduce((acc, w) => acc + w.population, 0);

  return (
    <PageContainer
      title="City Summary & Demographics"
      subtitle="Statistical overview, infrastructure profile, and civic metrics of Lakshmeshwar"
      breadcrumbs={[{ label: "City Summary" }]}
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 rounded-lg text-center">
            <Users className="w-5 h-5 mx-auto text-[#064E4A] dark:text-teal-400 mb-1" />
            <span className="text-[11px] text-gray-500 block">Est. Population</span>
            <span className="text-base font-extrabold text-gray-900 dark:text-gray-100">
              ~38,500
            </span>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg text-center">
            <Map className="w-5 h-5 mx-auto text-amber-700 dark:text-amber-400 mb-1" />
            <span className="text-[11px] text-gray-500 block">Municipal Area</span>
            <span className="text-base font-extrabold text-gray-900 dark:text-gray-100">
              14.2 sq.km
            </span>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-lg text-center">
            <Building2 className="w-5 h-5 mx-auto text-blue-600 dark:text-blue-400 mb-1" />
            <span className="text-[11px] text-gray-500 block">Total Wards</span>
            <span className="text-base font-extrabold text-gray-900 dark:text-gray-100">
              23 Wards
            </span>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-lg text-center">
            <Droplet className="w-5 h-5 mx-auto text-emerald-600 dark:text-emerald-400 mb-1" />
            <span className="text-[11px] text-gray-500 block">Piped Water</span>
            <span className="text-base font-extrabold text-gray-900 dark:text-gray-100">
              88% Coverage
            </span>
          </div>

          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-900 rounded-lg text-center">
            <Zap className="w-5 h-5 mx-auto text-yellow-600 dark:text-yellow-400 mb-1" />
            <span className="text-[11px] text-gray-500 block">Streetlights</span>
            <span className="text-base font-extrabold text-gray-900 dark:text-gray-100">
              1,840 LEDs
            </span>
          </div>

          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 rounded-lg text-center">
            <Landmark className="w-5 h-5 mx-auto text-purple-600 dark:text-purple-400 mb-1" />
            <span className="text-[11px] text-gray-500 block">Monuments</span>
            <span className="text-base font-extrabold text-gray-900 dark:text-gray-100">
              12 ASI Sites
            </span>
          </div>
        </div>

        {/* Wards Distribution Table */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
            Ward Demographics Master Table
          </h2>
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                <tr>
                  <th className="p-2.5">Ward #</th>
                  <th className="p-2.5">Ward Name</th>
                  <th className="p-2.5">Representative</th>
                  <th className="p-2.5">Key Landmarks</th>
                  <th className="p-2.5">Population</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {wardsData.map((w) => (
                  <tr key={w.wardNumber} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="p-2.5 font-bold text-[#064E4A] dark:text-teal-400">
                      Ward {w.wardNumber}
                    </td>
                    <td className="p-2.5 font-semibold text-gray-900 dark:text-gray-100">{w.name}</td>
                    <td className="p-2.5 text-gray-600 dark:text-gray-300">{w.representative}</td>
                    <td className="p-2.5 text-gray-500">{w.landmarks.join(", ")}</td>
                    <td className="p-2.5 font-mono">{w.population}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
