"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/UI/PageContainer";
import { siteConfig } from "@/data/siteConfig";
import { Phone, Mail, MapPin, Clock, CheckCircle2 } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";

export default function ContactPage() {
  const { language } = useAccessibility();
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
      title={
        language === "kn"
          ? "ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ"
          : language === "hi"
          ? "लक्ष्मेश्वर नगर पालिका से संपर्क करें"
          : "Contact Lakshmeshwar Town Municipal Council"
      }
      subtitle={
        language === "kn"
          ? "ಪುರಸಭೆಯ ಅಧಿಕಾರಿಗಳು, ಆಡಳಿತಾತ್ಮಕ ಸಹಾಯವಾಣಿ ಅಥವಾ ತುರ್ತು ನೆರವನ್ನು ಸಂಪರ್ಕಿಸಿ"
          : language === "hi"
          ? "नगर पालिका अधिकारियों, प्रशासनिक हेल्पलाइन अथवा आपातकालीन सहायता से संपर्क करें"
          : "Reach out to council officers, administrative helpline, or emergency support"
      }
      breadcrumbs={[{ label: language === "kn" ? "ಸಂಪರ್ಕಿಸಿ" : language === "hi" ? "संपर्क करें" : "Contact Us" }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Info Details */}
        <div className="space-y-5 text-sm sm:text-base">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#064E4A] dark:text-teal-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">
                {language === "kn" ? "ಕಚೇರಿ ವಿಳಾಸ" : language === "hi" ? "कार्यालय का पता" : "Office Location"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {language === "kn" ? "ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆ ಕಾರ್ಯಾಲಯ" : language === "hi" ? "लक्ष्मेश्वर नगर पालिका परिषद" : siteConfig.municipality}
                <br />
                {language === "kn" ? "ಎಸ್.ಟಿ. ಬಸ್ ನಿಲ್ದಾಣದ ಹತ್ತಿರ" : language === "hi" ? "एस.टी. स्टैंड के पास" : siteConfig.address.line1}
                <br />
                {siteConfig.address.city}, {siteConfig.address.district} {language === "kn" ? "ಜಿಲ್ಲೆ" : language === "hi" ? "जिला" : "Dist."}
                <br />
                {language === "kn" ? "ಕರ್ನಾಟಕ" : language === "hi" ? "कर्नाटक" : "Karnataka"} - {siteConfig.address.pincode}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-[#064E4A] dark:text-teal-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">
                {language === "kn" ? "ದೂರವಾಣಿ ಸಂಪರ್ಕ" : language === "hi" ? "दूरभाष नंबर" : "Telephone Lines"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {language === "kn" ? "ದೂರವಾಣಿ: " : language === "hi" ? "लैंडलाइन: " : "Landline: "}
                <a href={`tel:${siteConfig.contactNumber}`} className="text-teal-700 font-semibold hover:underline">
                  {siteConfig.contactNumber}
                </a>
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                {language === "kn" ? "ದೂರು ಸಹಾಯವಾಣಿ (PIGRS): " : language === "hi" ? "शिकायत हेल्पलाइन (PIGRS): " : "Grievance Helpline (PIGRS): "}
                <a href={`tel:${siteConfig.pigrsNumber}`} className="text-teal-700 font-semibold hover:underline">
                  {siteConfig.pigrsNumber}
                </a>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-[#064E4A] dark:text-teal-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">
                {language === "kn" ? "ಅಧಿಕೃತ ಇ-ಮೇಲ್" : language === "hi" ? "आधिकारिक ईमेल" : "Official Email"}
              </h3>
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
              <h3 className="font-bold text-gray-900 dark:text-gray-100">
                {language === "kn" ? "ಕಚೇರಿ ಕೆಲಸದ ಸಮಯ" : language === "hi" ? "कार्यालय कार्य समय" : "Office Working Hours"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {language === "kn"
                  ? "ಸೋಮವಾರ - ಶುಕ್ರವಾರ: ಬೆಳಿಗ್ಗೆ 10:00 - ಸಂಜೆ 5:30"
                  : language === "hi"
                  ? "सोमवार - शुक्रवार: प्रातः 10:00 - सायं 5:30"
                  : "Monday - Friday: 10:00 AM - 5:30 PM"}
                <br />
                {language === "kn"
                  ? "ಶನಿವಾರ: ಬೆಳಿಗ್ಗೆ 10:00 - ಮಧ್ಯಾಹ್ನ 1:30 (2ನೇ & 4ನೇ ಶನಿವಾರ ರಜೆ)"
                  : language === "hi"
                  ? "शनिवार: प्रातः 10:00 - दोपहर 1:30 (द्वितीय एवं चतुर्थ शनिवार अवकाश)"
                  : "Saturday: 10:00 AM - 1:30 PM (Except 2nd & 4th Saturdays)"}
                <br />
                {language === "kn" ? "ಭಾನುವಾರ: ರಜೆ" : language === "hi" ? "रविवार: अवकाश" : "Sunday: Closed"}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Message / Feedback Box */}
        <div className="bg-gray-50 dark:bg-[#061817] p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {language === "kn" ? "ವಿಚಾರಣೆ ಅಥವಾ ದೂರು ಸಲ್ಲಿಸಿ" : language === "hi" ? "पूछताछ या शिकायत भेजें" : "Send an Inquiry or Grievance"}
          </h2>
          {submitted ? (
            <div className="p-6 text-center space-y-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 rounded-xl">
              <CheckCircle2 className="w-10 h-10 text-teal-600 mx-auto" />
              <p className="font-bold text-base text-gray-900 dark:text-gray-100">
                {language === "kn" ? "ವಿಚಾರಣೆ / ದೂರು ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ!" : language === "hi" ? "पूछताछ / शिकायत सफलतापूर्वक दर्ज की गई!" : "Inquiry / Grievance Registered Successfully!"}
              </p>
              {generatedId && (
                <div className="p-3 bg-white dark:bg-gray-900 rounded-md border border-teal-300 dark:border-teal-800">
                  <span className="text-xs text-gray-500 block">
                    {language === "kn" ? "ನಿಮ್ಮ ಅಧಿಕೃತ ಟ್ರ್ಯಾಕಿಂಗ್ ಸಂಖ್ಯೆ:" : language === "hi" ? "आपकी आधिकारिक ट्रैकिंग संख्या:" : "Your Official Tracking Number:"}
                  </span>
                  <span className="font-mono text-base font-extrabold text-[#064E4A] dark:text-teal-300">
                    {generatedId}
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {language === "kn"
                  ? "ನಿಮ್ಮ ದೂರನ್ನು ಪುರಸಭೆಯ ಟ್ರ್ಯಾಕಿಂಗ್ ವ್ಯವಸ್ಥೆಯಲ್ಲಿ ನೋಂದಾಯಿಸಲಾಗಿದೆ. ಟ್ರ್ಯಾಕಿಂಗ್ ಸಂಖ್ಯೆಯನ್ನು ಬಳಸಿಕೊಂಡು ಪ್ರಗತಿಯನ್ನು ವೀಕ್ಷಿಸಬಹುದು."
                  : language === "hi"
                  ? "आपकी शिकायत पंजीकृत कर ली गई है। ट्रैकिंग संख्या से स्थिति की जांच कर सकते हैं।"
                  : "Your complaint has been registered in the municipal tracking system. You can monitor its real-time progress using your tracking number."}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {generatedId && (
                  <a
                    href={`/track?id=${encodeURIComponent(generatedId)}`}
                    className="px-4 py-2 bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-bold rounded shadow transition"
                  >
                    {language === "kn" ? "ಈಗಲೇ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ" : language === "hi" ? "स्थिति जांचें" : "Track Status Now"}
                  </a>
                )}
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setGeneratedId("");
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded hover:bg-gray-100 transition"
                >
                  {language === "kn" ? "ಇನ್ನೊಂದನ್ನು ಕಳುಹಿಸಿ" : language === "hi" ? "अन्य संदेश भेजें" : "Send Another"}
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
                  {language === "kn" ? "ಪೂರ್ಣ ಹೆಸರು *" : language === "hi" ? "पूरा नाम *" : "Full Name *"}
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={language === "kn" ? "ನಿಮ್ಮ ಹೆಸರು ನಮೂದಿಸಿ" : language === "hi" ? "अपना नाम दर्ज करें" : "Enter your name"}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {language === "kn" ? "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ *" : language === "hi" ? "मोबाइल नंबर *" : "Mobile Number *"}
                </label>
                <input
                  type="tel"
                  value={formMobile}
                  onChange={(e) => setFormMobile(e.target.value)}
                  placeholder={language === "kn" ? "10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ" : language === "hi" ? "10-अंकीय मोबाइल नंबर" : "10-digit mobile number"}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {language === "kn" ? "ವಿಷಯ / ವಾರ್ಡ್ ಸಂಖ್ಯೆ" : language === "hi" ? "विषय / वार्ड संख्या" : "Subject / Ward No."}
                </label>
                <input
                  type="text"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder={language === "kn" ? "ಉದಾ: ವಾರ್ಡ್ 3 ಬೀದಿದೀಪ ಅಥವಾ ಕುಡಿಯುವ ನೀರು" : language === "hi" ? "उदा: वार्ड 3 स्ट्रीट लाइट या पेयजल" : "e.g. Ward 3 Streetlight or Drinking Water"}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {language === "kn" ? "ವಿವರಣೆ / ಮಾಹಿತಿ *" : language === "hi" ? "विवरण / संदेश *" : "Message / Details *"}
                </label>
                <textarea
                  rows={4}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder={language === "kn" ? "ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಅಥವಾ ದೂರಿನ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ..." : language === "hi" ? "अपनी शिकायत या विवरण दर्ज करें..." : "Describe your query or complaint..."}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#064E4A] hover:bg-[#0B6B63] text-white font-bold py-2.5 rounded-md transition shadow disabled:opacity-50"
              >
                {submitting
                  ? (language === "kn" ? "ದಾಖಲಿಸಲಾಗುತ್ತಿದೆ..." : language === "hi" ? "दर्ज किया जा रहा है..." : "Registering Grievance...")
                  : (language === "kn" ? "ವಿಚಾರಣೆ / ದೂರು ಸಲ್ಲಿಸಿ" : language === "hi" ? "पूछताछ / शिकायत भेजें" : "Submit Inquiry / Grievance")}
              </button>
            </form>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
