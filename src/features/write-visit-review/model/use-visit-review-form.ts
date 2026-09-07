"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ROUTES } from "@/shared/config";
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
 * 별점·후기 입력을 담고, 제출 시 스키마로 검증합니다. 백엔드 연동 전이라 통과하면
 * 성공 토스트를 띄우고 예약 상세로 돌아갑니다.
 */
export function useVisitReviewForm(reservationId: string) {
  const router = useRouter();
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

    showToast("방문 후기를 등록했어요.", { variant: "success" });
    router.push(ROUTES.reservationDetail(reservationId));
  };

  return { values, errors, setField, submit };
}
