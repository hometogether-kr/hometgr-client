"use client";

import { useRef, useState } from "react";

import { FAQ_CATEGORIES, type FaqCategory, HOST_FAQ } from "../model/faq-content";
import { hostContainer, SectionHeading } from "./section-heading";

const topQuestions: {
  title: string;
  summary: string;
  paragraphs: string[];
  category: FaqCategory;
  label: string;
}[] = [
  {
    title: "어떤 청년이 들어오나요?",
    summary: "입주 전에 확인하고, 동의한 뒤에 들어옵니다.",
    paragraphs: [
      "본인 확인과 재학 등 신청 자격을 확인하고, 거주 기간·생활패턴·흡연 여부·공용공간 이용 조건을 함께 살펴봅니다. 귀가와 출입, 방문객, 소음, 공용시설 이용 규칙은 입주 전에 정해 서로 확인합니다.",
      "집주인이 확인하고 동의하지 않은 상태로 입주가 진행되지 않습니다. 중요하게 생각하는 조건이 있다면 상담 단계에서 알려주세요.",
    ],
    category: "living",
    label: "입주 준비·공동생활 질문 더 보기",
  },
  {
    title: "세금은 어떻게 되나요?",
    summary: "1주택이고 기준시가 12억 원 이하면 월세 소득은 비과세입니다.",
    paragraphs: [
      "부부 합산으로 국내 주택이 1채뿐이고 그 주택의 기준시가가 12억 원 이하라면, 방 일부를 임대해 받는 월세는 과세되지 않습니다. 배우자 명의 주택도 합산하므로 집값뿐 아니라 보유 주택 수를 함께 확인해야 합니다.",
      "기준시가를 넘더라도 연간 주택임대 수입이 2,000만 원 이하면 분리과세를 선택할 수 있습니다. 기준시가는 실거래가나 호가가 아니라 세법상 금액으로, ‘부동산공시가격 알리미’에서 조회합니다.",
      "기준: 2026년 귀속",
      "과세되는 임대소득은 건강보험료 산정에 반영될 수 있고, 기초연금은 별도의 소득인정액 기준을 적용합니다. 개인별 과세·신고 여부는 국세청 또는 세무전문가에게 확인해 주세요.",
    ],
    category: "tax",
    label: "월세 수입·세금 질문 더 보기",
  },
  {
    title: "문제가 생기면 누가 해결하나요?",
    summary: "혼자 감당하지 않으셔도 됩니다.",
    paragraphs: [
      "불편한 상황이 생기면 홈투게더에 알려주세요. 언제 무슨 일이 있었는지와 입주 전에 정한 생활규칙을 확인하고, 양쪽 이야기를 들어 조율을 지원합니다.",
      "가구나 시설이 손상되면 정상적인 사용에 따른 노후화와 고의·과실에 따른 손상을 구분해 책임 범위를 확인합니다. 입주 전 방과 가구 상태를 사진으로 남겨두시면 확인이 쉽습니다.",
      "문제가 반복되거나 계약 유지가 어려우면 계약 내용과 관계 법령에 따른 후속 절차를 안내합니다.",
    ],
    category: "contract",
    label: "계약·정산·거주 관리 질문 더 보기",
  },
];

