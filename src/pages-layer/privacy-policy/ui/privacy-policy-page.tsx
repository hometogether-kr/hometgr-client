import Image from "next/image";

import { getTermsPageSources } from "@/features/agree-terms";
import { SiteLayout } from "@/widgets/site-layout";

export function PrivacyPolicyPage() {
  const pages = getTermsPageSources("privacy");

  return (
    <SiteLayout background="white" showFooter={false}>
      <article className="mx-auto w-full max-w-[800px] px-5 py-8 md:py-12">
        <h1 className="mb-6 text-heading-1 font-semibold text-grayscale-900">개인정보 처리방침</h1>
        <div className="space-y-3">
          {pages.map((source, index) => (
            <Image
              key={source}
              src={source}
              alt={`개인정보 처리방침 ${index + 1}쪽`}
              width={2483}
              height={3513}
              unoptimized
              loading={index === 0 ? "eager" : "lazy"}
              className="h-auto w-full border border-grayscale-200"
            />
          ))}
        </div>
      </article>
    </SiteLayout>
  );
}
