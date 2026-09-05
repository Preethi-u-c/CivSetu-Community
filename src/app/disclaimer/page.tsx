import React from "react";
import { PageContainer } from "@/components/UI/PageContainer";

export default function DisclaimerPage() {
  return (
    <PageContainer
      title="Statutory Disclaimer"
      subtitle="Official terms regarding information liability and updates"
      breadcrumbs={[{ label: "Disclaimer" }]}
    >
      <div className="space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
        <p>
          The information contained in this portal is for general information purposes only. The information is
          provided by Lakshmeshwar Town Municipal Council (TMC) and while we endeavour to keep the information up
          to date and correct, we make no representations or warranties of any kind, express or implied, about the
          completeness, accuracy, reliability, suitability or availability with respect to the website or the
          information, services, or related graphics contained on the website.
        </p>
        <p>
          Any reliance you place on such information is therefore strictly at your own risk. Official government
          orders, gazette notifications, and council meeting resolutions shall take precedence over any summary
          text presented on the web interface.
        </p>
      </div>
    </PageContainer>
  );
}
