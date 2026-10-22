import type { GuestFollowupExample } from "@/features/shinhan-intake";

import { GUEST_CONCERNS } from "../config/content";

import styles from "./shinhan-guest-followup-flow.module.css";

function formatBudget(value: number | null) {
  return value === null ? "미입력" : `${value / 10000}만 원`;
}

function formatContract(value: string) {
  return value === "MONTHS_12_PLUS" ? "12개월 이상" : `${value.replace("MONTH_", "")}개월`;
}

export function GuestReceiptDetails({ example }: { example: GuestFollowupExample }) {
  const { application, response } = example;
  const concernSummary =
    response.state === "NOT_SUBMITTED"
      ? "아직 응답하지 않음"
      : response.codes.length === 0
        ? "선택한 걱정 없음 (동의 후 확인)"
        : response.codes
            .map((code) => GUEST_CONCERNS.find((item) => item.code === code)?.title)
            .join(" · ");

  return (
    <>
      <p className={styles.badge}>개발 예시 · 실제 접수 전</p>
      <h2 className={styles.cardTitle}>신청한 내용</h2>
      <dl className={styles.summary} aria-label="신청 상태 예시">
        <div>
          <dt>신청 내용</dt>
          <dd>방 상세조건·집주인 소개 안내</dd>
        </div>
        <div>
          <dt>신청 경로</dt>
          <dd>
            {application.applicationType === "GUEST_BUDGET"
              ? "게스트 예산 매칭"
              : "게스트 위치·예산 수요조사"}
          </dd>
        </div>
        <div>
          <dt>현재 상태</dt>
          <dd>입력 내용 미리보기 · 저장되지 않음</dd>
        </div>
        <div>
          <dt>전달 방법</dt>
          <dd>휴대폰 안내 예정 (현재 발송되지 않음)</dd>
        </div>
      </dl>
      <dl className={styles.details} aria-label="입력한 신청 조건">
        <div>
          <dt>희망 위치</dt>
          <dd>{application.values.desiredRegionRaw}</dd>
        </div>
        <div>
          <dt>월세 예산</dt>
          <dd>
            {application.applicationType === "GUEST_BUDGET"
              ? formatBudget(application.values.budgetMonthlyKrw)
              : `${formatBudget(application.values.budgetMinKrw)} ~ ${formatBudget(application.values.budgetMaxKrw)}`}
          </dd>
        </div>
        <div>
          <dt>희망 입주일</dt>
          <dd>{application.values.moveInDate}</dd>
        </div>
        {application.applicationType === "GUEST_DEMAND" && (
          <>
            <div>
              <dt>계약기간</dt>
              <dd>{formatContract(application.values.contractTermCode)}</dd>
            </div>
            <div>
              <dt>성별</dt>
              <dd>{application.values.gender === "FEMALE" ? "여성" : "남성"}</dd>
            </div>
          </>
        )}
        <div>
          <dt>휴대폰 번호</dt>
          <dd>{application.phone}</dd>
        </div>
        <div>
          <dt>확인한 걱정 (예시)</dt>
          <dd>{concernSummary}</dd>
        </div>
      </dl>
      <p className={styles.help}>
        이 내역과 공간 사진은 조회 전용입니다. 실제 접수번호와 접수 시각은 저장 API 연결 후
        표시됩니다.
      </p>
    </>
  );
}
