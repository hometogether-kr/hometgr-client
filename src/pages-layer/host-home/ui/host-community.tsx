import Image from "next/image";

import { hostContainer, SectionHeading } from "./section-heading";

const reviews = [
  {
    quote: "짐만 두던 방이\n생활비에 보탬이 되네요.",
    name: "이정숙 · 64세 · 집주인",
    body: "아이가 독립한 뒤로 방 하나를 거의 창고처럼 쓰고 있었어요. 방을 어떻게 준비해야 할지 막막했는데 홈투게더와 하나씩 정리했죠. 비워두던 방에 학생이 들어오고 월세를 받으니, 매달 생활비에 보탬이 돼요.",
  },
  {
    quote: "밥까지 챙겨줘야 하는 줄\n알았어요.",
    name: "박미영 · 59세 · 집주인",
    body: "처음에는 예전 하숙처럼 밥하고 빨래까지 해줘야 하나 싶었어요. 각자 식사와 집안일을 챙기고, 함께 쓰는 공간의 규칙만 정하면 된다고 해서 시작했죠. 제 일상을 크게 바꾸지 않고도 함께 지낼 수 있어서 좋았어요.",
  },
  {
    quote: "각자 지내다가,\n마주치면 안부를 나눠요.",
    name: "김영호 · 68세 · 집주인",
    body: "누군가와 같이 살면 종일 신경을 써야 할까 봐 망설였어요. 막상 지내보니 학생은 학교생활을 하고, 저는 제 일상을 보내요. 그러다 저녁에 마주치면 ‘오늘 어땠어요?’ 하고 한마디 나누는 게 생각보다 반갑더라고요.",
  },
];
export function HostCommunity() {
  return (
    <section className="relative isolate overflow-hidden bg-grayscale-50 py-16 md:py-24">
      <div className={`${hostContainer} relative`}>
        <div className="relative min-h-[380px] lg:min-h-[430px]">
          <div className="relative z-10 max-w-[680px]">
            <SectionHeading
              label="홈투게더 운영 현황"
              description="방 준비부터 청년 입주, 거주 중 관리까지 함께합니다."
            >
              노원구 공릉동에서 시작해,
              <br />
              현재 <span className="text-primary-500">55가구</span>를 관리하고 있습니다.
            </SectionHeading>
          </div>
          <div className="relative mx-auto h-[240px] w-full max-w-[560px] md:h-[320px] lg:absolute lg:top-0 lg:right-0 lg:h-[420px]">
            <Image
              src="/images/host-landing/map.png"
              alt="홈투게더가 시작된 노원구 공릉동 지도"
              fill
              sizes="(max-width: 767px) 90vw, 560px"
              className="object-contain"
            />
            <p className="absolute right-0 bottom-6 rounded-3xl bg-white px-5 py-3 text-grayscale-800 shadow-sm">
              <span className="mr-3 text-4xl font-bold">55</span>
              <span className="inline-block text-sm font-semibold">
                <span className="block text-xs font-normal text-grayscale-500">2026.09 기준</span>
                가구 관리 중
              </span>
            </p>
          </div>
        </div>
        <div className="relative z-10 mt-6 grid gap-4 md:grid-cols-3">
          {reviews.map((review) => (
            <figure key={review.name} className="rounded-[28px] bg-white p-7">
              <blockquote>
                <p className="text-xl leading-relaxed font-bold whitespace-pre-line text-grayscale-900">
                  “{review.quote}”
                </p>
                <p className="mt-6 text-base leading-relaxed text-grayscale-800">{review.body}</p>
              </blockquote>
              <figcaption className="mt-5 text-sm text-grayscale-500">{review.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
