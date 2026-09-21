import Image from "next/image";

import { hostContainer, SectionHeading } from "./section-heading";

const achievements = [
  "카카오뱅크, 한국핀테크협회 핀테크 AI분야 서울권역 1위",
  "한국사회적기업 진흥원, 소셜캠퍼스 온 서울 입주기업 선정",
  "기술보증기금, 모두의 창업 소셜리그 선정",
  "창업진흥원, 모두의 창업 1기 선정",
  "소셜벤처 육성사업 선정",
  "부산기술창업투자원 기업 선정",
  "하나은행 소셜벤처 유니버시티 수료",
  "Primer Batch 29기 예비 멘토링 팀 선정",
];
const partnerships = [
  "인천항만공사, 사회연대경제기업 선정",
  "서울과학기술대학교 창업지원단 협업",
  "예비사회적기업 피플에듀 MOU",
  "오퍼(OFFER) MOU",
  "삼익포레스트 아파트 경로당 MOU",
  "신한은행 슈퍼SOL POC",
  "시니어 플랫폼 (주)시놀 협업",
  "노원 복지관 협업",
];
const activities = [
  "경상북도 울진군 골장항 지역형 홈셰어 모델 기획",
  "노원구 공모사업, 시니어 디지털 교육",
  "공릉종합사회복지관, AI 교육",
  "공릉 노인복지관, 시니어 디지털 교육",
  "서울특별시, 어반플레이 ‘이름건 시장’ 참여",
  "사단법인 내부장애인협회, 서울특별시 2차전지 안전배출 협약",
];
const history = [
  {
    date: "2025. 11. 12",
    title: "서울과학기술대학교 창업지원단 소속",
    body: "창업지원단 지원을 바탕으로 홈투게더 사업화 추진",
  },
  {
    date: "2026. 07. 05",
    title: "비영리법인 ‘한지붕’ 창립",
    body: "세대교류와 지역사회 활동을 위한 기반 마련",
  },
  {
    date: "2026. 07. 28",
    title: "주식회사 핀타(홈투게더) 설립",
    body: "홈투게더 서비스 운영법인 설립",
  },
];
function AchievementCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-tl-[28px] bg-white p-7 shadow-[-12px_-12px_40px_0_rgba(34,125,255,0.04)] md:p-8">
      <h3 className="mb-6 text-xl font-semibold text-primary-500">{title}</h3>
      <ul className="space-y-3 text-base leading-relaxed text-grayscale-600">
        {items.map((item, index) => (
          <li key={item} className={index === 0 ? "font-medium text-grayscale-900" : undefined}>
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}
export function HostHistory() {
  return (
    <section className="bg-white py-16 md:py-[120px]">
      <div className={hostContainer}>
        <SectionHeading label="연혁">
          지역 현장에서 시작해,
          <br />
          사업과 협력의 기반을 넓혀왔습니다.
        </SectionHeading>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <ol className="space-y-10 border-l-2 border-primary-400 pl-6 md:ml-32">
            {history.map((item) => (
              <li key={item.date} className="relative">
                <span
                  className="absolute top-2 -left-[31px] size-3 rounded-full border-2 border-primary-500 bg-white"
                  aria-hidden="true"
                />
                <time className="mb-3 block text-sm font-semibold text-grayscale-600 md:absolute md:top-0 md:-left-36">
                  {item.date}
                </time>
                <h3 className="text-lg font-bold text-grayscale-900">{item.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-grayscale-500">{item.body}</p>
              </li>
            ))}
          </ol>
          <div className="relative mx-auto grid w-full max-w-[500px] grid-cols-2 items-center gap-3 py-6">
            <Image
              src="/images/host-landing/history-1.png"
              alt="지역 어르신과 함께하는 활동"
              width={344}
              height={444}
              className="h-auto w-full rounded-lg"
            />
            <Image
              src="/images/host-landing/history-2.png"
              alt="홈투게더 협약 체결"
              width={421}
              height={495}
              className="mt-16 h-auto w-full rounded-lg"
            />
          </div>
          <AchievementCard title="주요 선정·성과" items={achievements} />
          <Image
            src="/images/host-landing/history-3.png"
            alt="지역사회와 함께하는 홈투게더 활동"
            width={419}
            height={295}
            className="mx-auto h-auto w-full max-w-[480px] rounded-lg"
          />
          <AchievementCard title="기관·기업 협업" items={partnerships} />
          <AchievementCard title="지역사회 활동" items={activities} />
        </div>
      </div>
    </section>
  );
}

export function HostPartners() {
  return (
    <section className="overflow-hidden bg-white py-12" aria-labelledby="host-partners-heading">
      <div className={hostContainer}>
        <h2
          id="host-partners-heading"
          className="text-[28px] font-bold tracking-tight text-grayscale-900 md:text-[38px]"
        >
          홈투게더와 함께한 기업들
        </h2>
      </div>
      <div className="mx-auto mt-10 max-w-[1472px] overflow-x-auto px-6 pb-4">
        <Image
          src="/images/host-landing/partners.png"
          alt="홈투게더 협력 기업과 기관 로고"
          width={1472}
          height={88}
          className="h-[88px] w-[1472px] max-w-none"
        />
      </div>
    </section>
  );
}
