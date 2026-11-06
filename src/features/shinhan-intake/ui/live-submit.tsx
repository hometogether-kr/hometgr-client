"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { BtnCta } from "@/shared/ui/btn-cta";

import { SHINHAN_SAVED_APPLICATION_PATH } from "../config/routes";
import { useShinhanStorage } from "../model/storage-context";

export function ShinhanLiveSubmit({
  children,
  className,
  notice = "신청이 완료되면 접수 내역을 확인할 수 있어요.",
  onSaved,
}: {
  children: ReactNode;
  className?: string;
  notice?: string;
  onSaved?: () => void;
}) {
  const storage = useShinhanStorage();
  const router = useRouter();
  const fieldErrors = [...new Set(Object.values(storage.fieldErrors).flat())];
  const canCorrect =
    storage.error &&
    ([400, 413, 422].includes(storage.error.status) ||
      storage.error.code === "CONSENT_VERSION_MISMATCH" ||
      storage.error.code === "CSRF_INVALID");

  function showSavedApplication() {
    try {
      onSaved?.();
    } catch {
      // Optional observers must never interrupt an already successful application.
    }
    router.push(SHINHAN_SAVED_APPLICATION_PATH);
  }

  async function submit() {
    if (await storage.submitApplication()) showSavedApplication();
  }

  async function retry() {
    if (await storage.retry()) showSavedApplication();
  }

  return (
    <div className="space-y-3" aria-busy={storage.pending || storage.preparing}>
      <BtnCta
        type="button"
        className={className}
        disabled={
          !storage.submissionAvailable ||
          !storage.consents ||
          storage.preparing ||
          storage.pending ||
          storage.sessionExpired ||
          storage.attempt !== null
        }
        onClick={() => {
          void submit();
        }}
      >
        {storage.pending ? "신청 중…" : children}
      </BtnCta>
      {(notice || !storage.submissionAvailable) && (
        <p className="text-sm leading-6 text-grayscale-600">
          {storage.submissionAvailable
            ? notice
            : "지금은 신청을 이용할 수 없어요. 잠시 후 다시 시도해 주세요."}
        </p>
      )}
      {storage.error && (
        <div
          role="alert"
          className="space-y-3 rounded-xl border border-grayscale-200 bg-white p-4 text-sm leading-6"
        >
          <p>{storage.error.message}</p>
          {storage.retryInSeconds > 0 && <p>{storage.retryInSeconds}초 후 다시 시도해 주세요.</p>}
          {storage.attempt && storage.error.retryable && (
            <>
              <p>저장 여부가 확정될 때까지 입력을 유지합니다. 같은 요청으로 다시 확인해 주세요.</p>
              <p>
                재시도 전에는 이 탭을 닫거나 새로고침하지 마세요. 개인정보 전문은 다녀올 수
                있습니다.
              </p>
              <BtnCta
                type="button"
                variant="stroke"
                className="w-full whitespace-normal"
                disabled={storage.pending || !storage.retryReady}
                onClick={() => {
                  void retry();
                }}
              >
                같은 내용으로 다시 시도
              </BtnCta>
            </>
          )}
          {storage.attempt && canCorrect && (
            <BtnCta
              type="button"
              variant="stroke"
              className="w-full whitespace-normal"
              disabled={storage.pending}
              onClick={storage.clearRejectedAttempt}
            >
              입력 내용 다시 확인
            </BtnCta>
          )}
          <ShinhanSessionRestart />
        </div>
      )}
      {fieldErrors.length > 0 && (
        <ul role="alert" className="list-inside list-disc text-sm leading-6 text-system-error">
          {fieldErrors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ShinhanSessionRestart() {
  const { sessionExpired, preparing, pending, restartSession } = useShinhanStorage();
  if (!sessionExpired) return null;
  return (
    <div className="space-y-3 text-sm leading-6">
      <p>
        이전 요청은 이미 접수됐을 수 있습니다. 새로 시작해도 기존 접수는 삭제되지 않으며 자동으로
        다시 제출하지 않습니다. 입력 내용은 유지하고 필수 동의를 다시 확인합니다.
      </p>
      <BtnCta
        type="button"
        variant="stroke"
        disabled={preparing || pending}
        onClick={() => void restartSession()}
      >
        새 신청 세션으로 다시 시작
      </BtnCta>
    </div>
  );
}

export function ShinhanSavedApplicationNotice() {
  return (
    <section
      className="mx-auto my-10 max-w-2xl space-y-4 rounded-2xl border border-primary-200 bg-white p-6 text-center"
      aria-label="저장한 신청 안내"
    >
      <h2 className="text-2xl font-bold">신청이 저장되어 조회만 할 수 있어요</h2>
      <p className="leading-7 text-grayscale-600">
        접수한 입력값은 변경되지 않습니다. 저장된 신청 내역에서 확인해 주세요.
      </p>
      <Link
        className="inline-flex min-h-12 items-center rounded-xl bg-primary-500 px-5 py-3 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-600"
        href={SHINHAN_SAVED_APPLICATION_PATH}
      >
        저장한 신청 내역 보기
      </Link>
    </section>
  );
}
