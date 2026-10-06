"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  AlertTriangle,
  ArrowRight,
  Droplets,
  Zap,
  Trash2,
  Construction,
  FileText,
  MapPin,
  Calendar,
} from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";
import type { NoticeRecord } from "@/lib/db/notices";

// Translation dictionaries for static seed notices so cards display localized titles & descriptions
const NOTICE_TRANSLATIONS: Record<
  string,
  {
    kn: { title: string; description: string; targetWards?: string };
    hi: { title: string; description: string; targetWards?: string };
  }
> = {
  "NOT-LMC-2026-001": {
    kn: {
      title: "ವಿಶೇಷ ಮಾನ್ಸೂನ್ ಚರಂಡಿ ಹಾಗೂ ಹೂಳೆತ್ತುವ ನಿರ್ದೇಶನ",
      description: "ಎಲ್ಲಾ 23 ಪುರಸಭೆ ವಾರ್ಡ್‌ಗಳಲ್ಲಿ ಮಳೆಗಾಲಕ್ಕೂ ಮುನ್ನ ಪ್ರಾಥಮಿಕ ಹಾಗೂ ದ್ವಿತೀಯ ರಾಜಕಾಲುವೆಗಳ ಹೂಳೆತ್ತುವುದು ಕಡ್ಡಾಯ. ವಾರ್ಡ್ ಎಂಜಿನಿಯರ್‌ಗಳು ಸ್ಥಳ ಪರಿಶೀಲಿಸಿ ನಿಗದಿತ ಅವಧಿಯೊಳಗೆ ವರದಿ ಸಲ್ಲಿಸಬೇಕು.",
      targetWards: "ಎಲ್ಲಾ ವಾರ್ಡ್‌ಗಳು (01 - 23)",
    },
    hi: {
      title: "विशेष मानसून नाला सफाई एवं गाद निकासी निर्देश",
      description: "सभी 23 नगर पालिका वार्डों में मानसून से पहले प्राथमिक और द्वितीयक नालों की अनिवार्य गाद सफाई। वार्ड इंजीनियरों को तय समय सीमा में निरीक्षण प्रमाण पत्र प्रस्तुत करना होगा।",
      targetWards: "सभी वार्ड (01 - 23)",
    },
  },
  "NOT-LMC-2026-002": {
    kn: {
      title: "ತುರ್ತು: ಹಠಾತ್ ಪ್ರವಾಹ ಮುನ್ನೆಚ್ಚರಿಕೆ ಹಾಗೂ ತಗ್ಗು ಪ್ರದೇಶಗಳ ಸ್ಥಳಾಂತರ ಸಿದ್ಧತೆ",
      description: "ತುರ್ತು ಗೆಜೆಟ್ ಸುತ್ತೋಲೆ: ಲಕ್ಷ್ಮೇಶ್ವರ ತಾಲೂಕಿಗೆ ಹವಾಮಾನ ಇಲಾಖೆಯಿಂದ ಭಾರಿ ಮಳೆ ಎಚ್ಚರಿಕೆ. ಕಾಲುವೆ ತಗ್ಗು ಪ್ರದೇಶಗಳ ನಿವಾಸಿಗಳು ಜಾಗರೂಕರಾಗಿರಲು ಕೋರಲಾಗಿದೆ. 24x7 ತುರ್ತು ನಿಯಂತ್ರಣ ಕೊಠಡಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆ.",
      targetWards: "ಎಲ್ಲಾ ವಾರ್ಡ್‌ಗಳು (ವಾರ್ಡ್ 02, 05, 08 ಗಮನ)",
    },
    hi: {
      title: "आपातकालीन: आकस्मिक बाढ़ चेतावनी एवं निचले वार्डों में निकासी तैयारी",
      description: "आपातकालीन राजपत्र परिपत्र: आईएमडी द्वारा भारी बारिश की चेतावनी जारी। निचले इलाकों के निवासी सावधानी बरतें। नगर पालिका 24x7 नियंत्रण कक्ष सक्रिय कर दिए गए हैं।",
      targetWards: "सभी वार्ड (वार्ड 02, 05, 08 पर विशेष ध्यान)",
    },
  },
  "NOT-LMC-2026-003": {
    kn: {
      title: "ವಾರ್ಡ್ 03 ಮತ್ತು 04 ಕುಡಿಯುವ ನೀರು ಪೂರೈಕೆ ಪೈಪ್‌ಲೈನ್ ಜೋಡಣೆ ವೇಳಾಪಟ್ಟಿ",
      description: "ಪೈಪ್‌ಲೈನ್ ಜೋಡಣೆ ಮತ್ತು ಡಿಜಿಟಲ್ ಫ್ಲೋ-ಮೀಟರ್ ಅಳವಡಿಕೆಗಾಗಿ ಶುಕ್ರವಾರ ಬೆಳಿಗ್ಗೆ 06:00 ರಿಂದ ಮಧ್ಯಾಹ್ನ 02:00 ರವರೆಗೆ ಮುಖ್ಯ ವಾಲ್ವ್‌ಗಳನ್ನು ಮುಚ್ಚಲಾಗುತ್ತದೆ. ಸಾರ್ವಜನಿಕರು ಮುಂಚಿತವಾಗಿ ನೀರು ಸಂಗ್ರಹಿಸಿಟ್ಟುಕೊಳ್ಳಲು ಕೋರಲಾಗಿದೆ.",
      targetWards: "ವಾರ್ಡ್ 03, ವಾರ್ಡ್ 04",
    },
    hi: {
      title: "वार्ड 03 एवं वार्ड 04 जल आपूर्ति इंटरकनेक्शन समय-सारणी",
      description: "पाइपलाइन इंटरकनेक्शन और फ्लो मीटर लगाने हेतु शुक्रवार सुबह 06:00 से दोपहर 02:00 बजे तक मुख्य वाल्व बंद रहेंगे। नागरिक पर्याप्त पेयजल संचित कर लें।",
      targetWards: "वार्ड 03, वार्ड 04",
    },
  },
  "NOT-LMC-2026-004": {
    kn: {
      title: "ಹೆಸ್ಕಾಂ 11ಕೆವಿ ಫೀಡರ್ ಲೈನ್ ನಿರ್ವಹಣೆ ಮತ್ತು ವಿದ್ಯುತ್ ಕಡಿತ",
      description: "ಕೇಂದ್ರ ಬಜಾರ್ ಮತ್ತು ಕೋಟೆ ಪ್ರದೇಶದಲ್ಲಿ ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್ ದುರಸ್ತಿ ಮತ್ತು ಎಚ್‌ಟಿ ಲೈನ್ ಬದಲಾವಣೆ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಶನಿವಾರ ಬೆಳಿಗ್ಗೆ 10:00 ರಿಂದ ಸಂಜೆ 04:00 ರವರೆಗೆ ವಿದ್ಯುತ್ ಸರಬರಾಜು ಇರುವುದಿಲ್ಲ.",
      targetWards: "ವಾರ್ಡ್ 01, ವಾರ್ಡ್ 02, ವಾರ್ಡ್ 06",
    },
    hi: {
      title: "हेस्कॉम 11KV फीडर लाइन रखरखाव एवं विद्युत कटौती",
      description: "सेंट्रल बाजार और किला क्षेत्र में ट्रांसफार्मर सर्विसिंग के कारण शनिवार सुबह 10:00 से शाम 04:00 बजे तक बिजली बंद रहेगी। असुविधा के लिए खेद है।",
      targetWards: "वार्ड 01, वार्ड 02, वार्ड 06",
    },
  },
  "NOT-LMC-2026-005": {
    kn: {
      title: "ಸ್ಟೇಷನ್ ರಸ್ತೆ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ವೃತ್ತದ ಡಾಂಬರೀಕರಣ ಹಾಗೂ ಚರಂಡಿ ಪುನರ್ನಿರ್ಮಾಣ",
      description: "ಲೋಕೋಪಯೋಗಿ ವಿಭಾಗದಿಂದ ಸ್ಟೇಷನ್ ರಸ್ತೆಯಲ್ಲಿ ಡಾಂಬರೀಕರಣ ಆರಂಭವಾಗಲಿದೆ. ಹಳೆ ಬಸ್ ನಿಲ್ದಾಣ ರಸ್ತೆಯ ಮೂಲಕ 5 ದಿನಗಳ ಕಾಲ ವಾಹನ ಸಂಚಾರ വഴിಬದಲಾವಣೆ ಮಾಡಲಾಗಿದೆ.",
      targetWards: "ವಾರ್ಡ್ 05, ವಾರ್ಡ್ 06",
    },
    hi: {
      title: "स्टेशन रोड एवं मार्केट स्क्वायर डामरीकरण तथा नाला पुनर्निर्माण",
      description: "स्टेशन रोड पर डामरीकरण और तूफानी नाला निर्माण कार्य शुरू होगा। 5 दिनों के लिए यातायात पुराने बस स्टैंड रोड से डायवर्ट रहेगा। नागरिक सहयोग करें।",
      targetWards: "वार्ड 05, वार्ड 06",
    },
  },
  "NOT-LMC-2026-006": {
    kn: {
      title: "ಮನೆ-ಮನೆ ತ್ಯಾಜ್ಯ ವಿಂಗಡಣೆ ಹಾಗೂ ಸ್ವಚ್ಛ ನಗರ ವಿಶೇಷ ಅಭಿಯಾನ",
      description: "ಎಲ್ಲಾ ವಸತಿ ವಾರ್ಡ್‌ಗಳಲ್ಲಿ ಹಸಿ ಮತ್ತು ಒಣ ಕಸವನ್ನು ಮೂಲದಲ್ಲೇ ಪ್ರತ್ಯೇಕಿಸುವುದು ಕಡ್ಡಾಯ. ಕಸ ವಿಂಗಡಿಸದಿದ್ದಲ್ಲಿ ಕರ್ನಾಟಕ ಪುರಸಭೆ ಕಾಯ್ದೆಯಡಿ ಸ್ಥಳದಲ್ಲೇ ದಂಡ ವಿಧಿಸಲಾಗುವುದು.",
      targetWards: "ಎಲ್ಲಾ ವಾರ್ಡ್‌ಗಳು (01 - 23)",
    },
    hi: {
      title: "डोर-टू-डोर कचरा पृथक्करण एवं स्वच्छ शहर विशेष स्वच्छता अभियान",
      description: "सभी आवासीय वार्डों में गीला और सूखा कचरा अलग-अलग देना अनिवार्य है। कचरा अलग न करने पर नगरपालिका अधिनियम के तहत स्पॉट जुर्माना लगाया जाएगा।",
      targetWards: "सभी वार्ड (01 - 23)",
    },
  },
};

