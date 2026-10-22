import Image from "next/image";
import type { ReactNode } from "react";

import type { GuestConcernCode } from "@/features/shinhan-intake";

import { GUEST_CONCERNS } from "../config/content";

import styles from "./followup-presentation.module.css";

interface GuestFollowupNoticeProps {
  children: ReactNode;
}

interface GuestGuideCardProps {
  code: GuestConcernCode;
}

export function GuestGuideCard({ code }: GuestGuideCardProps) {
  const concern = GUEST_CONCERNS.find((item) => item.code === code);
  if (!concern) return null;

  return (
    <article className={styles.guideCard} aria-label={concern.category}>
      <p className={styles.guideCategory}>{concern.category}</p>
      <h2 className={styles.guideTitle}>{concern.guideTitle}</h2>
      <p className={styles.guideBody}>{concern.guideBody}</p>
    </article>
  );
}

export function GuestFollowupBrand() {
  return (
    <div className={styles.partnership}>
      <div className={styles.brand}>
        <span className={styles.solBrand}>
          <Image src="/images/shinhan/super-sol.png" width={40} height={40} alt="" />
          <span>신한 슈퍼SOL</span>
        </span>
        <span className={styles.brandSeparator} aria-hidden="true">
          ×
        </span>
        <Image
          src="/images/shinhan/home-together-brand.svg"
          width={199.286}
          height={36}
          alt="Home Together"
          className={styles.homeBrand}
        />
      </div>
      <div className={styles.partnershipCopy}>
        <p>신한 슈퍼SOL과 홈투게더가 함께합니다</p>
        <p>안내받은 링크에서 방과 집주인 정보를 확인하세요.</p>
      </div>
    </div>
  );
}

export function GuestFollowupNotice({ children }: GuestFollowupNoticeProps) {
  return (
    <div className={styles.noticeLayout}>
      <div className={styles.introduction}>
        <header className={styles.message}>
          <p className={styles.eyebrow}>입주 전, 충분히 살펴보세요</p>
          <h1 className={styles.heading}>
            <span>방과 집주인 정보를</span>
            <span>먼저 보고 결정하세요</span>
          </h1>
          <p className={styles.description}>
            <span>신청하신 방의 상세조건을 준비해 안내해드릴게요.</span>
            <span>선택하신 걱정도 함께 확인할 수 있도록</span>
            <span>안내에 반영할게요.</span>
          </p>
        </header>
        <aside className={styles.reassurance} aria-label="부담 없이 살펴보기">
          <Image
            src="/images/shinhan/guest/budget-character.png"
            width={112}
            height={112}
            alt=""
            className={styles.character}
          />
          <h2>결정은 충분히 살펴본 다음에</h2>
          <p className={styles.reassuranceBody}>
            <span>정보를 살펴본 뒤, 마음에 들면 집을 둘러보세요.</span>
            <span>지금 입주를 결정하지 않아도 괜찮아요.</span>
          </p>
        </aside>
      </div>
      <div className={styles.noticeAction}>
        <section className={styles.noticeCard} aria-labelledby="shinhan-followup-notice-heading">
          <h2 className={styles.cardHeading} id="shinhan-followup-notice-heading">
            이런 정보를 함께 안내해드려요
          </h2>
          <dl className={styles.informationList}>
            <div>
              <dt>방의 상세조건</dt>
              <dd>월세·관리비, 입주 가능 시기, 개인방과 공용 공간</dd>
            </div>
            <div>
              <dt>함께 지낼 집주인 소개</dt>
              <dd>어떤 분인지, 평소 생활 패턴은 어떤지</dd>
            </div>
            <div>
              <dt>함께 지킬 생활 규칙</dt>
              <dd>귀가 시간, 방문객, 공용 공간 이용과 청소 약속</dd>
            </div>
          </dl>
          <div className={styles.actionSlot}>{children}</div>
          <p className={styles.noticeCaption}>
            상세조건이 준비되면 신청하신 휴대폰 번호로 알려드려요.
          </p>
        </section>
        <GuestFollowupBrand />
      </div>
    </div>
  );
}

export function GuestReceiptIntroduction() {
  return (
    <div className={styles.introduction}>
      <header className={styles.message}>
        <p className={styles.eyebrow}>상세조건 안내 신청 내역</p>
        <h1 className={styles.heading}>
          <span>신청하신 방의</span>
          <span>정보를 준비하고 있어요</span>
        </h1>
        <p className={styles.description}>
          <span>방과 집주인 정보가 준비되면 알려드릴게요.</span>
          <span>안내받은 내용을 확인한 뒤 천천히 결정하세요.</span>
        </p>
      </header>
      <aside className={styles.receiptReassurance} aria-label="안내 대기">
        <Image
          src="/images/shinhan/guest/budget-character.png"
          width={136}
          height={136}
          alt=""
          className={styles.character}
        />
        <h2>안내가 도착하면 확인해주세요</h2>
        <p className={styles.noticeCaption}>상세조건과 집주인 소개를 보고 방문을 결정하세요.</p>
      </aside>
    </div>
  );
}
