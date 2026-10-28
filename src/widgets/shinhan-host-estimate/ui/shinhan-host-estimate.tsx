import Image from "next/image";
import type { ReactNode } from "react";

import { ShinhanHostEstimateFlow } from "./shinhan-host-estimate-flow";

import styles from "./shinhan-host-estimate.module.css";

interface HostEstimateProps {
  result: ReactNode;
  concerns: ReactNode;
  guide: ReactNode;
}

export function ShinhanHostEstimate({ result, concerns, guide }: HostEstimateProps) {
  return (
    <section className={styles.container} aria-label="빈방 예상 월세 진단">
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
        result={result}
        concerns={concerns}
        guide={guide}
      />
    </section>
  );
}
