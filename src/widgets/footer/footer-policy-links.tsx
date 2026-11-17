"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";

import { ROUTES } from "@/shared/config";

const TermsDocumentModal = dynamic(() =>
  import("@/features/agree-terms").then((module) => module.TermsDocumentModal),
);

export function FooterPolicyLinks() {
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  return (
    <>
      <nav aria-label="약관 및 정책" className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setIsTermsOpen(true)}
          className="min-h-11 rounded-sm text-sm underline underline-offset-4 hover:text-grayscale-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
        >
          이용약관
        </button>
        <Link
          href={ROUTES.privacyPolicy}
          className="inline-flex min-h-11 items-center rounded-sm text-sm font-semibold underline underline-offset-4 hover:text-grayscale-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
        >
          개인정보 처리방침
        </Link>
      </nav>
      {isTermsOpen && <TermsDocumentModal termId="service" onClose={() => setIsTermsOpen(false)} />}
    </>
  );
}
