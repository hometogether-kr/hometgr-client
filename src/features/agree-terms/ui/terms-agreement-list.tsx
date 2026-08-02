"use client";

import { ROUTES } from "@/shared/config";
import { BtnUnderline } from "@/shared/ui/btn-underline";
import { Checkbox } from "@/shared/ui/checkbox";
import { Divider } from "@/shared/ui/divider";
import { TERMS } from "../model/terms";
import type { TermsAgreement } from "../model/use-terms-agreement";

export interface TermsAgreementListProps {
  agreement: TermsAgreement;
  className?: string;
}

/**
 * 약관 동의 목록 (Figma: 643:19267 데스크톱 · 749:17279 모바일)
 *
 * 전체 동의 행 아래에 구분선으로 나뉜 개별 약관이 오고, 각 행 우측에는
 * 약관 전문으로 이동하는 밑줄 링크가 붙습니다.
 */
export function TermsAgreementList({ agreement, className }: TermsAgreementListProps) {
  const { isAgreed, toggle, allAgreed, partiallyAgreed, toggleAll } = agreement;

  return (
    <div
      className={[
        "flex w-full flex-col gap-5 rounded-xl border border-grayscale-200 bg-white p-4 md:gap-5 md:rounded-none md:border-0 md:p-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <label className="flex cursor-pointer items-center gap-3">
        <Checkbox
          size="32"
          checked={allAgreed}
          indeterminate={partiallyAgreed}
          onChange={toggleAll}
        />
        <span className="text-body-2 font-medium text-grayscale-900">전체 동의하기</span>
      </label>

      <div className="flex w-full flex-col gap-4">
        {TERMS.map((term) => (
          <div key={term.id} className="flex w-full flex-col gap-4">
            <Divider />
            <div className="flex w-full items-center justify-between gap-3">
              <label className="flex min-w-0 cursor-pointer items-center gap-3">
                <Checkbox
                  size="24"
                  checked={isAgreed(term.id)}
                  onChange={() => toggle(term.id)}
                />
                <span className="flex min-w-0 items-center gap-3 text-label-1 font-medium">
                  <span className={term.required ? "text-primary-500" : "text-grayscale-700"}>
                    {term.required ? "[필수]" : "[선택]"}
                  </span>
                  <span className="truncate text-grayscale-900">{term.label}</span>
                </span>
              </label>
              <BtnUnderline href={ROUTES.policy(term.id)}>약관 보기</BtnUnderline>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
