"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

import { ShinhanEntryNotice, ShinhanGuestFormButton } from "@/features/shinhan-intake";

import styles from "./guest-budget-prompt.module.css";

export function ShinhanGuestBudgetPrompt() {
  const [isPastEmpathyHeading, setIsPastEmpathyHeading] = useState(false);
  const [isInlineActionVisible, setIsInlineActionVisible] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const panelId = useId();
  const noticeId = useId();
  const characterRef = useRef<HTMLButtonElement>(null);

  function handlePanelClose() {
    setIsPanelOpen(false);
    characterRef.current?.focus();
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
        <div className={styles.panelHeader}>
          <p>내 예산에 맞는 방 찾기</p>
          <button
            type="button"
            className={styles.close}
            aria-label="예산 안내 접기"
            onClick={handlePanelClose}
          >
            <Image src="/images/shinhan/guest/budget-close.svg" alt="" width={18} height={18} />
          </button>
        </div>
        <ShinhanGuestFormButton
          flow="budget"
          type="button"
          className={styles.action}
          aria-describedby={noticeId}
        >
          내 조건에 맞는 방 찾기
        </ShinhanGuestFormButton>
        <p className={styles.notice} id={noticeId}>
          <ShinhanEntryNotice>예산을 입력하고 상세조건 안내를 신청해 보세요.</ShinhanEntryNotice>
        </p>
      </div>
      <button
        type="button"
        ref={characterRef}
        className={styles.character}
        aria-label={isPanelOpen ? "예산 안내 접기" : "예산 안내 펼치기"}
        aria-expanded={isPanelOpen}
        aria-controls={panelId}
        onClick={() => setIsPanelOpen(!isPanelOpen)}
      >
        <Image
          src="/images/shinhan/guest/budget-character.png"
          alt=""
          width={96}
          height={96}
          sizes="96px"
        />
      </button>
    </aside>
  );
}
