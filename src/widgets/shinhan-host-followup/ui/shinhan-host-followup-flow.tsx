"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useEffect, useId, useRef } from "react";

import {
  confirmHostConcerns,
  type HostConcernCode,
  SHINHAN_HOST_ESTIMATE_PATH,
  ShinhanHostProgress,
  ShinhanPrivacyLink,
  useShinhanIntake,
} from "@/features/shinhan-intake";
import { BtnCta } from "@/shared/ui/btn-cta";

import { HOST_CONCERNS } from "../config/content";

import styles from "./shinhan-host-followup-flow.module.css";

const furnitureItems = [
  { key: "bed", label: "침대·매트리스" },
  { key: "desk", label: "책상" },
  { key: "chair", label: "의자" },
  { key: "wardrobe", label: "옷장·수납장" },
] as const;
const furnitureStates = { OWNED: "보유 중", PLANNED: "구매 예정", NONE: "없음" };

function formatMoney(value: number) {
  return (value / 10000).toLocaleString("ko-KR");
}

export function HostExampleIncome() {
  const { hostFollowup: example } = useShinhanIntake();
  if (!example) return null;
  const { estimate, estimateInput } = example;
  return (
    <div className={styles.income}>
      <p className={styles.exampleBadge}>고정 예시 · 실제 계산 전</p>
      <div className={styles.amounts} aria-label="계약 예시 수익 범위">
        <div className={styles.annual}>
          <p>1년 예상 수익 (예시)</p>
          <strong>
            {formatMoney(estimate.annualWon.min)}~{formatMoney(estimate.annualWon.max)}
            <span>만 원</span>
          </strong>
        </div>
        <div className={styles.monthly}>
          <p>예상 월세 기준 (예시)</p>
          <strong>
            {formatMoney(estimate.monthlyWon.min)}~{formatMoney(estimate.monthlyWon.max)}만 원
          </strong>
        </div>
      </div>
      <div className={styles.fixtureNote}>
        <p>
          <strong>예시 조건</strong> · {estimateInput.address?.sigungu} · 침대·옷장 보유 · 책상 구매
          예정 · 의자 없음 · 화장실 {estimateInput.bathroomCount}개
        </p>
        <p>입력하신 조건과 별개의 계약 예시입니다.</p>
        <p>계산 규칙: {estimate.rulesVersion}</p>
      </div>
    </div>
  );
}

export function HostResultActions() {
  const { hostFollowup: example, updateHostFollowup, updateDraft } = useShinhanIntake();
  const router = useRouter();
  if (!example) return null;
  const { values } = example.application;
  function handleEdit() {
    updateDraft((current) => ({ ...current, step: "conditions" }));
    router.push(SHINHAN_HOST_ESTIMATE_PATH);
  }
  return (
    <>
      <div className={styles.resultActions}>
        <p className={styles.actionHeading}>수익만큼 중요한 건, 안심하고 시작하는 방법이에요.</p>
        <BtnCta
          className={styles.primaryButton}
          onClick={() => updateHostFollowup((current) => ({ ...current, step: "concerns" }))}
        >
          내 집에 맞는 시작 방법 알아보기
        </BtnCta>
        <p className={styles.explanation}>걱정되는 점부터 살펴보고, 결정은 천천히 하세요.</p>
        <button className={styles.textButton} type="button" onClick={handleEdit}>
          ← 입력 정보 수정
        </button>
      </div>
      <details className={styles.inputSummary}>
        <summary>입력한 조건 확인 (아직 계산에 반영되지 않음)</summary>
        <dl>
          <div>
            <dt>주소</dt>
            <dd>{values.address?.addressRaw}</dd>
          </div>
          <div>
            <dt>동·호수</dt>
            <dd>
              {[
                values.buildingDong && `${values.buildingDong}동`,
                values.unitHo && `${values.unitHo}호`,
              ]
                .filter(Boolean)
                .join(" ") || "미입력"}
            </dd>
          </div>
          {furnitureItems.map(({ key, label }) => {
            const value = values.furniture[key];
            return (
              <div key={key}>
                <dt>{label}</dt>
                <dd>{value ? furnitureStates[value] : "미입력"}</dd>
              </div>
            );
          })}
          <div>
            <dt>화장실</dt>
            <dd>{values.bathroomCount}개</dd>
          </div>
          <div>
            <dt>휴대폰 번호</dt>
            <dd>{example.application.phone}</dd>
          </div>
        </dl>
      </details>
    </>
  );
}

