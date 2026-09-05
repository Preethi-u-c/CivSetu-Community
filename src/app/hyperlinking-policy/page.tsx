import React from "react";
import { PageContainer } from "@/components/UI/PageContainer";

export default function HyperlinkingPolicyPage() {
  return (
    <PageContainer
      title="Hyperlinking Policy"
      subtitle="Regulations regarding external links and referencing Lakshmeshwar TMC"
      breadcrumbs={[{ label: "Hyperlinking Policy" }]}
    >
      <div className="space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
        <h2 className="text-base font-bold text-[#064E4A] dark:text-teal-300">Links to External Websites/Portals</h2>
        <p>
          At many places in this portal, you will find links to other websites/portals. These links have been
          placed for your convenience. Lakshmeshwar Town Municipal Council is not responsible for the contents and
          reliability of the linked websites and does not necessarily endorse the views expressed in them.
        </p>
        <h2 className="text-base font-bold text-[#064E4A] dark:text-teal-300">Links to CivSetu by other Websites</h2>
        <p>
          We do not object to you linking directly to the information that is hosted on our site and no prior
          permission is required for the same. However, we do not permit our pages to be loaded into frames on your
          site. The pages belonging to this portal must load into a newly opened window of the user.
        </p>
      </div>
    </PageContainer>
  );
}
