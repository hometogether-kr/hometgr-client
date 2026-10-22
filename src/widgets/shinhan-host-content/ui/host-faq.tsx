"use client";

import Image from "next/image";
import { useState, useSyncExternalStore } from "react";

import { ChipNormal } from "@/shared/ui/chip-normal";

import {
  FAQ_CATEGORIES,
  type FaqCategory,
  faqCategorySchema,
  HOST_FAQ,
} from "../model/host-questions";

import styles from "./host-questions.module.css";

const categoryHashPrefix = "#shinhan-host-faq-";

function subscribeToCategory(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("popstate", onChange);
  };
}

function readCategory(): FaqCategory {
  const hash = window.location.hash;
  if (!hash.startsWith(categoryHashPrefix)) return "all";
  const result = faqCategorySchema.safeParse(hash.slice(categoryHashPrefix.length));
  return result.success ? result.data : "all";
}

function readServerCategory(): FaqCategory {
  return "all";
}

function selectCategory(category: FaqCategory) {
  window.history.replaceState(window.history.state, "", `${categoryHashPrefix}${category}`);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

interface FaqListProps {
  category: FaqCategory;
}

function FaqList({ category }: FaqListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(category === "all" ? 1 : null);
  const items = HOST_FAQ.filter((item) => category === "all" || item.category === category);

  return (
    <div className={styles.faqList} id="shinhan-host-faq-list">
      {items.map((item) => {
        const isExpanded = expandedId === item.id;
        return (
          <article key={item.id}>
            <h3>
              <button
                type="button"
                className={styles.question}
                id={`shinhan-host-question-${item.id}`}
                aria-expanded={isExpanded}
                aria-controls={`shinhan-host-answer-${item.id}`}
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <span className={styles.questionMark} aria-hidden="true">
                  Q
                </span>
                <span className={styles.questionText}>{item.question}</span>
                <Image
                  src={`/images/shinhan/host/guide-faq-${isExpanded ? "up" : "down"}.svg`}
                  alt=""
                  width={20}
                  height={20}
                  className={styles.arrow}
                />
              </button>
            </h3>
            <div
              className={styles.answer}
              id={`shinhan-host-answer-${item.id}`}
              aria-labelledby={`shinhan-host-question-${item.id}`}
              hidden={!isExpanded}
            >
              <p className={styles.answerSummary}>{item.summary}</p>
              <p className={styles.answerDetail}>{item.detail}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function ShinhanHostFaq() {
  const category = useSyncExternalStore(subscribeToCategory, readCategory, readServerCategory);

  return (
    <section
      className={styles.faqSection}
      id="shinhan-host-faq"
      aria-labelledby="shinhan-host-faq-heading"
    >
      <div className={styles.container}>
        <header className={styles.faqHeading}>
          <h2 className={styles.heading} id="shinhan-host-faq-heading">
            자주 묻는 질문
          </h2>
          <p>빈방 준비부터 공동생활, 계약과 정산, 월세 수입에 대한 세금까지 안내합니다.</p>
        </header>
        <div className={styles.chips} role="group" aria-label="질문 분류">
          {FAQ_CATEGORIES.map((item) => (
            <ChipNormal
              key={item.value}
              shape="square"
              size="lg"
              className={styles.chip}
              id={`shinhan-host-faq-${item.value}`}
              selected={category === item.value}
              aria-controls="shinhan-host-faq-list"
              onClick={() => selectCategory(item.value)}
            >
              {item.label}
            </ChipNormal>
          ))}
        </div>
        <FaqList key={category} category={category} />
        {(category === "all" || category === "tax") && (
          <aside className={styles.taxNotice} aria-labelledby="shinhan-host-tax-notice-heading">
            <h3 id="shinhan-host-tax-notice-heading">세금 안내</h3>
            <p>
              위 내용은 개인 집주인의 주거용 주택 임대에 관한 일반적인 안내입니다. 공동소유 여부,
              다른 주택과 임대수입, 실제 운영 형태, 해당 귀속연도의 법령에 따라 적용이 달라질 수
              있습니다. 개인별 과세·신고 여부는 국세청 또는 세무전문가에게 확인해 주세요.
            </p>
          </aside>
        )}
      </div>
    </section>
  );
}
