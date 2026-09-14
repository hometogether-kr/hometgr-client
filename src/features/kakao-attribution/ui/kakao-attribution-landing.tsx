"use client";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";

import type { MarketingSource } from "@/domains/marketing-attribution";

import { submitKakaoLeadIntake } from "../api/lead-intake";
import { openKakaoChannelChat } from "../model/kakao-channel";
import {
  createKakaoLeadIntake,
  initialKakaoLeadIntakeFormValues,
  type KakaoLeadIntakeFormValues,
} from "../model/lead-intake";
import { trackAttributionEvent, type TrackingContext } from "../model/tracking";

interface KakaoAttributionLandingProps {
  campaign?: string;
  source: MarketingSource;
}

function getLandingViewDeduplicationKey({ campaign, source }: TrackingContext) {
  return `hometogether:marketing:landing-view:${source}:${campaign ?? "-"}`;
}

const customerTagOptions = [
  ["UNIVERSITY_STUDENT", "대학생"],
  ["GRADUATE_STUDENT", "대학원생"],
  ["TRANSFER_STUDENT", "편입 준비"],
  ["GRADUATE", "졸업생"],
  ["RETAKER", "N수생"],
  ["HIGH_SCHOOL_STUDENT", "고등학생"],
  ["INTERN", "인턴"],
  ["EARLY_CAREER", "사회초년생"],
  ["FOREIGNER", "외국인"],
  ["OTHER", "기타"],
] as const;

const mustHaveOptions = ["전입신고", "주방", "에어컨", "욕실", "통금 없음", "반려동물"];

