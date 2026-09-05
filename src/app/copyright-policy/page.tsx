import React from "react";
import { PageContainer } from "@/components/UI/PageContainer";

export default function CopyrightPolicyPage() {
  return (
    <PageContainer
      title="Copyright Policy"
      subtitle="Terms regarding the usage and reproduction of CivSetu content"
      breadcrumbs={[{ label: "Copyright Policy" }]}
    >
      <div className="space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
        <p>
          Material featured on this portal may be reproduced free of charge after getting proper permission by
          sending a mail to us. However, the material has to be reproduced accurately and not to be used in a
          derogatory manner or in a misleading context.
        </p>
        <p>
          Wherever the material is being published or issued to others, the source must be prominently
          acknowledged. However, the permission to reproduce this material does not extend to any material on this
          site, which is explicitly identified as being the copyright of a third party.
        </p>
        <p>
          Authorisation to reproduce such material must be obtained from the departments or copyright holders
          concerned.
        </p>
      </div>
    </PageContainer>
  );
}
