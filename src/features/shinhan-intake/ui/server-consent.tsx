"use client";

import type { ReactNode } from "react";

import { useShinhanStorage } from "../model/storage-context";
import { ShinhanPrivacyLink, ShinhanPrivacyReturn } from "./privacy-navigation";

export function ShinhanServerConsentSummary({
  kind = "required",
}: {
  kind?: "required" | "optional";
}) {
  const { consents } = useShinhanStorage();
  if (!consents)
    return (
      <p className="mt-2 text-sm leading-6 text-grayscale-600">
        현재 체크는 화면 확인용입니다. 실제 저장 전에 서버 전문을 준비하고 다시 동의해 주세요.
      </p>
    );
  return (
    <div className="mt-2 text-sm leading-6 text-grayscale-600">
      <p>
        표시·제출할 동의 버전: <span className="break-all">{consents[kind].version}</span>
      </p>
      {consents.localOnly && <p>로컬 확인용 전문이며 운영 승인본이 아닙니다.</p>}
      <ShinhanPrivacyLink kind={kind}>
        {kind === "required" ? "서버 필수 동의 전문 보기" : "서버 선택 동의 전문 보기"}
      </ShinhanPrivacyLink>
    </div>
  );
}

export function ServerConsentDocument({ fallback }: { fallback: ReactNode }) {
  const { consents, privacyKind } = useShinhanStorage();
  if (!consents) return fallback;
  const snapshot = consents[privacyKind];
  return (
    <article className="mx-auto max-w-4xl space-y-6 px-5 py-10 md:px-8 md:py-16">
      <ShinhanPrivacyReturn />
      <header className="space-y-3">
        <h1 className="text-2xl leading-snug font-bold md:text-4xl">
          개인정보 수집·이용 전문 ({privacyKind === "required" ? "필수" : "선택"})
        </h1>
        <p className="text-sm leading-6 break-all text-grayscale-600">
          서버 전문 버전: {snapshot.version}
        </p>
        {consents.localOnly && (
          <p className="rounded-xl bg-primary-50 p-4 text-sm leading-6">
            로컬 저장 확인용 전문입니다. 운영 승인본이 아닙니다. 열람만으로 동의하거나 신청을
            저장하지 않습니다.
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