export function HostQuestions() {
  const [category, setCategory] = useState<FaqCategory>("all");
  const [expandedId, setExpandedId] = useState<number | null>(1);
  const faqRef = useRef<HTMLElement>(null);
  const items = HOST_FAQ.filter((item) => category === "all" || item.category === category);
  function selectCategory(next: FaqCategory) {
    setCategory(next);
    setExpandedId(null);
  }
  function handleCategoryLink(next: FaqCategory) {
    selectCategory(next);
    faqRef.current?.focus({ preventScroll: true });
    faqRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
  }
  return (
    <>
      <section className="bg-grayscale-50 py-16 md:py-[120px]">
        <div className={hostContainer}>
          <SectionHeading label="시작 전 확인 TOP 3">
            가장 궁금한 세 가지, 먼저 확인하세요
          </SectionHeading>
          <div className="space-y-6">
            {topQuestions.map((item) => (
              <article key={item.category} className="rounded-3xl bg-white p-6 md:p-10">
                <h3 className="text-xl font-bold text-grayscale-900 md:text-2xl">{item.title}</h3>
                <p className="mt-5 text-lg font-bold text-primary-500 md:text-xl">{item.summary}</p>
                {item.paragraphs.map((p) => (
                  <p
                    key={p}
                    className="mt-5 text-base leading-relaxed text-grayscale-700 md:text-lg"
                  >
                    {p}
                  </p>
                ))}
                <button
                  type="button"
                  onClick={() => handleCategoryLink(item.category)}
                  className="mt-6 min-h-12 text-left text-base font-semibold text-primary-500 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  {item.label} <span aria-hidden="true">→</span>
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section
        ref={faqRef}
        id="host-faq"
        tabIndex={-1}
        aria-label="자주 묻는 질문"
        className="scroll-mt-24 bg-white py-16 focus:outline-none md:py-[120px]"
      >
        <div className={hostContainer}>
          <SectionHeading description="빈방 준비부터 공동생활, 계약과 정산, 월세 수입에 대한 세금까지 안내합니다.">
            자주 묻는 질문
          </SectionHeading>
          <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="질문 분류">
            {FAQ_CATEGORIES.map((item) => (
              <button
                key={item.value}
                type="button"
                aria-pressed={category === item.value}
                onClick={() => selectCategory(item.value)}
                className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 md:px-6 md:text-base ${category === item.value ? "border-primary-500 bg-primary-500 text-white" : "border-grayscale-200 bg-white text-grayscale-600 hover:bg-primary-50"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="border-t border-grayscale-200">
            {items.map((item) => (
              <article key={item.id} className="border-b border-grayscale-200">
                <h3>
                  <button
                    type="button"
                    aria-expanded={expandedId === item.id}
                    aria-controls={`faq-answer-${item.id}`}
                    id={`faq-question-${item.id}`}
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className="flex w-full items-center gap-4 px-2 py-6 text-left text-base font-semibold text-grayscale-900 hover:bg-grayscale-50 focus-visible:outline-2 focus-visible:outline-primary-500 md:text-xl"
                  >
                    <span className="text-primary-500" aria-hidden="true">
                      Q
                    </span>
                    <span className="flex-1">{item.question}</span>
                    <span aria-hidden="true" className="text-xl text-grayscale-500">
                      {expandedId === item.id ? "−" : "+"}
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-answer-${item.id}`}
                  aria-labelledby={`faq-question-${item.id}`}
                  hidden={expandedId !== item.id}
                  className="rounded-xl bg-grayscale-50 px-6 py-7 md:px-12"
                >
                  <p className="text-base leading-relaxed font-semibold text-grayscale-900 md:text-lg">
                    {item.summary}
                  </p>
                  <p className="mt-4 text-base leading-relaxed whitespace-pre-line text-grayscale-600 md:text-lg">
                    {item.detail}
                  </p>
                </div>
              </article>
            ))}
          </div>
          {(category === "all" || category === "tax") && (
            <aside className="mt-8 rounded-2xl bg-primary-50 p-6 text-sm leading-relaxed text-grayscale-600">
              <h3 className="mb-2 font-bold text-primary-500">세금 안내</h3>위 내용은 개인 집주인의
              주거용 주택 임대에 관한 일반적인 안내입니다. 공동소유 여부, 다른 주택과 임대수입, 실제
              운영 형태, 해당 귀속연도의 법령에 따라 적용이 달라질 수 있습니다. 개인별 과세·신고
              여부는 국세청 또는 세무전문가에게 확인해 주세요.
            </aside>
          )}
        </div>
      </section>
    </>
  );
}
