"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/UI/PageContainer";
import { FileText, Download, CheckCircle, Send, X, ArrowRight, Shield } from "lucide-react";

interface FormItem {
  id: string;
  title: string;
  formNo: string;
  dept: string;
  size: string;
  pdfUrl: string;
}

export default function ApplicationsPage() {
  const applicationForms: FormItem[] = [
    {
      id: "app-1",
      title: "Application for Piped Drinking Water Connection",
      formNo: "Form TMC-W1",
      dept: "Water Supply Cell",
      size: "245 KB",
      pdfUrl: "/forms/tmc-w1-water-connection.pdf",
    },
    {
      id: "app-2",
      title: "Building Construction Permission / Plan Sanction",
      formNo: "Form TMC-BP4",
      dept: "Town Planning Cell",
      size: "512 KB",
      pdfUrl: "/forms/tmc-bp4-building-permission.pdf",
    },
    {
      id: "app-3",
      title: "Trade License Application & Renewal Form",
      formNo: "Form TMC-TL2",
      dept: "Health & Sanitation Dept",
      size: "180 KB",
      pdfUrl: "/forms/tmc-tl2-trade-license.pdf",
    },
    {
      id: "app-4",
      title: "Application for Khata Transfer / Extract (Sasya)",
      formNo: "Form TMC-KT3",
      dept: "Revenue Cell",
      size: "310 KB",
      pdfUrl: "/forms/tmc-kt3-khata-transfer.pdf",
    },
    {
      id: "app-5",
      title: "No Objection Certificate (NOC) for Electricity / Borewell",
      formNo: "Form TMC-NOC1",
      dept: "Engineering Section",
      size: "190 KB",
      pdfUrl: "/forms/tmc-noc1-electricity-borewell.pdf",
    },
    {
      id: "app-6",
      title: "Application for Street Vendor Registration (SVANidhi)",
      formNo: "Form TMC-PM6",
      dept: "Community Affairs",
      size: "220 KB",
      pdfUrl: "/forms/tmc-pm6-street-vendor.pdf",
    },
  ];

  // Modal State
  const [selectedForm, setSelectedForm] = useState<FormItem | null>(null);
  const [applicantName, setApplicantName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [wardNumber, setWardNumber] = useState("");
  const [address, setAddress] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);

  const handleOpenModal = (form: FormItem) => {
    setSelectedForm(form);
    setSubmittedAppId(null);
    setSubmitError(null);
  };

  const handleCloseModal = () => {
    setSelectedForm(null);
    setApplicantName("");
    setMobileNumber("");
    setEmail("");
    setWardNumber("");
    setAddress("");
    setRemarks("");
    setSubmittedAppId(null);
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForm) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceCode: selectedForm.formNo,
          serviceName: selectedForm.title,
          applicantName,
          mobileNumber,
          email: email || undefined,
          wardNumber: wardNumber || undefined,
          address,
          details: {
            applicantRemarks: remarks || "Standard application filed via CivSetu portal",
          },
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setSubmittedAppId(json.data.id);
      } else {
        setSubmitError(json.error || "Failed to submit application.");
      }
    } catch (err) {
      console.error(err);
      setSubmitError("Failed to submit. Please check your internet connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer
      title="Applications for Various Services"
      subtitle="Download official municipal forms, statutory certificate formats, and submission guidelines"
      breadcrumbs={[{ label: "Applications" }]}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-700 dark:text-gray-300">
          <p>
            Citizens can download official applications, fill in required documents, and submit either
            at the Lakshmeshwar TMC citizen facilitation counter or directly through the online portal below.
          </p>

          <Link
            href="/track"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-xs font-bold text-[#064E4A] dark:text-teal-300 hover:bg-teal-100 transition whitespace-nowrap"
          >
            <span>Track Existing Application</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {applicationForms.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-[#061817] flex items-center justify-between hover:border-[#064E4A] transition"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-teal-100 dark:bg-teal-950 text-[#064E4A] dark:text-teal-300">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {item.formNo} • {item.dept} • {item.size}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() => handleOpenModal(item)}
                  className="px-3 py-1.5 rounded-md bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-bold shadow transition"
                  title="Submit Application Online"
                >
                  Apply Online
                </button>

                <a
                  href={item.pdfUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-xs font-semibold text-teal-800 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900 transition"
                  title={`Download ${item.title} (${item.formNo}) PDF`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Online Application Modal */}
      {selectedForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#061817] border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                  Online Service Application
                </h3>
                <p className="text-xs text-[#064E4A] dark:text-teal-400 font-semibold mt-0.5">
                  {selectedForm.formNo} • {selectedForm.title}
                </p>
              </div>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {submittedAppId ? (
              <div className="p-6 text-center space-y-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 rounded-xl">
                <CheckCircle className="w-12 h-12 text-teal-600 mx-auto" />
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Application Submitted Successfully!
                </h4>
                <div className="p-3 bg-white dark:bg-gray-900 rounded-md border border-teal-300 dark:border-teal-800 max-w-xs mx-auto">
                  <span className="text-xs text-gray-500 block">Your Application Tracking ID:</span>
                  <span className="font-mono text-base font-extrabold text-[#064E4A] dark:text-teal-300">
                    {submittedAppId}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Your application has been queued for verification by the {selectedForm.dept}, Lakshmeshwar TMC.
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Link
                    href={`/track?id=${encodeURIComponent(submittedAppId)}`}
                    className="px-4 py-2 bg-[#064E4A] text-white text-xs font-bold rounded shadow hover:bg-[#0B6B63]"
                  >
                    Track Progress
                  </Link>
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-xs font-semibold rounded hover:bg-gray-100"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                {submitError && (
                  <div className="p-2.5 rounded bg-red-50 text-red-700 text-xs border border-red-200">
                    {submitError}
                  </div>
                )}

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Applicant Full Name *
                  </label>
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Full statutory name"
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="10-digit mobile"
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Ward Number
                    </label>
                    <input
                      type="text"
                      value={wardNumber}
                      onChange={(e) => setWardNumber(e.target.value)}
                      placeholder="e.g. 1, 2, 7"
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Property Address / Street *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/Shop no., street name, Lakshmeshwar"
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Additional Details / Requirement Notes
                  </label>
                  <textarea
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Any specific particulars, property assessment no., or meter preferences..."
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-md bg-[#064E4A] hover:bg-[#0B6B63] text-white font-bold shadow flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? "Submitting..." : "Submit Application"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
