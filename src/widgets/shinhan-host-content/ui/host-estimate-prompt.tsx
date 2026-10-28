"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { ShinhanHostFormButton } from "@/features/shinhan-intake";

import styles from "./host-estimate-prompt.module.css";

export function ShinhanHostEstimatePrompt() {
  const [isInlineEstimateVisible, setIsInlineEstimateVisible] = useState(false);

  useEffect(() => {
    const inlineActions = document.querySelectorAll("[data-shinhan-estimate-cta]");
    if (inlineActions.length === 0) return;

    const visibleActions = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleActions.add(entry.target);
        } else {
          visibleActions.delete(entry.target);
        }
      });
      setIsInlineEstimateVisible(visibleActions.size > 0);
    });

    inlineActions.forEach((action) => observer.observe(action));
    return () => observer.disconnect();
  }, []);

  return (
    <aside
      aria-label="빈방 예상 월세 진단"
      className={styles.prompt}
      hidden={isInlineEstimateVisible}
    >
      <ShinhanHostFormButton
        flow="estimate"
        className={styles.action}
        aria-label="우리 집 빈방 예상 월세 알아보기"
      >
        <span className={styles.compact}>빈방 예상 월세 알아보기</span>
        <span className={styles.card} aria-hidden="true">
          <span className={styles.title}>
            예상 수입 계산기
            <Image src="/images/shinhan/host/calculator-close.svg" alt="" width={18} height={18} />
          </span>
          <span className={styles.group}>
            <span>근처 대학교나 지하철역을 검색해 주세요</span>
            <span className={styles.search}>
              대학교나 지하철역을 검색하세요
              <Image
                src="/images/shinhan/host/calculator-search.svg"
                alt=""
                width={22}
                height={22}
              />
            </span>
          </span>
          <span className={styles.group}>
            <span>방 유형을 선택해 주세요.</span>
            <span className={styles.rooms}>
              {[
                { name: "원룸", icon: "room" },
                { name: "투룸 +", icon: "two-rooms" },
                { name: "단독 주택", icon: "house" },
                { name: "아파트", icon: "apartment" },
              ].map(({ name, icon }) => (
                <span key={icon} className={styles.room}>
                  <Image
                    src={`/images/shinhan/host/calculator-${icon}.svg`}
                    alt=""
                    width={16}
                    height={16}
                  />
                  <span>{name}</span>
                  <Image
                    src="/images/shinhan/host/calculator-unchecked.svg"
                    alt=""
                    width={18}
                    height={18}
                  />
                </span>
              ))}
            </span>
          </span>
          <span className={styles.income}>
            <span>예상 수입</span>
            <strong>????원</strong>
          </span>
          <span className={styles.notice}>
            *실제 해당 지역에서 조회되는 홈투게더의 평균가입니다
          </span>
        </span>
      </ShinhanHostFormButton>
    </aside>
  );
}