export function HostIntroductionActions() {
  const { hostFollowup: example, updateHostFollowup } = useShinhanIntake();
  const id = useId();
  if (!example) return null;
  const response = example.response;
  const summary =
    response.state === "NOT_SUBMITTED"
      ? "아직 응답하지 않음"
      : response.codes.length === 0
        ? "선택한 걱정 없음"
        : response.codes
            .map((code) => HOST_CONCERNS.find((item) => item.code === code)?.title)
            .join(" · ");
  return (
    <div className={styles.introductionActions}>
      <p className={styles.responseSummary}>개발 예시에서 확인한 걱정: {summary}</p>
      <div className={styles.actionRow}>
        <BtnCta
          variant="stroke"
          className={styles.secondaryButton}
          onClick={() => updateHostFollowup((current) => ({ ...current, step: "concerns" }))}
        >
          걱정 선택 다시 보기
        </BtnCta>
        <BtnCta disabled className={styles.primaryButton} aria-describedby={`${id}-status`}>
          소개서만 먼저 받아보기
        </BtnCta>
      </div>
      <p id={`${id}-status`} className={styles.help}>
        소개서 신청은 저장 연결 후 가능해요. 현재는 신청·발송되지 않으며 접수 완료로 처리하지
        않습니다.
      </p>
    </div>
  );
}

interface HostFollowupFlowProps {
  result: ReactNode;
  introduction: ReactNode;
}

export function ShinhanHostFollowupFlow({ result, introduction }: HostFollowupFlowProps) {
  const { hostFollowup: example, updateHostFollowup } = useShinhanIntake();
  const focusTarget = useRef<HTMLDivElement>(null);
  const step = example?.step;
  useEffect(() => {
    if (!step) return;
    focusTarget.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [step]);
  if (!example)
    return (
      <section className={styles.empty}>
        <h1>작성 중인 호스트 견적이 필요해요</h1>
        <p>
          주택 조건과 연락처를 입력한 뒤 개발용 미리보기로 들어와 주세요. 새로고침하면 이 탭의
          미리보기는 초기화됩니다.
        </p>
        <Link href={SHINHAN_HOST_ESTIMATE_PATH}>호스트 견적 입력으로 돌아가기</Link>
      </section>
    );
  function toggleConcern(code: HostConcernCode) {
    updateHostFollowup((current) => ({
      ...current,
      selectedCodes: current.selectedCodes.includes(code)
        ? current.selectedCodes.filter((selected) => selected !== code)
        : [...current.selectedCodes, code],
    }));
  }
  function handleConcernSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateHostFollowup((current) => confirmHostConcerns(current) ?? current);
  }
  return (
    <div
      ref={focusTarget}
      tabIndex={-1}
      className={styles.container}
      aria-label="호스트 수익·후속 안내 미리보기"
    >
      <ShinhanHostProgress currentStep={example.step} />
      {example.step === "result" && result}
      {example.step === "concerns" && (
        <form noValidate onSubmit={handleConcernSubmit}>
          <header className={styles.heading}>
            <h1>홈셰어링, 어떤 점이 걱정되세요?</h1>
            <p>마음에 걸리는 점을 골라주세요. 여러 개 선택할 수 있어요.</p>
          </header>
          <fieldset className={styles.concerns}>
            <legend className="sr-only">호스트 걱정 (여러 개 선택 가능)</legend>
            {HOST_CONCERNS.map((concern) => (
              <button
                key={concern.code}
                type="button"
                className={styles.concern}
                aria-pressed={example.selectedCodes.includes(concern.code)}
                onClick={() => toggleConcern(concern.code)}
              >
                <span className={styles.checkMark} aria-hidden="true">
                  {example.selectedCodes.includes(concern.code) ? "✓" : ""}
                </span>
                <span>
                  <strong>{concern.title}</strong>
                  <span className={styles.concernDescription}>{concern.description}</span>
                </span>
              </button>
            ))}
          </fieldset>
          <div className={styles.actionRow}>
            <BtnCta
              variant="stroke"
              className={styles.secondaryButton}
              onClick={() => updateHostFollowup((current) => ({ ...current, step: "result" }))}
            >
              예상 수익 다시 보기
            </BtnCta>
            <BtnCta type="submit" className={styles.primaryButton}>
              선택한 걱정으로 시작 방법 보기
            </BtnCta>
          </div>
          <div className={styles.previewAction}>
            <button
              className={styles.textButton}
              type="button"
              onClick={() =>
                updateHostFollowup((current) => ({ ...current, step: "introduction" }))
              }
            >
              소개서 안내만 미리보기 (개발용)
            </button>
            <p className={styles.help}>안내 화면으로만 이동하며 걱정 응답을 바꾸지 않습니다.</p>
          </div>
        </form>
      )}
      {example.step === "introduction" && introduction}
      <div className={styles.privacy}>
        <ShinhanPrivacyLink>기본 신청 개인정보 전문 보기</ShinhanPrivacyLink>
      </div>
    </div>
  );
}
