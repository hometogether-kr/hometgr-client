"use client";

import Image from "next/image";
import { useState } from "react";

import { ChipNormal } from "@/shared/ui/chip-normal";

import {
  FEATURED_GUEST_FAQ_IDS,
  GUEST_FAQ,
  GUEST_FAQ_CATEGORIES,
  type GuestFaqCategory,
} from "../model/guest-questions";

import styles from "./guest-faq.module.css";

export function ShinhanGuestFaq() {
  const [category, setCategory] = useState<GuestFaqCategory>("전체");
  const [showsAllQuestions, setShowsAllQuestions] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(1);
  const isShowingAll = category === "전체" && showsAllQuestions;
  const questions = GUEST_FAQ.filter((item) =>
    category === "전체"
      ? showsAllQuestions || FEATURED_GUEST_FAQ_IDS.includes(item.id)
      : item.category === category,
  );

  function handleCategorySelect(nextCategory: GuestFaqCategory) {
    setCategory(nextCategory);
    setExpandedId(nextCategory === "전체" ? 1 : null);
  }

  function handleAllQuestionsToggle() {
    setShowsAllQuestions(!isShowingAll);
    setCategory("전체");
    setExpandedId(1);
  }

  return (
    <section
      className={styles.section}
      id="shinhan-guest-faq"
      aria-labelledby="shinhan-guest-faq-heading"
    >
      <div className={styles.container}>
        <h2 className={styles.heading} id="shinhan-guest-faq-heading">
          자주 묻는 질문
        </h2>
        <p className={styles.description}>
          방 선택부터 입주 준비, 공동생활, 월세와 보증금, 전입신고와 퇴실까지 안내합니다.
        </p>
        <div className={styles.categories} role="group" aria-label="질문 분류">
          {GUEST_FAQ_CATEGORIES.map((item) => (
            <ChipNormal
              key={item}
              shape="square"
              size="m"
              className={styles.category}
              selected={category === item}
              aria-controls="shinhan-guest-faq-list"
              onClick={() => handleCategorySelect(item)}
            >
              {item}
            </ChipNormal>
          ))}
        </div>
        <div className={styles.list} id="shinhan-guest-faq-list">
          {questions.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <article key={item.id}>
                <h3>
                  <button
                    type="button"
                    className={styles.question}
                    id={`shinhan-guest-question-${item.id}`}
                    aria-expanded={isExpanded}
                    aria-controls={`shinhan-guest-answer-${item.id}`}
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  >
                    <span className={styles.questionMark} aria-hidden="true">
                      Q
                    </span>
                    <span className={styles.questionText}>{item.question}</span>
                    <Image
                      src={`/images/guest-landing/imgProperty1${isExpanded ? "Up" : "Down"}ThickOffSize20.svg`}
                      alt=""
                      width={20}
                      height={20}
                      className={styles.arrow}
                    />
                  </button>
                </h3>
                <div
                  className={styles.answer}
                  id={`shinhan-guest-answer-${item.id}`}
                  aria-labelledby={`shinhan-guest-question-${item.id}`}
                  hidden={!isExpanded}
                >
                  <p className={styles.summary}>{item.summary}</p>
                  <p className={styles.detail}>{item.detail}</p>
                </div>
              </article>
            );
          })}
        </div>
        <button
          type="button"
          className={styles.allQuestions}
          aria-expanded={isShowingAll}
          aria-controls="shinhan-guest-faq-list"
          onClick={handleAllQuestionsToggle}
        >
          {isShowingAll ? "주요 질문만 보기" : "FAQ 전체 보기"}
        </button>
      </div>
    </section>
  );
}
