"use client";

import Link from "next/link";
import { useCallback } from "react";

import { BtnCta } from "@/shared/ui/btn-cta";

import { useShinhanIntake } from "../model/intake-context";
import { calculateShinhanRentPreview } from "../model/rent-preview";
import { ShinhanHostIntroductionDialog } from "./host-introduction-dialog";

import styles from "./host-journey.module.css";

function useHostStep() {
  const { draft, updateDraft } = useShinhanIntake();
  const navigate = useCallback(
    (step: "conditions" | "result" | "concerns" | "introduction" | "contact") => {
      updateDraft((current) => ({ ...current, step }));
      if (step !== "contact") window.scrollTo({ top: 0, behavior: "instant" });
    },
    [updateDraft],
  );
  return { draft, updateDraft, navigate };
}

export function ShinhanHostPreviewIncome() {
  const { draft } = useShinhanIntake();
  if (draft?.applicationType !== "HOST_ESTIMATE") return null;
  const estimate = calculateShinhanRentPreview(draft.values);
  const money = (value: number) => (value / 10000).toLocaleString("ko-KR");
  return (
    <div className={styles.income}>
      <p>1년 예상 수익</p>
      <strong>
        {money(estimate.annual.min)}~{money(estimate.annual.max)}
        <span>만원</span>
      </strong>
      <div>
        월 예상 수익{" "}
        <b>
          {money(estimate.monthly.min)}~{money(estimate.monthly.max)}만 원
        </b>
      </div>
    </div>
  );
}

export function ShinhanHostPreviewActions() {
  const { navigate } = useHostStep();
  return (
    <div className={styles.resultActions}>
      <p>수익만큼 중요한 건, 안심하고 시작하는 방법이에요.</p>
      <BtnCta onClick={() => navigate("concerns")}>내 집에 맞는 시작 방법 알아보기 →</BtnCta>
      <button type="button" onClick={() => navigate("conditions")}>
        ← 입력 정보 수정
      </button>
    </div>
  );
}

const concerns = [
  {
    code: "YOUNG_PERSON",
    title: "어떤 청년이 올지 걱정돼요",
    description: "어떤 사람인지 먼저 알고 싶어요",
  },
  {
    code: "LIFESTYLE",
    title: "생활 습관이 다를까 봐 걱정돼요",
    description: "수면 시간, 청소 습관이 중요해요",
  },
  {
    code: "PRIVACY",
    title: "내 공간과 사생활이 중요해요",
    description: "서로의 생활을 존중하며 지내고 싶어요",
  },
  {
    code: "RENT_MANAGEMENT",
    title: "월세와 집 관리가 걱정돼요",
    description: "비용과 집 사용 규칙을 정하고 싶어요",
  },
  {
    code: "PROCESS",
    title: "처음이라 절차가 막막해요",
    description: "준비할 것부터 차근차근 알고 싶어요",
  },
  {
    code: "UNSURE",
    title: "아직 잘 모르겠어요",
    description: "소개를 보면서 천천히 생각해 볼게요",
  },
];
export function ShinhanHostConcerns() {
  const { draft, updateDraft, navigate } = useHostStep();
  if (draft?.applicationType !== "HOST_ESTIMATE") return null;
  return (
    <section className={styles.concerns}>
      <header>
        <h1>홈셰어링, 어떤 점이 걱정되세요?</h1>
        <p>마음에 걸리는 점을 골라주세요. 여러 개 선택할 수 있어요.</p>
      </header>
      <div className={styles.choices}>
        {concerns.map((item) => (
          <label key={item.code} className={styles.choice}>
            <input
              type="checkbox"
              checked={draft.concernCodes.includes(item.code)}
              onChange={(event) => {
                const checked = event.target.checked;
                updateDraft((current) => ({
                  ...current,
                  concernCodes: checked
                    ? [...current.concernCodes, item.code]
                    : current.concernCodes.filter((code) => code !== item.code),
                }));
              }}
            />
            <span>
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </span>
          </label>
        ))}
      </div>
      <p className={styles.concernCaption}>
        선택한 걱정을 바탕으로, 우리 집에 맞는 시작 방법을 함께 살펴볼게요.
      </p>
      <div className={styles.concernActions}>
        <BtnCta variant="stroke" onClick={() => navigate("result")}>
          ← 예상 수익 다시 보기
        </BtnCta>
        <BtnCta onClick={() => navigate("introduction")}>선택한 걱정으로 시작 방법 보기 →</BtnCta>
      </div>
    </section>
  );
}
export function ShinhanHostGuideActions() {
  const { draft, navigate } = useHostStep();
  const closeDialog = useCallback(() => navigate("introduction"), [navigate]);
  return (
    <div className={styles.guideActions}>
      <p>
        <span aria-hidden="true">✓</span> 소개서만 받아보고, 더 진행하지 않으셔도 괜찮아요.
      </p>
      <div className={styles.guideActionRow}>
        <BtnCta onClick={() => navigate("contact")}>소개서만 먼저 받아보기 →</BtnCta>
        <Link href="/shinhan/host/register">방 등록하기</Link>
      </div>
      <Link className={styles.home} href="/shinhan/host">
        홈 화면으로 돌아가기
      </Link>
      {draft?.step === "contact" && <ShinhanHostIntroductionDialog onClose={closeDialog} />}
    </div>
  );
}
