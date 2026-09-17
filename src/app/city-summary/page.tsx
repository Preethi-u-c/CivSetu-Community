import React from "react";
import { PageContainer } from "@/components/UI/PageContainer";
import {
  Users,
  Map,
  Building2,
  Home,
  UserRound,
  Baby,
  GraduationCap,
  MapPin,
} from "lucide-react";

const wardPopulation = [
  { ward: 1, population: 1993 },
  { ward: 2, population: 1752 },
  { ward: 3, population: 1108 },
  { ward: 4, population: 1208 },
  { ward: 5, population: 1309 },
  { ward: 6, population: 1242 },
  { ward: 7, population: 1084 },
  { ward: 8, population: 1551 },
  { ward: 9, population: 1412 },
  { ward: 10, population: 1347 },
  { ward: 11, population: 1413 },
  { ward: 12, population: 1284 },
  { ward: 13, population: 1176 },
  { ward: 14, population: 1754 },
  { ward: 15, population: 1106 },
  { ward: 16, population: 3531 },
  { ward: 17, population: 1661 },
  { ward: 18, population: 1451 },
  { ward: 19, population: 1871 },
  { ward: 20, population: 746 },
  { ward: 21, population: 1453 },
  { ward: 22, population: 3065 },
  { ward: 23, population: 2237 },
];

export default function CitySummaryPage() {
  return (
    <PageContainer
      title="City Summary & Demographics"
      subtitle="Statistical overview and civic profile of Lakshmeshwar"
      breadcrumbs={[{ label: "City Summary" }]}
    >
      <div className="space-y-6">

        {/* City Introduction */}
        <section className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <h2 className="text-lg font-bold text-[#064E4A] dark:text-teal-300 mb-3">
            About Lakshmeshwar
          </h2>

          <p className="text-sm leading-7 text-gray-700 dark:text-gray-300">
            Lakshmeshwar is a historic town and taluk headquarters in Gadag
            district of Karnataka. The town is known for its rich heritage,
            historic temples, traditional architecture and long-standing
            cultural importance in the region. Lakshmeshwar is administered by
            the Lakshmeshwar Town Municipal Council and is divided into 23
            municipal wards. The town serves as an important local centre for
            administration, commerce, education and civic services in the
            surrounding area.
          </p>
        </section>

        {/* Location Information */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
            Administrative Details
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">

            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <MapPin className="w-5 h-5 text-[#064E4A] mb-2" />
              <span className="text-xs text-gray-500 block">
                Town
              </span>
              <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
                Lakshmeshwar
              </span>
            </div>

            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <Building2 className="w-5 h-5 text-[#064E4A] mb-2" />
              <span className="text-xs text-gray-500 block">
                Taluk
              </span>
              <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
                Lakshmeshwar
              </span>
            </div>

            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <Map className="w-5 h-5 text-[#064E4A] mb-2" />
              <span className="text-xs text-gray-500 block">
                District
              </span>
              <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
                Gadag
              </span>
            </div>

            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <Map className="w-5 h-5 text-[#064E4A] mb-2" />
              <span className="text-xs text-gray-500 block">
                State
              </span>
              <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
                Karnataka
              </span>
            </div>

            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <MapPin className="w-5 h-5 text-[#064E4A] mb-2" />
              <span className="text-xs text-gray-500 block">
                PIN Code
              </span>
              <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
                582116
              </span>
            </div>

          </div>
        </section>

        {/* Population Metrics */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
            Population & Demographics
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">

            {/* Population */}
            <div className="p-4 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900">
              <Users className="w-5 h-5 text-[#064E4A] dark:text-teal-400 mb-2" />
              <span className="text-xs text-gray-500 block">
                Population
              </span>
              <span className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
                36,754
              </span>
            </div>

            {/* Households */}
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
              <Home className="w-5 h-5 text-amber-700 dark:text-amber-400 mb-2" />
              <span className="text-xs text-gray-500 block">
                Households
              </span>
              <span className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
                7,771
              </span>
            </div>

            {/* Wards */}
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
              <span className="text-xs text-gray-500 block">
                Municipal Wards
              </span>
              <span className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
                23
              </span>
            </div>

            {/* Sex Ratio */}
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900">
              <UserRound className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-2" />
              <span className="text-xs text-gray-500 block">
                Sex Ratio
              </span>
              <span className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
                1,000
              </span>
            </div>

            {/* Male */}
            <div className="p-4 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900">
              <UserRound className="w-5 h-5 text-sky-600 dark:text-sky-400 mb-2" />
              <span className="text-xs text-gray-500 block">
                Male Population
              </span>
              <span className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
                18,378
              </span>
            </div>

            {/* Female */}
            <div className="p-4 rounded-lg bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-900">
              <UserRound className="w-5 h-5 text-pink-600 dark:text-pink-400 mb-2" />
              <span className="text-xs text-gray-500 block">
                Female Population
              </span>
              <span className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
                18,376
              </span>
            </div>

            {/* Children */}
            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900">
              <Baby className="w-5 h-5 text-orange-600 dark:text-orange-400 mb-2" />
              <span className="text-xs text-gray-500 block">
                Children (0–6)
              </span>
              <span className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
                4,288
              </span>
            </div>

            {/* Literacy */}
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
              <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-2" />
              <span className="text-xs text-gray-500 block">
                Literacy Rate
              </span>
              <span className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
                78.42%
              </span>
            </div>

          </div>
        </section>

        {/* Ward Population Table */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
            Ward-wise Population
          </h2>

          <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-lg">
            <table className="w-full text-left text-sm">

              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                <tr>
                  <th className="p-3">
                    Ward
                  </th>

                  <th className="p-3">
                    Population
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">

                {wardPopulation.map((item) => (
                  <tr
                    key={item.ward}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/40"
                  >
                    <td className="p-3 font-semibold text-[#064E4A] dark:text-teal-400">
                      Ward {item.ward}
                    </td>

                    <td className="p-3 font-mono text-gray-700 dark:text-gray-300">
                      {item.population.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}

              </tbody>

            </table>
          </div>
        </section>

        {/* Civic Administration */}
        <section className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <h2 className="text-lg font-bold text-[#064E4A] dark:text-teal-300 mb-3">
            Civic Administration
          </h2>

          <p className="text-sm leading-7 text-gray-700 dark:text-gray-300">
            Lakshmeshwar is administered by the Lakshmeshwar Town Municipal
            Council (TMC). The municipal area is divided into 23 wards for
            local civic administration and representation. The Town Municipal
            Council is responsible for providing and maintaining essential
            civic services and infrastructure for residents of Lakshmeshwar.
          </p>
        </section>

      </div>
    </PageContainer>
  );
}