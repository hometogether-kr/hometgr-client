import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./completion-frames.module.css";

interface SavedHostRegistrationFrameProps {
  summary: ReactNode;
  actions: ReactNode;
}

interface SavedHostIntroductionFrameProps {
  actions: ReactNode;
}

interface SavedGuestCompletionFrameProps {
  applicationType: "GUEST_BUDGET" | "GUEST_DEMAND";
  summary: ReactNode;
  actions: ReactNode;
}

function CompletionBrand({ size }: { size: "default" | "small" }) {
  return (
    <div className={styles.brand} data-size={size}>
      <span className={styles.solBrand}>
        <Image
          src="/images/shinhan/super-sol.png"
          width={size === "small" ? 28 : 40}
          height={size === "small" ? 28 : 40}
          alt=""
        />
        <span>신한 슈퍼SOL</span>
      </span>
      <span className={styles.brandSeparator} aria-hidden="true">
        ×
      </span>
      {size === "small" ? (
        <Image
          src="/images/shinhan/home-together-footer.svg"
          width={155}
          height={28}
          alt="Home Together"
          className={styles.homeBrand}
        />
      ) : (
        <Image
          src="/images/shinhan/home-together-brand.svg"
          width={199.286}
          height={36}
          alt="Home Together"
          className={styles.homeBrand}
        />
      )}
    </div>
  );
}

export function SavedHostRegistrationFrame({ summary, actions }: SavedHostRegistrationFrameProps) {
  return (
    <div className={styles.registrationFrame}>
      <div className={styles.registrationColumns}>
        <div className={styles.registrationIntroduction}>
          <header className={styles.registrationHeading}>
            <p className={styles.eyebrow}>방 등록 심사 안내</p>
            <h1>
              <span>심사가 끝나면</span>
              <span>연락드릴게요</span>
            </h1>
            <p className={styles.registrationDescription}>
              <span>입력해 주신 정보를 검토한 뒤,</span>
              <span>남겨주신 전화번호로 심사 결과를 안내해 드릴게요.</span>
            </p>
          </header>
          <div className={styles.registrationIllustration}>
            <Image
              src="/images/shinhan/guest/budget-character.png"
              width={252}
              height={252}
              sizes="(max-width: 767px) 200px, 252px"
              alt=""
              className={styles.registrationCharacter}
            />
          </div>
        </div>
        <section className={styles.contactCard} aria-labelledby="saved-host-contact-heading">
          <CompletionBrand size="small" />
          <div className={styles.contactMessage}>
            <h2 id="saved-host-contact-heading">
              <span>궁금한 점은</span>
              <span>편하게 물어보세요</span>
            </h2>
            <p>
              <span>방 등록과 관련한 궁금한 사항은</span>
              <span>홈투게더 카카오톡 채널로 문의해 주세요.</span>
            </p>
          </div>
          <div className={styles.contactAction}>
            <Link
              href="https://pf.kakao.com/_BKlhX/chat"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.kakaoLink}
            >
              카카오톡 채널로 문의하기<span className="sr-only"> (새 창)</span>
            </Link>
            <p>심사 결과는 남겨주신 전화번호로 안내해 드려요.</p>
          </div>
          <div className={styles.registrationActions}>{actions}</div>
        </section>
      </div>
      {summary && <div className={styles.summarySlot}>{summary}</div>}
    </div>
  );
}

export function SavedHostIntroductionFrame({ actions }: SavedHostIntroductionFrameProps) {
  return (
    <section className={styles.introductionCard} aria-labelledby="saved-introduction-heading">
      <CompletionBrand size="default" />
      <h1 id="saved-introduction-heading">청년 소개서 알림을 신청했어요</h1>
      <p className={styles.introductionDescription}>
        <span>내 조건에 맞는 청년이 있으면 소개서를 보내드릴게요.</span>
        <span>그때 살펴보고, 만나볼지 직접 선택하시면 돼요.</span>
      </p>
      <div className={styles.introductionActions}>{actions}</div>
      <p className={styles.introductionCaption}>
        소개서를 받은 뒤, 함께할지는 집주인이 결정합니다.
      </p>
    </section>
  );
}

export function SavedGuestCompletionFrame({
  applicationType,
  summary,
  actions,
}: SavedGuestCompletionFrameProps) {
  const isBudget = applicationType === "GUEST_BUDGET";

  return (
    <div className={styles.guestFrame} data-application-type={applicationType}>
      <section className={styles.guestCompletion} aria-labelledby="saved-guest-completion-heading">
        <header className={styles.guestMessage}>
          <p className={styles.guestEyebrow}>
            {isBudget ? "✓ 신청 완료" : "요청이 접수되었습니다"}
          </p>
          <h1 id="saved-guest-completion-heading">
            {isBudget ? (
              <>
                <span>상세조건 안내 신청이</span>
                <span className={styles.completionAccent}>완료됐어요</span>
              </>
            ) : (
              <>
                <span>입력하신 조건을 확인한 뒤</span>
                <span>연락드리겠습니다.</span>
              </>
            )}
          </h1>
          <p className={styles.guestDescription}>
            {isBudget
              ? "남겨주신 휴대폰 번호로 상세조건을 안내해 드릴게요."
              : "남겨주신 전화번호로 입주 가능 여부와 조건을 안내해 드릴게요."}
          </p>
        </header>
        <div className={styles.guestCharacterSlot}>
          <Image
            src="/images/shinhan/guest/budget-character.png"
            width={180}
            height={180}
            alt=""
            className={styles.guestCharacter}
          />
        </div>
      </section>
      {summary && <div className={styles.summarySlot}>{summary}</div>}
      <div className={styles.guestActions}>{actions}</div>
    </div>
  );
}
