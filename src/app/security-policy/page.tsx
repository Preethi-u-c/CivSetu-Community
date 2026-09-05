import React from "react";
import { PageContainer } from "@/components/UI/PageContainer";

export default function SecurityPolicyPage() {
  return (
    <PageContainer
      title="Security Policy"
      subtitle="Safeguards, data encryption, and system resilience protocols"
      breadcrumbs={[{ label: "Security Policy" }]}
    >
      <div className="space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
        <p>
          CivSetu has implemented rigorous security measures to protect the loss, misuse, and alteration of the
          information under our control. All data transmission between the browser and municipal servers is
          secured using Transport Layer Security (TLS 1.3).
        </p>
        <p>
          Routine vulnerability assessments and CERT-In compliant security audits are conducted to ensure
          compliance with government security standards. Unauthorized attempts to upload or change information on
          this service are strictly prohibited and may be punishable under the Information Technology Act, 2000.
        </p>
      </div>
    </PageContainer>
  );
}
