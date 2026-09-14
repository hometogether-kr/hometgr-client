"use client";

import { useState } from "react";

import { useToast } from "@/shared/ui/toast";

import { visitReviewSchema } from "./visit-review.schema";

interface VisitReviewFormValues {
  hostRating: number;
  roomMatchRating: number;
  content: string;
}

type VisitReviewFieldErrors = Partial<Record<keyof VisitReviewFormValues, string>>;

const EMPTY_VALUES: VisitReviewFormValues = {
  hostRating: 0,
  roomMatchRating: 0,
  content: "",
};

/**
 * 방문 후기 폼 상태
 *
 * 별점·후기 입력을 담고 제출 시 스키마로 검증합니다. 현재 OpenAPI에는 후기 생성
 * 경로가 없으므로 검증 뒤 준비 중 안내를 표시합니다.
 */
export function useVisitReviewForm() {
  const { showToast } = useToast();
  const [values, setValues] = useState<VisitReviewFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<VisitReviewFieldErrors>({});

  const setField = <K extends keyof VisitReviewFormValues>(
    key: K,
    value: VisitReviewFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const submit = () => {
    const parsed = visitReviewSchema.safeParse(values);

    if (!parsed.success) {
      const fieldErrors: VisitReviewFieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof VisitReviewFormValues;
        fieldErrors[key] ??= issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    showToast("후기 등록 기능은 준비 중이에요.", { variant: "info" });
  };

  return { values, errors, setField, submit };
}
