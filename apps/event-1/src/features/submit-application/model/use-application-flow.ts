"use client";

import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { z } from "zod";

import type { ApplicationSubmission } from "../api/submit-application";
import { submitApplication } from "../api/submit-application";
import type { ApplicationInput } from "./application-input.schema";
import { applicationInputSchema } from "./application-input.schema";

interface ApplicationDraft {
  universityCampus: string;
  phone: string;
  email: string;
  consentAccepted: boolean;
}

interface FieldErrors {
  universityCampus?: string;
  phone?: string;
  email?: string;
  consentAccepted?: string;
}

const emptyDraft: ApplicationDraft = {
  universityCampus: "",
  phone: "",
  email: "",
  consentAccepted: false,
};
const sourceSchema = z.string().trim().min(1).max(80);
const universitySchema = applicationInputSchema.pick({ universityCampus: true });

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

  function handleUniversitySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = universitySchema.safeParse(draft);
    if (!parsed.success) {
      setErrors({ universityCampus: "대학교와 캠퍼스를 입력해 주세요." });
      document.getElementById("university-campus")?.focus();
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
        source: source.success ? source.data : undefined,
      });
      if (!parsed.success) {
        const nextErrors: FieldErrors = {};
        for (const issue of parsed.error.issues) {
          if (issue.path[0] === "phone") nextErrors.phone = "전화번호를 입력해 주세요. (10~11자리)";
          if (issue.path[0] === "email") nextErrors.email = "이메일 주소를 입력해 주세요.";
          if (issue.path[0] === "consentAccepted")
            nextErrors.consentAccepted = "개인정보 수집·이용에 동의해 주세요.";
        }
        setErrors(nextErrors);
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
    setDraft,
    setErrors,
    setStage,
    setMessage,
    handleUniversitySubmit,
    handleApplicationSubmit,
    handleRestart,
  };
}
