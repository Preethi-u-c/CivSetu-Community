import React from "react";
import { PageContainer } from "@/components/UI/PageContainer";
import { wardsData } from "@/data/wards";
import { Users, MapPin } from "lucide-react";

export default function WardsPage() {
    return (
        <PageContainer
            title="Know Your Wards"
            subtitle="Administrative wards and population information of Lakshmeshwar Town Municipal Council"
            breadcrumbs={[{ label: "Know Your Wards" }]}
        >
            <div className="space-y-6">

                {/* Council Information */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#061817] p-5">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Lakshmeshwar Town Municipal Council
                    </h2>

                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        This section provides ward-wise population information for the
                        administrative wards of Lakshmeshwar Town Municipal Council.
                    </p>

                    <div className="mt-4 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4 mt-0.5 text-[#064E4A] dark:text-teal-400" />

                        <span>
                            Lakshmeshwar, Gadag District, Karnataka
                        </span>
                    </div>
                </div>

                {/* Ward Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wardsData.map((ward) => (
                        <div
                            key={ward.wardNumber}
                            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#061817] p-5 hover:border-[#064E4A] transition"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                                <h2 className="font-bold text-[#064E4A] dark:text-teal-300">
                                    Ward {ward.wardNumber}
                                </h2>

                                <span className="text-[11px] px-2 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 font-semibold">
                                    Ward
                                </span>
                            </div>

                            <div className="mt-4 space-y-3">
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {ward.name}
                                </p>

                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <Users className="w-4 h-4 text-[#064E4A] dark:text-teal-400" />

                                    <span>
                                        Population:{" "}
                                        <strong>
                                            {ward.population.toLocaleString("en-IN")}
                                        </strong>
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Information Notice */}
                <div className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-4">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                        <strong>Information notice:</strong> Ward population figures are
                        displayed based on the available ward data. Additional ward
                        information can be added when reliable municipal records are
                        available.
                    </p>
                </div>

            </div>
        </PageContainer>
    );
}