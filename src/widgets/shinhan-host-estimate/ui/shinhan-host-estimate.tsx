import Image from "next/image";

import { ShinhanHostEstimateFlow } from "./shinhan-host-estimate-flow";

import styles from "./shinhan-host-estimate.module.css";

export function ShinhanHostEstimate() {
  return (
    <section className={styles.container} aria-label="빈방 예상 월세 진단">
      <ol className={styles.progress} aria-label="호스트 신청 순서">
        {["월세 알아보기", "걱정 확인", "소개서 안내", "알림 신청"].map((label, index) => (
          <li key={label} aria-current={index === 0 ? "step" : undefined}>
            <span>0{index + 1}</span> {label}
          </li>
        ))}
      </ol>
      <ShinhanHostEstimateFlow
        introduction={
          <div className={styles.introduction}>
            <p className={styles.eyebrow}>우리 집 빈방의 가능성</p>
            <h1>
              우리 집 빈방,
              <br />
              얼마 받을 수 있을까?
            </h1>
            <p>
              집 위치와 빈방에 제공할 가구를 알려주세요.
              <br />
              우리 집에서 받을 수 있는 월세를 알아볼게요.
            </p>
            <div className={styles.illustration} aria-hidden="true">
              <Image
                src="/images/shinhan/guest/budget-character.png"
                width={252}
                height={252}
                alt=""
                className={styles.character}
              />
              <span className={styles.locationChip}>
                <Image
                  src="/images/shinhan/host/estimate-location.svg"
                  width={20}
                  height={20}
                  alt=""
                />
                집 위치
              </span>
              <span className={styles.incomeChip}>₩&nbsp; 빈방 예상 월세</span>
            </div>
          </div>
        }
        incomePreview={
          <div className={styles.incomePreview}>
            <div>
              <p className={styles.incomeLabel}>1년 예상 수익</p>
              <p className={styles.maskedIncome} aria-label="접수 저장 후 공개">
                ???~???만원
              </p>
              <p className={styles.incomeDetail}>월 예상 수익도 함께 확인할 수 있어요</p>
              <p className={styles.hint}>
                예상 금액은 입력하신 방 정보를 바탕으로 산정해요.
                <br />
                실제 수익은 계약 기간과 방 상태에 따라 달라질 수 있어요.
              </p>
            </div>
            <Image
              src="/images/shinhan/host/room-income.png"
              width={280}
              height={280}
              alt="빈방과 월세 수익을 표현한 그림"
              className={styles.roomImage}
            />
          </div>
        }
      />
    </section>
  );
}
