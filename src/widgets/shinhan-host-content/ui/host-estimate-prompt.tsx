"use client";

import { useEffect, useId, useState } from "react";

import { ShinhanHostFormButton } from "@/features/shinhan-intake";

import styles from "./host-estimate-prompt.module.css";

export function ShinhanHostEstimatePrompt() {
  const [isInlineEstimateVisible, setIsInlineEstimateVisible] = useState(false);
  const descriptionId = useId();

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
      <p className={styles.title}>빈방 예상 월세 알아보기</p>
      <ShinhanHostFormButton
        flow="estimate"
        aria-describedby={descriptionId}
        className={styles.action}
      >
        예상 월세 진단하기
      </ShinhanHostFormButton>
      <p id={descriptionId} className={styles.notice}>
        {process.env.NODE_ENV === "development"
          ? "개발 확인용 · 접수되지 않습니다."
          : "신청 기능을 준비하고 있어요."}
      </p>
    </aside>
  );
}