export const HomeAnnouncementsSection: React.FC = () => {
  const { t, language } = useAccessibility();
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notices?limit=4")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setNotices(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getCategoryIcon = (category: string) => {
    if (category.includes("Water")) return Droplets;
    if (category.includes("Electricity")) return Zap;
    if (category.includes("Sanitation") || category.includes("Health")) return Trash2;
    if (category.includes("Road") || category.includes("Works")) return Construction;
    if (category.includes("Emergency")) return AlertTriangle;
    return FileText;
  };

  const getCategoryClass = (category: string) => {
    if (category.includes("Water")) return "bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800";
    if (category.includes("Electricity")) return "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800";
    if (category.includes("Sanitation") || category.includes("Health")) return "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";
    if (category.includes("Road") || category.includes("Works")) return "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800";
    if (category.includes("Emergency")) return "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800";
    return "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800";
  };

  const translateCategory = (cat: string) => {
    if (language === "kn") {
      if (cat.includes("Water")) return "ಕುಡಿಯುವ ನೀರು ಸರಬರಾಜು";
      if (cat.includes("Electricity")) return "ವಿದ್ಯುತ್ ವ್ಯತ್ಯಯ";
      if (cat.includes("Sanitation")) return "ಸ್ವಚ್ಛತೆ ಮತ್ತು ನೈರ್ಮಲ್ಯ";
      if (cat.includes("Road")) return "ರಸ್ತೆ ಕಾಮಗಾರಿ";
      if (cat.includes("Emergency")) return "ತುರ್ತು ಎಚ್ಚರಿಕೆ";
      if (cat.includes("Municipal")) return "ಪುರಸಭೆ ಪ್ರಕಟಣೆ";
      return "ಸಾರ್ವಜನಿಕ ಪ್ರಕಟಣೆ";
    }
    if (language === "hi") {
      if (cat.includes("Water")) return "जल आपूर्ति सूचना";
      if (cat.includes("Electricity")) return "विद्युत व्यवधान";
      if (cat.includes("Sanitation")) return "स्वच्छता एवं सफाई";
      if (cat.includes("Road")) return "सड़क निर्माण कार्य";
      if (cat.includes("Emergency")) return "आपातकालीन चेतावनी";
      if (cat.includes("Municipal")) return "नगर पालिका घोषणा";
      return "सार्वजनिक सूचना";
    }
    return cat;
  };

  const translatePriority = (priority: string) => {
    if (language === "kn") {
      if (priority === "Urgent") return "ತುರ್ತು";
      if (priority === "High") return "ಹೆಚ್ಚಿನ ಆದ್ಯತೆ";
      return "ಸಾಮಾನ್ಯ";
    }
    if (language === "hi") {
      if (priority === "Urgent") return "अति आवश्यक";
      if (priority === "High") return "उच्च प्राथमिकता";
      return "सामान्य";
    }
    return priority;
  };

  const translateWardScope = (wards: string | undefined | null) => {
    if (!wards || wards.toLowerCase().includes("all") || wards.toLowerCase().includes("entire")) {
      return t.publicContent.cityWide || (language === "kn" ? "ನಗರದಾದ್ಯಂತ" : language === "hi" ? "नगर-व्यापी" : "City-Wide");
    }
    if (language === "kn") {
      return wards.replace(/Ward/g, "ವಾರ್ಡ್").replace(/All Wards/g, "ಎಲ್ಲಾ ವಾರ್ಡ್‌ಗಳು");
    }
    if (language === "hi") {
      return wards.replace(/Ward/g, "वार्ड").replace(/All Wards/g, "सभी वार्ड");
    }
    return wards;
  };

  const formatDate = (dateString: string) => {
    try {
      const locale = language === "kn" ? "kn-IN" : language === "hi" ? "hi-IN" : "en-IN";
      return new Date(dateString).toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return new Date(dateString).toLocaleDateString();
    }
  };

  if (loading && notices.length === 0) {
    return null;
  }

  if (notices.length === 0) {
    return null;
  }

  return (
    <section className="max-w-[1380px] mx-auto px-4 my-8">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#064E4A] dark:text-teal-400 uppercase tracking-wider">
            <Bell className="w-4 h-4" />
            <span>{t.publicContent.bulletinsSubtitle}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 mt-0.5">
            {t.publicContent.announcementsHeading}
          </h2>
        </div>

        <Link
          href="/notices"
          prefetch={true}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#064E4A] dark:text-teal-400 hover:text-[#0B6B63] dark:hover:text-teal-300 transition group"
        >
          <span>{t.publicContent.viewAllAnnouncements}</span>
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grid of Announcements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {notices.map((n) => {
          const Icon = getCategoryIcon(n.category);
          const localizedNotice =
            language === "kn"
              ? NOTICE_TRANSLATIONS[n.id]?.kn
              : language === "hi"
              ? NOTICE_TRANSLATIONS[n.id]?.hi
              : null;

          const title = localizedNotice?.title || n.title;
          const description = localizedNotice?.description || n.description;
          const targetWards = localizedNotice?.targetWards || translateWardScope(n.targetWards);

          return (
            <Link
              key={n.id}
              href={`/notices/${n.id}`}
              prefetch={true}
              className={`p-4 rounded-xl border bg-white dark:bg-[#061817] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group ${
                n.isEmergency
                  ? "border-rose-300 dark:border-rose-900 bg-rose-50/20"
                  : "border-gray-200 dark:border-gray-800 hover:border-teal-400"
              }`}
            >
              <div className="space-y-2.5">
                {/* Badges */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${getCategoryClass(
                      n.category
                    )}`}
                  >
                    <Icon className="w-3 h-3 shrink-0" />
                    <span className="truncate max-w-[120px]">{translateCategory(n.category)}</span>
                  </span>

                  {n.isEmergency ? (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-600 text-white animate-pulse">
                      {t.publicContent.emergency}
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                      {translatePriority(n.priority)}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                  {title}
                </h3>

                {/* Description snippet */}
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Footer Meta */}
              <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px] text-gray-500">
                <span className="flex items-center gap-1 text-[#064E4A] dark:text-teal-400 font-semibold truncate max-w-[140px]">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{targetWards}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span>{formatDate(n.publishDate)}</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
