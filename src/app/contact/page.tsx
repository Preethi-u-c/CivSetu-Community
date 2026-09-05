"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/UI/PageContainer";
import { siteConfig } from "@/data/siteConfig";
import { Phone, Mail, MapPin, Clock, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formName, setFormName] = useState("");
  const [formMobile, setFormMobile] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [generatedId, setGeneratedId] = useState<string>("");

  const handleSubmitGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/grievances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          citizenName: formName,
          mobileNumber: formMobile,
          subject: formSubject || "Inquiry / Citizen Request",
          description: formMessage,
          category: "other",
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setGeneratedId(json.data.id);
        setSubmitted(true);
        setFormName("");
        setFormMobile("");
        setFormSubject("");
        setFormMessage("");
      } else {
        setSubmitError(json.error || "Failed to register inquiry. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setSubmitError("Network error. Please try again in a few moments.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer
      title="Contact Lakshmeshwar Town Municipal Council"
      subtitle="Reach out to council officers, administrative helpline, or emergency support"
      breadcrumbs={[{ label: "Contact Us" }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Info Details */}
        <div className="space-y-5 text-sm sm:text-base">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#064E4A] dark:text-teal-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Office Location</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {siteConfig.municipality}
                <br />
                {siteConfig.address.line1}
                <br />
                {siteConfig.address.city}, {siteConfig.address.district} Dist.
                <br />
                Karnataka - {siteConfig.address.pincode}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-[#064E4A] dark:text-teal-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Telephone Lines</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Landline:{" "}
                <a href={`tel:${siteConfig.contactNumber}`} className="text-teal-700 font-semibold hover:underline">
                  {siteConfig.contactNumber}
                </a>
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Grievance Helpline (PIGRS):{" "}
                <a href={`tel:${siteConfig.pigrsNumber}`} className="text-teal-700 font-semibold hover:underline">
                  {siteConfig.pigrsNumber}
                </a>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-[#064E4A] dark:text-teal-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Official Email</h3>
              <p className="text-gray-600 dark:text-gray-300">
                <a href={`mailto:${siteConfig.email}`} className="text-teal-700 font-semibold hover:underline">
                  {siteConfig.email}
                </a>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#064E4A] dark:text-teal-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Office Working Hours</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Monday - Friday: 10:00 AM - 5:30 PM
                <br />
                Saturday: 10:00 AM - 1:30 PM (Except 2nd & 4th Saturdays)
                <br />
                Sunday: Closed
              </p>
            </div>
          </div>
        </div>

        {/* Quick Message / Feedback Box */}
        <div className="bg-gray-50 dark:bg-[#061817] p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            Send an Inquiry or Grievance
          </h2>
          {submitted ? (
            <div className="p-6 text-center space-y-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 rounded-xl">
              <CheckCircle2 className="w-10 h-10 text-teal-600 mx-auto" />
              <p className="font-bold text-base text-gray-900 dark:text-gray-100">
                Inquiry / Grievance Registered Successfully!
              </p>
              {generatedId && (
                <div className="p-3 bg-white dark:bg-gray-900 rounded-md border border-teal-300 dark:border-teal-800">
                  <span className="text-xs text-gray-500 block">Your Official Tracking Number:</span>
                  <span className="font-mono text-base font-extrabold text-[#064E4A] dark:text-teal-300">
                    {generatedId}
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Your complaint has been registered in the municipal tracking system. You can monitor
                its real-time progress using your tracking number.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {generatedId && (
                  <a
                    href={`/track?id=${encodeURIComponent(generatedId)}`}
                    className="px-4 py-2 bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-bold rounded shadow transition"
                  >
                    Track Status Now
                  </a>
                )}
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setGeneratedId("");
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded hover:bg-gray-100 transition"
                >
                  Send Another
                </button>
              </div>
            </div>
          ) : (
            <form className="space-y-4 text-sm" onSubmit={handleSubmitGrievance}>
              {submitError && (
                <div className="p-3 rounded bg-red-50 text-red-700 text-xs border border-red-200">
                  {submitError}
                </div>
              )}
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={formMobile}
                  onChange={(e) => setFormMobile(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Subject / Ward No.
                </label>
                <input
                  type="text"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="e.g. Ward 3 Streetlight or Drinking Water"
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Message / Details *
                </label>
                <textarea
                  rows={4}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="Describe your query or complaint..."
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#064E4A] hover:bg-[#0B6B63] text-white font-bold py-2.5 rounded-md transition shadow disabled:opacity-50"
              >
                {submitting ? "Registering Grievance..." : "Submit Inquiry / Grievance"}
              </button>
            </form>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
