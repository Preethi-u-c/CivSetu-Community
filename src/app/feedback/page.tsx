"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/UI/PageContainer";
import { MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { siteConfig } from "@/data/siteConfig";

export default function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [ward, setWard] = useState("");
  const [category, setCategory] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [feedbackId, setFeedbackId] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          citizenName: name,
          mobileNumber: mobile,
          wardNumber: ward || undefined,
          category,
          suggestion,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setFeedbackId(json.data.id);
        setSubmitted(true);
        setName("");
        setMobile("");
        setWard("");
        setCategory("");
        setSuggestion("");
      } else {
        setSubmitError(json.error || "Failed to submit feedback.");
      }
    } catch (err) {
      console.error(err);
      setSubmitError("Network connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer
      title="Post Back & Suggestions"
      subtitle="Share your valuable suggestions or feedback for the Lakshmeshwar Town Municipal Council"
      breadcrumbs={[{ label: "Post Back & Suggestions" }]}
    >
      <div className="max-w-2xl mx-auto py-2">
        {submitted ? (
          <div className="p-8 text-center bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 rounded-xl space-y-3">
            <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Thank you for your feedback!
            </h2>
            {feedbackId && (
              <div className="p-2.5 bg-white dark:bg-gray-900 rounded-md border border-teal-300 dark:border-teal-800 max-w-xs mx-auto">
                <span className="text-[11px] text-gray-500 block">Feedback Reference ID:</span>
                <span className="font-mono text-sm font-extrabold text-[#064E4A] dark:text-teal-300">
                  {feedbackId}
                </span>
              </div>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              Your suggestion has been logged for review by the Commissioner, Lakshmeshwar TMC. We
              appreciate your contribution toward building a cleaner and better town.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFeedbackId("");
              }}
              className="mt-4 px-4 py-2 bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-bold rounded-md"
            >
              Submit Another Suggestion
            </button>
          </div>
        ) : (
          <form className="space-y-4 text-sm" onSubmit={handleSubmit}>
            {submitError && (
              <div className="p-3 rounded bg-red-50 text-red-700 text-xs border border-red-200">
                {submitError}
              </div>
            )}

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Citizen Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Ward Number (Optional)
                </label>
                <input
                  type="text"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  placeholder="e.g. Ward 3 or Ward 7"
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Topic / Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                required
              >
                <option value="">Select a category</option>
                <option value="water">Drinking Water Supply</option>
                <option value="sanitation">Garbage & Sanitation</option>
                <option value="roads">Roads & Drainage</option>
                <option value="streetlights">Street Lighting</option>
                <option value="tax">Property Tax & Khata</option>
                <option value="website">Portal Suggestion</option>
                <option value="other">Other Civic Matter</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Suggestion / Detailed Feedback *
              </label>
              <textarea
                rows={5}
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="Provide constructive feedback or recommendations..."
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-[#064E4A] hover:bg-[#0B6B63] text-white font-bold py-2.5 rounded-md transition shadow disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? "Submitting Suggestion..." : "Submit Suggestion to Municipal Council"}</span>
            </button>
          </form>
        )}
      </div>
    </PageContainer>
  );
}
