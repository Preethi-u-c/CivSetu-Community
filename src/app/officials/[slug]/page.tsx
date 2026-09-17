import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { officials } from "@/data/officials";
import { PageContainer } from "@/components/UI/PageContainer";
import { Mail, Phone, Building } from "lucide-react";

export function generateStaticParams() {
  return officials.map((official) => ({
    slug: official.slug,
  }));
}

export default function OfficialDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const official = officials.find((o) => o.slug === params.slug);

  if (!official) {
    notFound();
  }

  return (
    <PageContainer
      title={official.name}
      subtitle={`${official.designation} - ${official.department}`}
      breadcrumbs={[
        { label: "Key Officials", href: "/#officials" },
        { label: official.name },
      ]}
    >
      <div className="flex flex-col md:flex-row gap-8 items-start">

        {/* REAL PROFILE PHOTO */}
        <div className="w-full md:w-56 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-center flex-shrink-0">

          <div className="relative w-32 h-40 mx-auto rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 mb-3 shadow-sm">

            <Image
              src={official.image}
              alt={official.name}
              fill
              sizes="128px"
              className="object-cover"
              priority
            />

          </div>

          <h2 className="font-bold text-sm text-gray-900 dark:text-gray-100">
            {official.name}
          </h2>

          <p className="text-xs text-[#064E4A] dark:text-teal-400 font-semibold mt-0.5">
            {official.designation}
          </p>

        </div>

        {/* Biography & Official Mandate */}
        <div className="flex-1 space-y-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">

          <div>
            <h3 className="text-base font-bold text-[#064E4A] dark:text-teal-300 mb-1">
              Official Profile & Portfolio
            </h3>

            <p>{official.bio}</p>
          </div>

          {/* Contact Information */}
          <div className="p-4 rounded-lg bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900 space-y-2 text-xs sm:text-sm">

            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-[#064E4A] dark:text-teal-400 flex-shrink-0" />

              <span>
                <strong>Office:</strong> {official.office}
              </span>
            </div>

            {official.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#064E4A] dark:text-teal-400 flex-shrink-0" />

                <span>
                  <strong>Phone:</strong> {official.phone}
                </span>
              </div>
            )}

            {official.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#064E4A] dark:text-teal-400 flex-shrink-0" />

                <span>
                  <strong>Email:</strong> {official.email}
                </span>
              </div>
            )}

          </div>

        </div>
      </div>
    </PageContainer>
  );
}