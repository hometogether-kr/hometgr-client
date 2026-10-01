"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { FEATURED_FAQ_IDS, GUEST_FAQ, GUEST_FAQ_CATEGORIES } from "../model/faq-content";

import styles from "./guest-home.module.css";

interface GuestQuestionsProps {
  scope?: "featured" | "all";
}

export function GuestQuestions({ scope = "featured" }: GuestQuestionsProps) {
  const [category, setCategory] = useState<string>("전체");
  const [expandedId, setExpandedId] = useState<number | null>(1);
  const questions = GUEST_FAQ.filter((item) =>
    category === "전체"
      ? scope === "all" || FEATURED_FAQ_IDS.includes(item.id)
      : item.category === category,
  );
  return (
    <section
      className={`${styles.section} ${styles.muted}`}
      id="guest-faq"
      aria-labelledby="guest-faq-title"
    >
      <div
        className={`${styles.container} ${styles.faqContent} ${scope === "all" ? styles.fullFaq : ""}`}
      >
        <h2 id="guest-faq-title" className={styles.heading}>
          {scope === "all" ? "홈투게더 게스트 버전 FAQ" : "자주 묻는 질문"}
        </h2>
        <p className={styles.faqDescription}>
          방 선택부터 입주 준비, 공동생활, 월세와 보증금, 전입신고와 퇴실까지 안내합니다.
        </p>
        <div className={styles.categories} aria-label="FAQ 카테고리">
          {GUEST_FAQ_CATEGORIES.map((item) => (
            <button
              type="button"
              key={item}
              aria-pressed={category === item}
              onClick={() => {
                setCategory(item);
                setExpandedId(item === "전체" ? 1 : null);
              }}
            >
              {item}
            </button>
          ))}
        </div>
        <div className={styles.faqList}>
          {questions.map((item) => (
            <article key={item.id}>
              <h3>
                <button
                  className={styles.question}
                  type="button"
                  id={`guest-question-${item.id}`}
                  aria-expanded={expandedId === item.id}
                  aria-controls={`guest-answer-${item.id}`}
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                >
                  <span aria-hidden="true">Q</span>
                  <span>{item.question}</span>
                  <Image
                    src={`/images/guest-landing/imgProperty1${expandedId === item.id ? "Up" : "Down"}ThickOffSize20.svg`}
                    width={20}
                    height={20}
                    alt=""
                  />
                </button>
              </h3>
              <div
                className={styles.answer}
                id={`guest-answer-${item.id}`}
                aria-labelledby={`guest-question-${item.id}`}
                hidden={expandedId !== item.id}
              >
                <p>{item.summary}</p>
                <p>{item.detail}</p>
              </div>
            </article>
          ))}
        </div>
        {scope === "featured" && (
          <Link href="/faq/guest" className={styles.allFaq}>
            FAQ 전체 보기
          </Link>
        )}
      </div>
    </section>
  );
}
