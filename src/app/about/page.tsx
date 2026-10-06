"use client";

import React from "react";
import { PageContainer } from "@/components/UI/PageContainer";
import { siteConfig } from "@/data/siteConfig";
import { Landmark, Shield, Users, Award } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";

export default function AboutPage() {
  const { language } = useAccessibility();

  return (
    <PageContainer
      title={
        language === "kn"
          ? "ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆಯ ಬಗ್ಗೆ"
          : language === "hi"
          ? "लक्ष्मेश्वर नगर पालिका के बारे में"
          : "About Lakshmeshwar Town Municipal Council"
      }
      subtitle={
        language === "kn"
          ? "ಲಕ್ಷ್ಮೇಶ್ವರದ ಇತಿಹಾಸ, ಆಡಳಿತ ಮತ್ತು ನಾಗರಿಕ ಧ್ಯೇಯ (ಪುರಸಭೆ ಲಕ್ಷ್ಮೇಶ್ವರ)"
          : language === "hi"
          ? "लक्ष्मेश्वर का इतिहास, शासन एवं नागरिक संकल्प (ಪುರಸಭೆ ಲಕ್ಷ್ಮೇಶ್ವರ)"
          : "History, Governance, and Civic Mission of Lakshmeshwar (ಪುರಸಭೆ ಲಕ್ಷ್ಮೇಶ್ವರ)"
      }
      breadcrumbs={[{ label: language === "kn" ? "ನಮ್ಮ ಬಗ್ಗೆ" : language === "hi" ? "हमारे बारे में" : "About Us" }]}
    >
      <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
        <section>
          <h2 className="text-xl font-bold text-[#064E4A] dark:text-teal-300 mb-2">
            {language === "kn"
              ? "ಐತಿಹಾಸಿಕ ಮತ್ತು ಸಾಂಸ್ಕೃತಿಕ ಪರಂಪರೆ"
              : language === "hi"
              ? "ऐतिहासिक एवं सांस्कृतिक धरोहर"
              : "Historical & Cultural Heritage"}
          </h2>
          <p>
            {language === "kn"
              ? "ಲಕ್ಷ್ಮೇಶ್ವರವು ಕರ್ನಾಟಕದ ಗದಗ ಜಿಲ್ಲೆಯ ಐತಿಹಾಸಿಕ ಪಟ್ಟಣವಾಗಿದ್ದು, ಕಲ್ಯಾಣ ಚಾಲುಕ್ಯರು ಮತ್ತು ಸೇವುಣ (ಯಾದವ) ಸಾಮ್ರಾಜ್ಯಗಳ ಪ್ರಾಚೀನ ಸ್ಮಾರಕಗಳು, ದೇವಾಲಯಗಳು ಮತ್ತು ಶಿಲಾಶಾಸನಗಳಿಗೆ ಪ್ರಸಿದ್ಧವಾಗಿದೆ. ಸೋಮೇಶ್ವರ ದೇವಾಲಯ ಸಂಕೀರ್ಣ, ಜೈನ ಬಸದಿಗಳು ಮತ್ತು ಶ್ರೀಮಂತ ಸಾಹಿತ್ಯಿಕ ಪರಂಪರೆಗೆ ಹೆಸರಾದ ಇದು ಉತ್ತರ ಕರ್ನಾಟಕದಲ್ಲಿ ಅತ್ಯಂತ ಮಹತ್ವದ ಸ್ಥಾನ ಹೊಂದಿದೆ."
              : language === "hi"
              ? "लक्ष्मेश्वर कर्नाटक के गदग जिले का एक ऐतिहासिक नगर है, जो कल्याणी चालुक्य और सेउना (यादव) राजवंशों के प्राचीन स्मारकों, मंदिरों और शिलालेखों के लिए प्रसिद्ध है। सोमेश्वर मंदिर परिसर, जैन बसदि और समृद्ध साहित्यिक परंपरा के लिए विख्यात यह नगर उत्तर कर्नाटक में विशेष महत्व रखता है।"
              : "Lakshmeshwar is a historic town in Gadag district, Karnataka, renowned for its ancient monuments, temples, and inscriptions dating back to the Kalyana Chalukyas and Seuna (Yadava) dynasties. Famed for the Someshwara temple complex, Jain basadis, and rich literary traditions, it holds deep historical significance in North Karnataka."}
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="p-4 rounded-lg bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 flex items-start gap-3">
            <Landmark className="w-6 h-6 text-[#064E4A] dark:text-teal-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">
                {language === "kn" ? "ಪುರಸಭೆ ಆಡಳಿತ" : language === "hi" ? "नगर पालिका प्रशासन" : "Municipal Governance"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                {language === "kn"
                  ? "ಪುರಸಭೆಯು ಪಟ್ಟಣ ವ್ಯಾಪ್ತಿಯ 23 ವಾರ್ಡ್‌ಗಳನ್ನು ನಿರ್ವಹಿಸುತ್ತಿದ್ದು, ಮೂಲಸೌಕರ್ಯ, ಸ್ವಚ್ಛ ರಸ್ತೆಗಳು, ಸಮಗ್ರ ಕುಡಿಯುವ ನೀರಿನ ಜಾಲ ಮತ್ತು ಬೀದಿದೀಪಗಳ ಸೌಲಭ್ಯವನ್ನು ಖಾತರಿಪಡಿಸುತ್ತದೆ."
                  : language === "hi"
                  ? "नगर पालिका परिषद 23 वार्डों का प्रशासन करती है, जो मूलभूत अधोसंरचना, स्वच्छ सड़कें, जल नेटवर्क और स्ट्रीट लाइट सुनिश्चित करती है।"
                  : "The Town Municipal Council administers 23 wards across the municipal limits, ensuring essential infrastructure, clean roads, water networks, and street lighting."}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-3">
            <Shield className="w-6 h-6 text-amber-700 dark:text-amber-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">
                {language === "kn" ? "ಸಿವಿಸೇತು ಉಪಕ್ರಮ" : language === "hi" ? "सिवಿसेतु पहल" : "CivSetu Initiative"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                {language === "kn"
                  ? "ಸಿವಿಸೇತು ಎಂಬುದು ಪುರಸಭೆ ಅಧಿಕಾರಿಗಳು ಮತ್ತು ನಾಗರಿಕರ ನಡುವಿನ ಸಂಪರ್ಕವನ್ನು ಸುಲಭಗೊಳಿಸಲು ಹಾಗೂ ಪಾರದರ್ಶಕ ಡಿಜಿಟಲ್ ಸೇವೆ ಒದಗಿಸಲು ರೂಪಿಸಲಾದ ಪ್ರಮುಖ ಪೋರ್ಟಲ್ ಆಗಿದೆ."
                  : language === "hi"
                  ? "सिवಿसेतु हमारा पारदर्शी डिजिटल पोर्टल है जो नगर पालिका अधिकारियों और नागरिकों के बीच सेतु बनकर निर्बाध सेवाएं प्रदान करता है।"
                  : "CivSetu is our flagship transparent digital portal designed to bridge the connection between municipal authorities and citizens, providing seamless service delivery."}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#064E4A] dark:text-teal-300 mb-2">
            {language === "kn"
              ? "ಆಡಳಿತಾತ್ಮಕ ರಚನೆ"
              : language === "hi"
              ? "प्रशासनिक संरचना"
              : "Administrative Structure"}
          </h2>
          <p>
            {language === "kn"
              ? "ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ನಗರಾಭಿವೃದ್ಧಿ ಇಲಾಖೆಯ ಅಡಿಯಲ್ಲಿ, ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆಯು ಆಡಳಿತಾಧಿಕಾರಿಗಳ ಮಾರ್ಗದರ್ಶನದಲ್ಲಿ ಮತ್ತು ಮುಖ್ಯಾಧಿಕಾರಿಗಳ ನೇತೃತ್ವದಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ. ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು, ಜಲಶ್ರೀ ನೀರು ಯೋಜನೆಗಳು ಮತ್ತು ಪರಿಸರ ಸುಸ್ಥಿರತೆಯನ್ನು ತಲುಪಿಸಲು ಗದಗ ಜಿಲ್ಲಾಡಳಿತದೊಂದಿಗೆ ಪುರಸಭೆ ನಿಕಟವಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ."
              : language === "hi"
              ? "कर्नाटक सरकार के नगर विकास विभाग के अंतर्गत, लक्ष्मेश्वर TMC प्रशासक के मार्गदर्शन में एवं मुख्य अधिकारी के नेतृत्व में संचालित है। परिषद गदग जिला प्रशासन के साथ मिलकर कल्याणकारी योजनाएं एवं जलापूर्ति परियोजनाएं संचालित करती है।"
              : "Under the Urban Development Department, Government of Karnataka, Lakshmeshwar TMC is guided by the Administrator and headed operationally by the Chief Officer. The council works in close synergy with district administration in Gadag to deliver welfare schemes, Jalashri Kalyana water projects, and urban environmental sustainability."}
          </p>
        </section>
      </div>
    </PageContainer>
  );
}
