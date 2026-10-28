import Image from "next/image";

import { ShinhanGuestIntakeFlow } from "./shinhan-guest-intake-flow";

import styles from "./guest-intake-presentation.module.css";

interface ShinhanGuestIntakeProps {
  applicationType: "GUEST_BUDGET" | "GUEST_DEMAND";
}

const introductions = {
  GUEST_BUDGET: {
    label: "원룸 예산으로, 아파트 생활",
    heading: ["내 예산으로,", "어떤 아파트에서", "살 수 있을까요?"],
    description: [
      "월세 예산과 희망 지역만 알려주세요.",
      "내 조건에 맞는 아파트 개인방을 찾아드릴게요.",
    ],
    caption: "나만의 개인방, 함께 누리는 아파트 생활",
  },
  GUEST_DEMAND: {
    label: "홈투게더 | 방 둘러보기",
    heading: ["어디에서,", "얼마에 살고", "싶으세요?"],
    description: [
      "지역·월세·입주시점·계약기간·성별을 알려주세요.",
      "내 조건에 맞는 홈투게더 방을 안내드릴게요.",
    ],
    caption: "집주인과 함께 거주하는 홈투게더의 개인방",
  },
};

function GuestIntroduction({ applicationType }: ShinhanGuestIntakeProps) {
  const introduction = introductions[applicationType];

  return (
    <header className={styles.introduction}>
      <p className={styles.eyebrow}>{introduction.label}</p>
      <h1 className={styles.heading}>
        {introduction.heading.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </h1>
      <p className={styles.description}>
        {introduction.description.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </p>
      <div className={styles.illustration}>
        <Image
          src="/images/shinhan/guest/budget-banner.png"
          alt="홈투게더 집 캐릭터가 아파트 모형을 소개하는 모습"
          width={1983}
          height={793}
          sizes="(max-width: 520px) 151vw, 725px"
          className={styles.bannerImage}
          loading="eager"
        />
      </div>
      <p className={styles.caption}>{introduction.caption}</p>
    </header>
  );
}

export function ShinhanGuestSpaceExamples() {
  return (
    <div className={styles.collage}>
      <Image
        src="/images/shinhan/guest/preview-collage.png"
        alt="개인방과 거실, 주방의 공간 예시 사진"
        width={2240}
        height={780}
        sizes="(max-width:1159px) calc(100vw - 40px),1120px"
      />
    </div>
  );
}

export function ShinhanGuestIntake({ applicationType }: ShinhanGuestIntakeProps) {
  return (
    <section
      className={styles.container}
      aria-label={
        applicationType === "GUEST_BUDGET" ? "게스트 예산 매칭" : "게스트 위치·예산 수요조사"
      }
    >
      <ShinhanGuestIntakeFlow
        applicationType={applicationType}
        introduction={<GuestIntroduction applicationType={applicationType} />}
        examples={<ShinhanGuestSpaceExamples />}
      />
    </section>
  );
}
