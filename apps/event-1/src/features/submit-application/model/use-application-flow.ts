"use client";

import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { z } from "zod";

import { formatMoveInTiming, moveInTimingSchema } from "@/domains/event-application";

import type { ApplicationSubmission } from "../api/submit-application";
import { submitApplication } from "../api/submit-application";
import type { ApplicationInput } from "./application-input.schema";
import { applicationInputSchema } from "./application-input.schema";

interface ApplicationDraft {
  universityCampus: string;
  moveInYear: string;
  moveInMonth: string;
  moveInPeriod: string;
  phone: string;
  email: string;
  consentAccepted: boolean;
}

interface FieldErrors {
  universityCampus?: string;
  moveInTiming?: string;
  phone?: string;
  email?: string;
  consentAccepted?: string;
}

const emptyDraft: ApplicationDraft = {
  universityCampus: "",
  moveInYear: "",
  moveInMonth: "",
  moveInPeriod: "",
  phone: "",
  email: "",
  consentAccepted: false,
};
const sourceSchema = z.string().trim().min(1).max(80);
const universitySchema = applicationInputSchema.pick({
  universityCampus: true,
  moveInTiming: true,
});

function moveInTimingFromDraft(draft: ApplicationDraft) {
  return {
    year: Number(draft.moveInYear),
    month: Number(draft.moveInMonth),
    period: draft.moveInPeriod,
  };
}

function moveInFocusTarget(draft: ApplicationDraft) {
  if (
    !/^\d{4}$/.test(draft.moveInYear) ||
    Number(draft.moveInYear) < 2000 ||
    Number(draft.moveInYear) > 2100
  )
    return "move-in-year";
  return draft.moveInMonth ? "move-in-period" : "move-in-month";
}

export function useApplicationFlow() {
  const [stage, setStage] = useState<"university" | "contact" | "complete">("university");
  const [draft, setDraft] = useState<ApplicationDraft>(emptyDraft);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [closed, setClosed] = useState(false);
  const [accepted, setAccepted] = useState<ApplicationInput | null>(null);
  const submission = useRef<ApplicationSubmission | null>(null);
  const submitting = useRef(false);
  const locked = pending || uncertain;
  const selectedTiming = moveInTimingSchema.safeParse(moveInTimingFromDraft(draft));
  const moveInSummary = selectedTiming.success ? formatMoveInTiming(selectedTiming.data) : "";

  function handleUniversitySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = universitySchema.safeParse({
      universityCampus: draft.universityCampus,
      moveInTiming: moveInTimingFromDraft(draft),
    });
    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0] === "universityCampus")
          nextErrors.universityCampus = "대학교와 캠퍼스를 입력해 주세요.";
        if (issue.path[0] === "moveInTiming")
          nextErrors.moveInTiming = "희망 입주 연도 4자리와 월, 시기를 모두 입력해 주세요.";
      }
      setErrors(nextErrors);
      document
        .getElementById(
          nextErrors.universityCampus ? "university-campus" : moveInFocusTarget(draft),
        )
        ?.focus();
      return;
    }
    setDraft({ ...draft, universityCampus: parsed.data.universityCampus });
    setErrors({});
    setStage("contact");
    window.scrollTo({ top: 0 });
  }

  async function handleApplicationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || closed) return;
    if (!submission.current) {
      const source = sourceSchema.safeParse(
        new URLSearchParams(window.location.search).get("source"),
      );
      const parsed = applicationInputSchema.safeParse({
        ...draft,
        moveInTiming: moveInTimingFromDraft(draft),
        source: source.success ? source.data : undefined,
      });
      if (!parsed.success) {
        const nextErrors: FieldErrors = {};
        for (const issue of parsed.error.issues) {
          if (issue.path[0] === "moveInTiming")
            nextErrors.moveInTiming = "희망 입주 시점을 확인해 주세요.";
          if (issue.path[0] === "phone") nextErrors.phone = "전화번호를 입력해 주세요. (10~11자리)";
          if (issue.path[0] === "email") nextErrors.email = "이메일 주소를 입력해 주세요.";
          if (issue.path[0] === "consentAccepted")
            nextErrors.consentAccepted = "개인정보 수집·이용에 동의해 주세요.";
        }
        setErrors(nextErrors);
        if (nextErrors.moveInTiming) {
          setStage("university");
          return;
        }
        const firstField = nextErrors.phone ? "phone" : nextErrors.email ? "email" : "consent";
        document.getElementById(firstField)?.focus();
        return;
      }
      submission.current = { key: crypto.randomUUID(), input: parsed.data };
    }
    const currentSubmission = submission.current;
    submitting.current = true;
    setPending(true);
    setErrors({});
    setMessage("");
    const result = await submitApplication(currentSubmission);
    submitting.current = false;
    setPending(false);
    if (result.status === "accepted") {
      setAccepted(currentSubmission.input);
      setStage("complete");
      setUncertain(false);
      window.scrollTo({ top: 0 });
      return;
    }
    if (result.status === "uncertain") {
      setUncertain(true);
      setMessage(
        "접수 결과를 확인하지 못했어요. 아래 버튼으로 다시 확인해 주세요. 같은 신청은 중복 저장되지 않아요.",
      );
      return;
    }
    submission.current = null;
    setUncertain(false);
    if (result.status === "closed") {
      setClosed(true);
      setMessage("이벤트 신청이 마감되었어요.");
      return;
    }
    setMessage(result.message);
  }

  function handleRestart() {
    submission.current = null;
    setDraft(emptyDraft);
    setAccepted(null);
    setErrors({});
    setMessage("");
    setUncertain(false);
    setStage("university");
    window.scrollTo({ top: 0 });
  }

  return {
    stage,
    draft,
    errors,
    message,
    pending,
    uncertain,
    closed,
    accepted,
    locked,
    moveInSummary,
    setDraft,
    setErrors,
    setStage,
    setMessage,
    handleUniversitySubmit,
    handleApplicationSubmit,
    handleRestart,
  };
}
