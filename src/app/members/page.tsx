import React from "react";
import { PageContainer } from "@/components/UI/PageContainer";
import { membersData } from "@/data/members";
import { Phone, Mail, MapPin } from "lucide-react";

const categories = [
  "Elected Representatives",
  "Municipal Administration",
  "Engineering",
  "Health",
  "Revenue",
  "Finance",
  "Day-NULM",
  "Legal / Nodal Officers",
  "Advocates",
];

export default function MembersPage() {
  return (
    <PageContainer
      title="Know Your Members"
      subtitle="Elected representatives, municipal officers, staff and legal officials of Lakshmeshwar Town Municipal Council"
      breadcrumbs={[{ label: "Know Your Members" }]}
    >
      <div className="space-y-8">

        {/* Council Information */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#061817] p-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Lakshmeshwar Town Municipal Council
          </h2>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            The information below is compiled from information published by
            the Lakshmeshwar Town Municipal Council.
          </p>

          <div className="mt-4 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
            <MapPin className="w-4 h-4 mt-0.5 text-[#064E4A] dark:text-teal-400" />

            <span>
              Bazar Road, Hulageri Bana, Lakshmishwara,
              <br />
              Gadag District, Karnataka - 582116
            </span>
          </div>
        </div>

        {/* Member Categories */}
        {categories.map((category) => {
          const members = membersData.filter(
            (member) => member.category === category
          );

          if (members.length === 0) return null;

          return (
            <section key={category}>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-[#064E4A] dark:text-teal-300">
                  {category}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#061817] p-5 hover:border-[#064E4A] transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {member.name}
                        </h3>

                        <p className="mt-1 text-sm text-[#064E4A] dark:text-teal-300 font-medium">
                          {member.designation}
                        </p>
                      </div>

                    </div>

                    <div className="mt-4 space-y-2 text-xs text-gray-600 dark:text-gray-300">
                      {member.constituency && (
                        <p>
                          <span className="font-semibold">
                            Constituency:
                          </span>{" "}
                          {member.constituency}
                        </p>
                      )}

                      {member.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span>{member.address}</span>
                        </div>
                      )}

                      {member.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span>{member.phone}</span>
                        </div>
                      )}

                      {member.email && (
                        <div className="flex items-center gap-2 break-all">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span>{member.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        Source: {member.source}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* Information Notice */}
        <div className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-4">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>Information notice:</strong> Personnel and representative
            details are based on the available published municipal information.
            Details may change when official records are updated. Any future
            changes should be verified against authorized municipal records
            before publication.
          </p>
        </div>

      </div>
    </PageContainer>
  );
}