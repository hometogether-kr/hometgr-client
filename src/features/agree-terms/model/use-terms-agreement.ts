"use client";

import { useCallback, useState } from "react";

import type { TermId, TermItem } from "./terms";
import { TERMS } from "./terms";

export interface UseTermsAgreementOptions {
  terms?: readonly TermItem[];
  initialAgreedIds?: readonly TermId[];
}

export interface TermsAgreement {
  terms: readonly TermItem[];
  agreedIds: readonly TermId[];
  isAgreed: (id: TermId) => boolean;
  toggle: (id: TermId) => void;
  /** 전체 동의 체크박스 상태 */
  allAgreed: boolean;
  /** 일부만 동의한 상태 — 체크박스 indeterminate 표시용 */
  partiallyAgreed: boolean;
  toggleAll: () => void;
  /** 필수 약관을 모두 동의했는지 — CTA 활성화 조건 */
  requiredSatisfied: boolean;
}

/**
 * 약관 동의 상태
 *
 * 전체 동의는 모든 항목을 한 번에 켜고 끄며, 개별 항목을 하나라도 해제하면
 * 자동으로 풀립니다(파생 값으로 계산).
 */
export function useTermsAgreement({
  terms = TERMS,
  initialAgreedIds = [],
}: UseTermsAgreementOptions = {}): TermsAgreement {
  const [agreedIds, setAgreedIds] = useState<TermId[]>(() => [...initialAgreedIds]);

  const isAgreed = useCallback((id: TermId) => agreedIds.includes(id), [agreedIds]);

  const toggle = useCallback((id: TermId) => {
    setAgreedIds((current) =>
      current.includes(id) ? current.filter((agreedId) => agreedId !== id) : [...current, id],
    );
  }, []);

  const allAgreed = terms.every((term) => agreedIds.includes(term.id));

  const toggleAll = useCallback(() => {
    setAgreedIds((current) =>
      terms.every((term) => current.includes(term.id)) ? [] : terms.map((term) => term.id),
    );
  }, [terms]);

  return {
    terms,
    agreedIds,
    isAgreed,
    toggle,
    allAgreed,
    partiallyAgreed: terms.some((term) => agreedIds.includes(term.id)) && !allAgreed,
    toggleAll,
    requiredSatisfied: terms.filter((term) => term.required).every((term) =>
      agreedIds.includes(term.id),
    ),
  };
}
