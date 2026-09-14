"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const TermsDocumentModal = dynamic(() =>
  import("@/features/agree-terms").then((module) => module.TermsDocumentModal),
);

export function FooterPolicyLinks() {
  const [openedPolicy, setOpenedPolicy] = useState<"service" | "privacy" | null>(null);

  return (
    <>
      <nav aria-label="약관 및 정책" className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setOpenedPolicy("service")}
          className="min-h-11 rounded-sm text-sm underline underline-offset-4 hover:text-grayscale-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
        >
          이용약관
        </button>
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setOpenedPolicy("privacy")}
          className="min-h-11 rounded-sm text-sm font-semibold underline underline-offset-4 hover:text-grayscale-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
        >
          개인정보 처리방침
        </button>
      </nav>
      {openedPolicy && (
        <TermsDocumentModal termId={openedPolicy} onClose={() => setOpenedPolicy(null)} />
      )}
    </>
  );
}
