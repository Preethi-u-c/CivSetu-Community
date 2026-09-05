import React from "react";
import { PageContainer } from "@/components/UI/PageContainer";

export default function TermsPage() {
  return (
    <PageContainer
      title="Terms and Conditions"
      subtitle="Legal regulations governing the use of CivSetu Municipal Portal"
      breadcrumbs={[{ label: "Terms and Conditions" }]}
    >
      <div className="space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
        <p>
          This website is designed, developed, and maintained by Karnataka Municipal Data Society, UDD,
          Bengaluru, on behalf of Lakshmeshwar Town Municipal Council (TMC).
        </p>
        <p>
          Though all efforts have been made to ensure the accuracy and currency of the content on this website, the
          same should not be construed as a statement of law or used for any legal purposes. In case of any
          ambiguity or doubts, users are advised to verify/check with the Department(s) and/or other source(s), and
          to obtain appropriate professional advice.
        </p>
        <p>
          Under no circumstances will Lakshmeshwar TMC or Government of Karnataka be liable for any expense, loss,
          or damage including, without limitation, indirect or consequential loss or damage, arising from use, or
          loss of use, of data, arising out of or in connection with the use of this portal.
        </p>
      </div>
    </PageContainer>
  );
}
