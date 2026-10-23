"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { BtnCta } from "@/shared/ui/btn-cta";

import { useShinhanStorage } from "../model/storage-context";

export function ShinhanLivePreparation() {
  const storage = useShinhanStorage();
  if (process.env.NODE_ENV !== "development") return null;
  return (
    <div className="mb-4 space-y-3 rounded-xl border border-primary-200 bg-primary-50 p-4 text-sm leading-6 text-grayscale-700">
      <p>로컬 서버 저장 확인용입니다. 서버 동의 전문을 준비한 뒤 필수 동의를 다시 선택해 주세요.</p>
      {storage.consents ? (
        <p role="status">서버 동의 전문과 신청 세션을 준비했습니다.</p>
      ) : (
        <BtnCta
          type="button"
          variant="stroke"
          className="w-full whitespace-normal"
          disabled={
            storage.preparing ||
            storage.pending ||
            storage.attempt !== null ||
            storage.error?.status === 401 ||
            storage.retryInSeconds > 0
          }
          onClick={() => {
            void storage.prepare();
          }}
        >
          {storage.preparing ? "신청 준비 중…" : "실제 저장 준비 (개발용)"}
        </BtnCta>
      )}
    </div>
  );
}

export function ShinhanLiveSubmit({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const storage = useShinhanStorage();
  const router = useRouter();
  const fieldErrors = [...new Set(Object.values(storage.fieldErrors).flat())];
  const canCorrect =
    storage.error &&
    ([400, 413, 422].includes(storage.error.status) ||
      storage.error.code === "CONSENT_VERSION_MISMATCH" ||
      storage.error.code === "CSRF_INVALID");

  async function submit() {
    if (await storage.submitApplication()) router.push("/shinhan/dev/application");
  }

  async function retry() {
    if (await storage.retry()) router.push("/shinhan/dev/application");
  }

  return (
    <div className="space-y-3" aria-busy={storage.pending || storage.preparing}>
      <BtnCta
        type="button"
        className={className}
        disabled={
          process.env.NODE_ENV !== "development" ||
          !storage.consents ||
          storage.preparing ||
          storage.pending ||
          storage.attempt !== null
        }
        onClick={() => {
          void submit();
        }}
      >
        {storage.pending ? "저장 결과 확인 중…" : children}
      </BtnCta>
      <p className="text-sm leading-6 text-grayscale-600">
        {process.env.NODE_ENV === "development"
          ? "서버 저장 성공 응답을 받은 뒤에만 결과·완료 화면으로 이동합니다. 로컬 동의 전문은 운영 승인본이 아닙니다."
          : "실제 접수는 연결 준비가 완료된 뒤 이용할 수 있습니다."}
      </p>
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
          {!storage.attempt && !storage.consents && storage.error.status !== 401 && (
            <BtnCta
              type="button"
              variant="stroke"
              className="w-full whitespace-normal"
              disabled={storage.preparing || storage.retryInSeconds > 0}
              onClick={() => {
                void storage.prepare();
              }}
            >
              신청 준비 다시 시도
            </BtnCta>
          )}
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
        href="/shinhan/dev/application"
      >
        저장한 신청 내역 보기
      </Link>
    </section>
  );
}
