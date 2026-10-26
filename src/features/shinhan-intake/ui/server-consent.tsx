"use client";

import type { ReactNode } from "react";

import { useShinhanStorage } from "../model/storage-context";
import { ShinhanSessionRestart } from "./live-submit";
import { ShinhanPrivacyReturn } from "./privacy-navigation";

export function ShinhanConsentStatus() {
  const {
    consents,
    consentsLoading,
    consentError,
    reloadConsents,
    sessionMode,
    sessionExpired,
    attempt,
  } = useShinhanStorage();
  if (consents) return null;
  if (consentsLoading)
    return (
      <p role="status" className="mt-2 text-sm leading-6 text-grayscale-600">
        개인정보 안내를 확인하고 있어요…
      </p>
    );
  if (sessionMode === "unavailable" || sessionExpired || !consentError) return null;
  return (
    <div role="alert" className="mt-2 text-sm leading-6 text-system-error">
      <p>개인정보 안내를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</p>
      <button
        type="button"
        disabled={attempt !== null}
        className="min-h-11 cursor-pointer text-primary-600 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed"
        onClick={() => void reloadConsents()}
      >
        다시 불러오기
      </button>
    </div>
  );
}

export function ServerConsentDocument({ fallback }: { fallback: ReactNode }) {
  const { consents, consentsLoading, application, sessionMode } = useShinhanStorage();
  if (!consents) {
    if (sessionMode === "unavailable" && process.env.NODE_ENV === "development") return fallback;
    return (
      <article className="mx-auto max-w-4xl space-y-6 px-5 py-10 md:px-8 md:py-16">
        <ShinhanPrivacyReturn />
        <h1 className="text-2xl leading-snug font-bold md:text-4xl">
          개인정보 수집·이용 전문 (필수)
        </h1>
        <p className="text-base leading-8">
          {consentsLoading
            ? "개인정보 안내를 불러오는 중입니다. 작성하던 내용은 그대로 유지돼요."
            : "현재 개인정보 안내를 확인할 수 없어요. 작성하던 내용은 그대로 유지됩니다."}
        </p>
        <ShinhanConsentStatus />
        <ShinhanSessionRestart />
        <ShinhanPrivacyReturn />
      </article>
    );
  }
  const snapshot = consents.required;
  return (
    <article className="mx-auto max-w-4xl space-y-6 px-5 py-10 md:px-8 md:py-16">
      <ShinhanPrivacyReturn />
      <header className="space-y-3">
        <h1 className="text-2xl leading-snug font-bold md:text-4xl">
          개인정보 수집·이용 전문 (필수)
        </h1>
        <p className="text-sm leading-6 break-all text-grayscale-600">
          전문 버전: {snapshot.version}
        </p>
        {consents.localOnly && (
          <p className="rounded-xl bg-primary-50 p-4 text-sm leading-6">
            로컬 저장 확인용 전문입니다. 운영 승인본이 아닙니다. 열람만으로 동의하거나 신청을
            저장하지 않습니다.
          </p>
        )}
        {application && application.requiredConsent.version !== snapshot.version && (
          <p className="text-sm leading-6 text-grayscale-600">
            현재 제출에 사용할 전문입니다. 기존 신청에 기록된 필수 동의 버전은{" "}
            {application.requiredConsent.version}이며, 이 전문을 열람하거나 다시 불러와도 기존 동의
            기록은 변경되지 않습니다.
          </p>
        )}
      </header>
      <div className="rounded-2xl bg-white p-5 text-base leading-8 break-words whitespace-pre-wrap md:p-8">
        {snapshot.content}
      </div>
      <ShinhanPrivacyReturn />
    </article>
  );
}
