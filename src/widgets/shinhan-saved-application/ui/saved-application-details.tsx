"use client";

import { useShinhanStorage } from "@/features/shinhan-intake";

import styles from "./saved-application-flow.module.css";

const applicationLabels = {
  HOST_REGISTRATION: "호스트 방 등록",
  HOST_ESTIMATE: "호스트 예상 수익 진단",
  GUEST_BUDGET: "게스트 예산 매칭",
  GUEST_DEMAND: "게스트 위치·예산 수요조사",
};
const furnitureStates = { OWNED: "보유 중", PLANNED: "구매 예정", NONE: "없음" };
const furnitureItems = [
  { key: "bed", label: "침대·매트리스" },
  { key: "desk", label: "책상" },
  { key: "chair", label: "의자" },
  { key: "wardrobe", label: "옷장·수납장" },
] as const;

export function formatShinhanMoney(value: number) {
  return (value / 10000).toLocaleString("ko-KR");
}

export function SavedApplicationSummary() {
  const { application } = useShinhanStorage();
  if (!application) return null;
  return (
    <section className={styles.summaryCard} aria-labelledby="saved-application-summary-heading">
      <p className={styles.badge}>저장된 신청 · 조회 전용</p>
      <h2 id="saved-application-summary-heading">신청한 내용</h2>
      <dl className={styles.details}>
        <div>
          <dt>신청 내용</dt>
          <dd>{applicationLabels[application.applicationType]}</dd>
        </div>
        <div>
          <dt>접수번호</dt>
          <dd>{application.applicationId}</dd>
        </div>
        <div>
          <dt>접수 시각</dt>
          <dd>
            <time dateTime={application.createdAt}>
              {new Intl.DateTimeFormat("ko-KR", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "Asia/Seoul",
              }).format(new Date(application.createdAt))}
            </time>
          </dd>
        </div>
        <div>
          <dt>휴대폰 번호</dt>
          <dd>{application.phone}</dd>
        </div>
        {application.applicationType === "HOST_REGISTRATION" && (
          <>
            <div>
              <dt>주거 형태</dt>
              <dd>{application.input.ownership === "OWNED" ? "자가" : "월세·전세"}</dd>
            </div>
            <div>
              <dt>방 위치</dt>
              <dd>{application.input.areaRaw}</dd>
            </div>
          </>
        )}
        {application.applicationType === "HOST_ESTIMATE" && (
          <>
            <div>
              <dt>주소</dt>
              <dd>{application.input.address.addressRaw}</dd>
            </div>
            <div>
              <dt>동·호수</dt>
              <dd>
                {[
                  application.input.buildingDong && `${application.input.buildingDong}동`,
                  application.input.unitHo && `${application.input.unitHo}호`,
                ]
                  .filter(Boolean)
                  .join(" ") || "미입력"}
              </dd>
            </div>
            {furnitureItems.map(({ key, label }) => (
              <div key={key}>
                <dt>{label}</dt>
                <dd>{furnitureStates[application.input.furniture[key]]}</dd>
              </div>
            ))}
            <div>
              <dt>화장실</dt>
              <dd>{application.input.bathroomCount}개</dd>
            </div>
          </>
        )}
        {(application.applicationType === "GUEST_BUDGET" ||
          application.applicationType === "GUEST_DEMAND") && (
          <>
            <div>
              <dt>희망 위치</dt>
              <dd>{application.input.desiredRegionRaw}</dd>
            </div>
            <div>
              <dt>월세 예산</dt>
              <dd>
                {application.applicationType === "GUEST_BUDGET"
                  ? `${formatShinhanMoney(application.input.budgetMonthlyKrw)}만 원`
                  : `${formatShinhanMoney(application.input.budgetMinKrw)}~${formatShinhanMoney(application.input.budgetMaxKrw)}만 원`}
              </dd>
            </div>
            <div>
              <dt>희망 입주일</dt>
              <dd>{application.input.moveInDate}</dd>
            </div>
          </>
        )}
        {application.applicationType === "GUEST_DEMAND" && (
          <>
            <div>
              <dt>계약기간</dt>
              <dd>
                {application.input.contractTermCode === "MONTHS_12_PLUS"
                  ? "12개월 이상"
                  : `${application.input.contractTermCode.replace("MONTH_", "")}개월`}
              </dd>
            </div>
            <div>
              <dt>성별</dt>
              <dd>{application.input.gender === "FEMALE" ? "여성" : "남성"}</dd>
            </div>
          </>
        )}
        <div>
          <dt>현재 상태</dt>
          <dd>
            {application.applicationType === "HOST_ESTIMATE"
              ? application.introductionRequestedAt
                ? "소개서 알림 신청 접수 완료"
                : "예상 수익 진단 저장 완료"
              : "신청 접수 완료 · 안내 대기"}
          </dd>
        </div>
        <div>
          <dt>필수 동의 버전</dt>
          <dd>{application.requiredConsent.version}</dd>
        </div>
      </dl>
      <p className={styles.help}>
        저장된 내용을 다시 보는 것으로 신청이나 알림이 추가되지 않습니다.
      </p>
    </section>
  );
}
