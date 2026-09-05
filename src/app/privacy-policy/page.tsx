import React from "react";
import { PageContainer } from "@/components/UI/PageContainer";

export default function PrivacyPolicyPage() {
  return (
    <PageContainer
      title="Privacy Policy"
      subtitle="Commitment to protecting citizen privacy and confidentiality"
      breadcrumbs={[{ label: "Privacy Policy" }]}
    >
      <div className="space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
        <p>
          This portal does not automatically capture any specific personal information from you, (like name,
          phone number or e-mail address), that allows us to identify you individually.
        </p>
        <p>
          If the CivSetu Portal requests you to provide personal information, you will be informed for the
          particular purposes for which the information is gathered and adequate security measures will be taken to
          protect your personal information.
        </p>
        <p>
          We do not sell or share any personally identifiable information volunteered on the municipal portal site
          to any third party (public/private). Any information provided to this portal will be protected from loss,
          misuse, unauthorized access or disclosure, alteration, or destruction.
        </p>
      </div>
    </PageContainer>
  );
}
