import Image from "next/image";

import { hostContainer, SectionHeading } from "./section-heading";

const benefits = [
  {
    image: "income",
    title: "빈방으로 생활소득",
    body: "사용하지 않던 방을 청년의 주거 공간으로 활용해, 생활비에 보탬이 되는 월세를 받아보세요.",
  },
  {
    image: "match",
    title: "서로 맞는 청년과 함께",
    body: "청년의 신원과 생활습관을 미리 확인하고, 입주 전 함께 지킬 생활 규칙을 정합니다.",
  },
  {
    image: "life",
    title: "식사·빨래 부담 없이",
    body: "청년의 식사나 빨래를 챙겨줄 필요 없이, 각자의 생활을 존중하며 함께 지냅니다.",
  },
  {
    image: "care",
    title: "거주 중에도 함께 관리",
    body: "함께 살며 불편이나 갈등이 생기면, 홈투게더가 중간에서 함께 조율합니다.",
  },
];
const steps = [
  { title: "방 등록", body: "방 사진과 기본 정보만 올려주세요.\n어려우면 전화로 도와드립니다." },
  {
    title: "홈투게더가 학생을 찾아 확인합니다",
    body: "검증한 학생만 연결하고,\n방문 일정까지 조율합니다.",
  },
  { title: "계약하고 시작", body: "계약서 작성부터 입주까지\n함께 진행합니다." },
];

export function HostBenefits() {
  return (
    <section className="bg-grayscale-50 pt-16 pb-10 md:pt-20">
      <div className={hostContainer}>
        <div className="mb-10 flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <p className="mb-5 text-lg font-bold text-primary-500">홈투게더의 목표</p>
            <h2 className="text-2xl leading-loose font-semibold text-grayscale-800">
              우리집 남는 방을
              <br />
              검증된 대학생에게 임대
              <br />
              홈투게더와 함께 안전하게
            </h2>
          </div>
          <Image
            src="/images/host-landing/goal.png"
            alt=""
            width={404}
            height={124}
            className="h-auto w-full max-w-[360px]"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {benefits.map((item) => (
            <article
              key={item.image}
              className="flex items-center gap-5 rounded-[28px] bg-white p-6 md:gap-6 md:p-8"
            >
              <Image
                src={`/images/host-landing/benefit-${item.image}.png`}
                alt=""
                width={81}
                height={81}
                className="size-14 shrink-0 md:size-[81px]"
              />
              <div>
                <h3 className="mb-3 text-lg font-bold text-grayscale-900">{item.title}</h3>
                <p className="text-base leading-relaxed text-grayscale-600">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HostSteps() {
  return (
    <section className="bg-grayscale-50 py-16 md:py-20">
      <div className={hostContainer}>
        <SectionHeading label="진행 방법">방 등록부터 입주까지, 세 단계면 됩니다</SectionHeading>
        <ol className="grid gap-5 lg:grid-cols-[1fr_1.3fr_1fr] lg:gap-10">
          {steps.map((step, index) => (
            <li key={step.title} className="relative rounded-[28px] bg-white p-7">
              <p className="mb-3 text-sm font-bold text-primary-500">0{index + 1}</p>
              <h3 className="text-xl leading-relaxed font-bold text-grayscale-900">{step.title}</h3>
              <p className="mt-5 text-base leading-relaxed whitespace-pre-line text-grayscale-600">
                {step.body}
              </p>
              {index === 0 && (
                <p className="mt-4 rounded-xl bg-primary-50 p-3 text-sm text-primary-500">
                  방 등록만으로 입주가 확정되지 않습니다.
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
