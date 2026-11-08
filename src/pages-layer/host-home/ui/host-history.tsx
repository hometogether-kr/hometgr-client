import Image from "next/image";

import { hostContainer, SectionHeading } from "./section-heading";

import styles from "./host-history.module.css";

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
interface AchievementCardProps {
  title: string;
  items: string[];
  className: string;
}
function AchievementCard({ title, items, className }: AchievementCardProps) {
  return (
    <article className={`${styles.achievement} ${className}`}>
      <h3>
        <Image src="/images/host-landing/history-dot.svg" alt="" width={22} height={22} />
        {title}
      </h3>
      <ul>
        {items.map((item, index) => (
          <li key={item} className={index === 0 ? styles.first : undefined}>
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}
export function HostHistory() {
  return (
    <section className={styles.section}>
      <div className={hostContainer}>
        <SectionHeading label="연혁">
          지역 현장에서 시작해,
          <br />
          사업과 협력의 기반을 넓혀왔습니다.
        </SectionHeading>
        <div className={styles.canvas}>
          <ol className={styles.timeline}>
            {history.map((item, index) => (
              <li key={item.date}>
                <time>{item.date}</time>
                <span className={styles.dot} aria-hidden="true" />
                <div>
                  {index === 0 && (
                    <Image
                      className={styles.school}
                      src="/images/host-landing/history-school.png"
                      alt="서울과학기술대학교 창업지원단"
                      width={343}
                      height={53}
                    />
                  )}
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className={styles.firstPhotos}>
            <Image
              className={styles.portrait}
              src="/images/host-landing/history-portrait.png"
              alt="지역 어르신과 함께하는 활동"
              width={279}
              height={379}
            />
            <Image
              className={styles.agreement}
              src="/images/host-landing/history-agreement.png"
              alt="홈투게더 협약 체결"
              width={279}
              height={379}
            />
            <Image
              className={styles.badge}
              src="/images/host-landing/history-badge.svg"
              alt=""
              width={211}
              height={211}
            />
          </div>
          <AchievementCard title="주요 선정·성과" items={achievements} className={styles.awards} />
          <div className={styles.secondPhotos}>
            <div className={styles.classPhoto}>
              <Image
                src="/images/host-landing/history-class.png"
                alt="지역사회 시니어 디지털 교육"
                fill
                sizes="350px"
              />
            </div>
            <div className={styles.outdoorPhoto}>
              <Image
                src="/images/host-landing/history-outdoor.png"
                alt="지역 현장에서 진행한 홈투게더 상담"
                fill
                sizes="400px"
              />
            </div>
            <Image
              className={styles.clipLeft}
              src="/images/host-landing/history-clip-left.svg"
              alt=""
              width={114}
              height={39}
            />
            <Image
              className={styles.clipRight}
              src="/images/host-landing/history-clip-right.svg"
              alt=""
              width={84}
              height={39}
            />
            <Image
              className={styles.triangle}
              src="/images/host-landing/history-triangle.svg"
              alt=""
              width={154}
              height={147}
            />
          </div>
          <AchievementCard
            title="기관·기업 협업"
            items={partnerships}
            className={styles.partnerships}
          />
          <AchievementCard title="지역사회 활동" items={activities} className={styles.activities} />
        </div>
      </div>
    </section>
  );
}
