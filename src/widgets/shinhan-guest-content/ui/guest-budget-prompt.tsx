"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

import { ShinhanGuestFormButton } from "@/features/shinhan-intake";

import styles from "./guest-budget-prompt.module.css";

export function ShinhanGuestBudgetPrompt() {
  const [isPastEmpathyHeading, setIsPastEmpathyHeading] = useState(false);
  const [isInlineActionVisible, setIsInlineActionVisible] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const panelId = useId();
  const characterRef = useRef<HTMLDivElement>(null);

  function handlePanelClose() {
    setIsPanelOpen(false);
    characterRef.current?.querySelector("button")?.focus();
  }

  useEffect(() => {
    const heading = document.getElementById("shinhan-guest-empathy-heading");
    if (!heading) return;
    let animationFrame = 0;
    const updateHeadingPosition = () => {
      setIsPastEmpathyHeading(heading.getBoundingClientRect().top < window.innerHeight);
      animationFrame = 0;
    };
    const scheduleHeadingUpdate = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(updateHeadingPosition);
    };
    // A jump to the top can skip the heading without crossing an observer threshold.
    window.addEventListener("scroll", scheduleHeadingUpdate, { passive: true });
    window.addEventListener("resize", scheduleHeadingUpdate);
    scheduleHeadingUpdate();

    const visibleActions = new Set<Element>();
    const actionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visibleActions.add(entry.target);
        else visibleActions.delete(entry.target);
      }
      setIsInlineActionVisible(visibleActions.size > 0);
    });
    document
      .querySelectorAll("[data-shinhan-guest-budget-cta]")
      .forEach((action) => actionObserver.observe(action));
    return () => {
      window.removeEventListener("scroll", scheduleHeadingUpdate);
      window.removeEventListener("resize", scheduleHeadingUpdate);
      cancelAnimationFrame(animationFrame);
      actionObserver.disconnect();
    };
  }, []);

  return (
    <aside
      className={styles.prompt}
      aria-label="내 예산에 맞는 방 찾기"
      hidden={!isPastEmpathyHeading || isInlineActionVisible}
      data-collapsed={!isPanelOpen}
    >
      <div className={styles.panel} id={panelId}>
        <ShinhanGuestFormButton
          type="button"
          className={styles.entry}
          aria-label="내 예산에 맞는 방 찾기 페이지로 이동"
        >
          <span className={styles.panelContent} aria-hidden="true">
            <span className={styles.panelHeader}>내 예산에 맞는 방 찾기</span>
            <span className={styles.budget}>
              <span className={styles.budgetLabel}>한 달 월세 예산</span>
              <span className={styles.amount}>
                <strong>45</strong>만 원
              </span>
              <span className={styles.slider} />
              <span className={styles.bound}>20만 원</span>
              <span className={styles.bound}>100만 원 이상</span>
            </span>
            <span className={styles.region}>
              <span>어느 지역에서 살고 싶으세요?</span>
              <span className={styles.search}>
                희망하는 시·구·동 검색
                <Image
                  src="/images/shinhan/host/calculator-search.svg"
                  alt=""
                  width={22}
                  height={22}
                />
              </span>
            </span>
            <span className={styles.timing}>
              <span>언제쯤 입주하고 싶으세요?</span>
              <span className={styles.timingOptions}>
                {["빠른 입주", "1개월 내", "직접 입력"].map((label, index) => (
                  <span key={label} className={styles.timingOption} data-selected={index === 0}>
                    <span className={styles.radio}>{index === 0 ? "✓" : ""}</span>
                    {label}
                  </span>
                ))}
              </span>
            </span>
            <span className={styles.action}>내 조건에 맞는 방 찾기</span>
          </span>
        </ShinhanGuestFormButton>
        <button
          type="button"
          className={styles.close}
          aria-label="예산 안내 접기"
          aria-controls={panelId}
          onClick={handlePanelClose}
        >
          <Image src="/images/shinhan/guest/budget-close.svg" alt="" width={18} height={18} />
        </button>
      </div>
      <div className={styles.character} ref={characterRef}>
        <ShinhanGuestFormButton
          type="button"
          className={styles.characterEntry}
          aria-label="캐릭터로 예산에 맞는 방 찾기 페이지로 이동"
        >
          <Image
            src="/images/shinhan/guest/budget-character.png"
            alt=""
            width={96}
            height={96}
            sizes="(max-width:767px) 60px,96px"
          />
        </ShinhanGuestFormButton>
      </div>
    </aside>
  );
}