const journeyIntentOptions = [
  ["NOW_VIEWABLE_ROOM", "지금 볼 수 있는 방"],
  ["TODAY_OR_TOMORROW_VIEWING", "오늘/내일 방문 가능한 방"],
  ["SCHOOL_OR_REGION_SEARCH", "학교/지역으로 찾기"],
  ["SERVICE_GUIDE", "서비스 이용 방법"],
] as const;

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function KakaoAttributionLanding({ campaign, source }: KakaoAttributionLandingProps) {
  const context = useMemo(() => ({ campaign, source }), [campaign, source]);
  const clickLocked = useRef(false);
  const landingTracked = useRef(false);
  const leadSubmitted = useRef(false);
  const [chatError, setChatError] = useState<string>();
  const [formValues, setFormValues] = useState<KakaoLeadIntakeFormValues>(
    initialKakaoLeadIntakeFormValues,
  );
  const [isOpening, setIsOpening] = useState(false);
  useEffect(() => {
    if (landingTracked.current) return;
    landingTracked.current = true;

    const key = getLandingViewDeduplicationKey(context);
    try {
      if (sessionStorage.getItem(key)) return;
      // Mark first so React Strict Mode cannot send a duplicated page view.
      sessionStorage.setItem(key, "sent");
    } catch {
      // Storage can be unavailable in private browsing; tracking still proceeds.
    }

    void trackAttributionEvent(context, "landing_view").catch(() => {
      console.warn("[marketing-attribution] landing_view was not recorded.");
    });
  }, [context]);

  async function handleChatClick(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (clickLocked.current) return;

    clickLocked.current = true;
    setChatError(undefined);
    setIsOpening(true);

    if (!leadSubmitted.current) {
      try {
        const intake = createKakaoLeadIntake(source, campaign, formValues);
        await submitKakaoLeadIntake(intake);
        leadSubmitted.current = true;
      } catch {
        setChatError("문의 정보를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.");
        setIsOpening(false);
        clickLocked.current = false;
        return;
      }
    }

    // The operational lead is already stored. Attribution reporting is useful
    // but must not interrupt a customer who is about to enter Kakao.
    void trackAttributionEvent(context, "kakao_chat_click").catch(() => {
      console.warn("[marketing-attribution] kakao_chat_click was not recorded.");
    });

    try {
      await openKakaoChannelChat();
    } catch {
      setChatError("카카오 채널 연결 정보를 확인해주세요.");
    } finally {
      setIsOpening(false);
      window.setTimeout(() => {
        clickLocked.current = false;
      }, 1_000);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-grayscale-50 px-4 py-6">
      <section
        aria-labelledby="kakao-attribution-title"
        className="w-full max-w-[430px] rounded-3xl border border-grayscale-200 bg-white px-8 py-12 text-center shadow-[0_18px_55px_rgb(31_42_55_/_9%)]"
      >
        <p className="text-label-2 font-bold tracking-[0.13em] text-primary-500">HOME TOGETHER</p>
        <h1 id="kakao-attribution-title" className="mt-5 text-title-2 font-bold text-grayscale-900">
          홈투게더에 문의하기
        </h1>
        <p className="mt-3 text-body-1 text-grayscale-600">
          상담에 필요한 조건을 먼저 남기면 더 빠르게 도와드릴 수 있어요.
        </p>
        <form
          className="mt-8 grid gap-4 text-left"
          onSubmit={(event) => {
            void handleChatClick(event);
          }}
        >
          <fieldset className="grid gap-2">
            <legend className="text-label-1 font-semibold text-grayscale-800">
              무엇을 도와드릴까요?
            </legend>
            <div className="grid gap-2">
              {journeyIntentOptions.map(([value, label]) => (
                <button
                  aria-pressed={formValues.journeyIntent === value}
                  className="min-h-11 rounded-xl border border-grayscale-300 bg-white px-3 text-left text-label-1 font-semibold text-grayscale-800 aria-pressed:border-primary-500 aria-pressed:bg-primary-50"
                  key={value}
                  onClick={() => setFormValues((current) => ({ ...current, journeyIntent: value }))}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="grid gap-1.5 text-label-1 font-semibold text-grayscale-800">
            문의 목적
            <select
              className="min-h-11 rounded-xl border border-grayscale-300 bg-white px-3 text-body-2"
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  inquiryPurpose: event.target.value as KakaoLeadIntakeFormValues["inquiryPurpose"],
                }))
              }
              value={formValues.inquiryPurpose}
            >
              <option value="FIND_ROOM">방 찾기</option>
              <option value="LIST_ROOM">방 내놓기</option>
              <option value="OTHER">기타 상담</option>
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-label-1 font-semibold text-grayscale-800">
              희망 입주일
              <input
                className="min-h-11 rounded-xl border border-grayscale-300 px-3 text-body-2"
                onChange={(event) =>
                  setFormValues((current) => ({ ...current, desiredMoveIn: event.target.value }))
                }
                type="date"
                value={formValues.desiredMoveIn}
              />
            </label>
            <label className="grid gap-1.5 text-label-1 font-semibold text-grayscale-800">
              희망 기간
              <select
                className="min-h-11 rounded-xl border border-grayscale-300 bg-white px-3 text-body-2"
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    desiredTermMonths: event.target.value,
                  }))
                }
                value={formValues.desiredTermMonths}
              >
                <option value="">선택 안 함</option>
                <option value="1">1개월</option>
                <option value="2">2개월</option>
                <option value="3">3개월</option>
                <option value="4">4개월</option>
                <option value="6">6개월</option>
                <option value="12">12개월</option>
              </select>
            </label>
          </div>
          <label className="grid gap-1.5 text-label-1 font-semibold text-grayscale-800">
            희망 지역
            <input
              className="min-h-11 rounded-xl border border-grayscale-300 px-3 text-body-2"
              maxLength={200}
              onChange={(event) =>
                setFormValues((current) => ({ ...current, desiredRegion: event.target.value }))
              }
              placeholder="예: 서울 성북구"
              value={formValues.desiredRegion}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-label-1 font-semibold text-grayscale-800">
              월세 예산 (원)
              <input
                className="min-h-11 rounded-xl border border-grayscale-300 px-3 text-body-2"
                inputMode="numeric"
                min="0"
                onChange={(event) =>
                  setFormValues((current) => ({ ...current, budgetMonthly: event.target.value }))
                }
                placeholder="선택 안 함"
                type="number"
                value={formValues.budgetMonthly}
              />
            </label>
            <label className="grid gap-1.5 text-label-1 font-semibold text-grayscale-800">
              보증금 예산 (원)
              <input
                className="min-h-11 rounded-xl border border-grayscale-300 px-3 text-body-2"
                inputMode="numeric"
                min="0"
                onChange={(event) =>
                  setFormValues((current) => ({ ...current, budgetDeposit: event.target.value }))
                }
                placeholder="선택 안 함"
                type="number"
                value={formValues.budgetDeposit}
              />
            </label>
          </div>
          <fieldset className="grid gap-2">
            <legend className="text-label-1 font-semibold text-grayscale-800">고객군 태그</legend>
            <div className="flex flex-wrap gap-2">
              {customerTagOptions.map(([value, label]) => (
                <label
                  className="cursor-pointer rounded-full border border-grayscale-300 px-3 py-2 text-label-1 text-grayscale-700"
                  key={value}
                >
                  <input
                    checked={formValues.customerTags.includes(value)}
                    className="mr-1.5 accent-primary-500"
                    onChange={() =>
                      setFormValues((current) => ({
                        ...current,
                        customerTags: toggleValue(current.customerTags, value),
                      }))
                    }
                    type="checkbox"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="grid gap-2">
            <legend className="text-label-1 font-semibold text-grayscale-800">관심 방 옵션</legend>
            <div className="flex flex-wrap gap-2">
              {mustHaveOptions.map((option) => (
                <label
                  className="cursor-pointer rounded-full border border-grayscale-300 px-3 py-2 text-label-1 text-grayscale-700"
                  key={option}
                >
                  <input
                    checked={formValues.mustHave.includes(option)}
                    className="mr-1.5 accent-primary-500"
                    onChange={() =>
                      setFormValues((current) => ({
                        ...current,
                        mustHave: toggleValue(current.mustHave, option),
                      }))
                    }
                    type="checkbox"
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>
          <button
            aria-busy={isOpening}
            className="mt-2 block w-full rounded-xl bg-system-kakao px-6 py-4 text-body-1 font-bold text-grayscale-900 transition-opacity hover:opacity-80 focus-visible:ring-3 focus-visible:ring-grayscale-900 focus-visible:ring-offset-3 focus-visible:outline-none disabled:cursor-wait disabled:opacity-80"
            disabled={isOpening}
            type="submit"
          >
            {isOpening ? "카카오톡 연결 중…" : "카카오톡 문의하기"}
          </button>
        </form>
        {chatError ? (
          <p className="mt-4 text-label-1 text-system-error" role="alert">
            {chatError}
          </p>
        ) : null}
      </section>
    </main>
  );
}
