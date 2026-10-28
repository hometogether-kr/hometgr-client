"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import styles from "./analysis-progress.module.css";

interface AnalysisProgressProps {
  mode: "host" | "guest";
  onComplete: () => void;
}

export function ShinhanAnalysisProgress({ mode, onComplete }: AnalysisProgressProps) {
  const [progress, setProgress] = useState(0);
  const completeRef = useRef(onComplete);
  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);
  useEffect(() => {
    const started = performance.now();
    let finished = false;
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - started;
      const next = Math.min(100, (elapsed / 4800) * 100);
      setProgress(next);
      if (elapsed >= 5000 && !finished) {
        finished = true;
        window.clearInterval(timer);
        completeRef.current();
      }
    }, 50);
    return () => window.clearInterval(timer);
  }, []);
  const isHost = mode === "host";
  const items = isHost
    ? [
        "주소와 건물 정보 확인",
        "호수별 평면도·면적 확인 가능 여부",
        "보유·구매 예정 가구 조건 반영",
      ]
    : [
        "월세 예산과 희망 지역 확인",
        "입주 시기에 맞는 아파트 살펴보기",
        "추천할 아파트 개인방 정리",
      ];
  const completed = Math.floor(progress / (100 / 3));
  return (
    <section
      className={styles.panel}
      data-mode={mode}
      aria-label={isHost ? "예상 월세 분석" : "아파트 확인"}
      aria-busy="true"
    >
      <div className={styles.character}>
        <Image src="/images/shinhan/guest/budget-character.png" alt="" width={264} height={264} />
      </div>
      <div className={styles.content}>
        <h1>
          {isHost ? (
            <>
              우리 집 빈방의
              <br />
              예상 월세를 살펴보고 있어요
            </>
          ) : (
            <>
              내 예산에 맞는 아파트를
              <br />
              찾고 있어요
            </>
          )}
        </h1>
        <p>
          {isHost
            ? "입력하신 집 위치·동호수·가구 정보를 확인하고 있어요."
            : "월세 예산과 희망 지역, 입주 시기를 확인하고 있어요."}
        </p>
        <div
          className={styles.track}
          role="progressbar"
          aria-label="분석 진행률"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <ol className={styles.items} aria-live="polite">
          {items.map((item, index) => (
            <li key={item} data-active={index === completed} data-complete={index < completed}>
              <span
                className={styles.status}
                aria-label={index < completed ? "완료" : index === completed ? "진행 중" : "대기"}
              >
                {index < completed ? "✓" : index === completed ? "···" : "○"}
              </span>
              {item}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
