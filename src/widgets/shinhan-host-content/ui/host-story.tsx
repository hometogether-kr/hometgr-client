import Image from "next/image";

import styles from "./host-story.module.css";

const achievements = [
  "카카오뱅크, 한국핀테크협회 핀테크 AI분야 서울권역 1위",
  "창업경진대회 부산광역시장상 대상",
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
    dateTime: "2025-11-12",
    title: "서울과학기술대학교 창업지원단 소속",
    body: "창업지원단 지원을 바탕으로 홈투게더 사업화 추진",
  },
  {
    date: "2026. 07. 05",
    dateTime: "2026-07-05",
    title: "비영리법인 ‘한지붕’ 창립",
    body: "세대교류와 지역사회 활동을 위한 기반 마련",
  },
  {
    date: "2026. 07. 28",
    dateTime: "2026-07-28",
    title: "주식회사 핀타(홈투게더) 설립",
    body: "홈투게더 서비스 운영법인 설립",
  },
];

interface AchievementCardProps {
  title: string;
  items: string[];
  highlightedCount?: number;
}

function AchievementCard({ title, items, highlightedCount = 1 }: AchievementCardProps) {
  return (
    <article className={styles.achievement}>
      <h3>
        <Image src="/images/host-landing/history-dot.svg" alt="" width={22} height={22} />
        {title}
      </h3>
      <ul>
        {items.map((item, index) => (
          <li key={item} className={index < highlightedCount ? styles.highlight : undefined}>
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}

export function ShinhanHostStory() {
  return (
    <>
      <section className={styles.section} aria-labelledby="shinhan-host-history-heading">
        <div className={styles.container}>
          <header className={styles.heading}>
            <p>연혁</p>
            <h2 id="shinhan-host-history-heading">
              지역 현장에서 시작해,
              <br />
              사업과 협력의 기반을 넓혀왔습니다.
            </h2>
          </header>
          <div className={styles.grid}>
            <ol className={styles.timeline}>
              {history.map((item, index) => (
                <li key={item.date}>
                  <time dateTime={item.dateTime}>{item.date}</time>
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
            <div className={styles.photos}>
              <div className={styles.award}>
                <Image
                  src="/images/shinhan/host/story-award.png"
                  alt="창업경진대회 부산광역시장상 수상"
                  fill
                  sizes="(min-width:768px) 213px, 40vw"
                />
              </div>
              <div className={styles.agreement}>
                <Image
                  src="/images/shinhan/host/story-agreement.png"
                  alt="지역사회 협약 체결"
                  fill
                  sizes="(min-width:768px) 201px, 38vw"
                />
              </div>
              <div className={styles.visit}>
                <Image
                  src="/images/shinhan/host/story-visit.png"
                  alt="어르신과 함께하는 지역 현장 활동"
                  fill
                  sizes="(min-width:768px) 172px, 32vw"
                />
              </div>
              <div className={styles.stage}>
                <Image
                  src="/images/shinhan/host/story-stage.png"
                  alt="협력 기관들과 함께한 행사"
                  fill
                  sizes="(min-width:768px) 338px, 60vw"
                />
              </div>
              <Image
                className={styles.badge}
                src="/images/shinhan/host/story-badge.svg"
                alt=""
                width={149.24}
                height={149.24}
              />
            </div>
            <AchievementCard title="주요 선정·성과" items={achievements} highlightedCount={2} />
            <Image
              className={styles.activitiesPhoto}
              src="/images/shinhan/host/story-activities.png"
              alt="지역사회에서 진행한 홈투게더 상담과 현장 활동"
              width={579}
              height={500}
              sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1279px) 50vw, 579px"
            />
            <AchievementCard title="기관·기업 협업" items={partnerships} />
            <AchievementCard title="지역사회 활동" items={activities} />
          </div>
        </div>
      </section>
      <section className={styles.partners} aria-labelledby="shinhan-host-partners-heading">
        <div className={styles.container}>
          <h2 id="shinhan-host-partners-heading">홈투게더와 함께한 기업들</h2>
        </div>
        <div
          className={styles.partnerViewport}
          tabIndex={0}
          role="region"
          aria-label="협력 기업 로고, 좌우로 스크롤"
        >
          <Image
            className={styles.partnerLogos}
            src="/images/host-landing/partners-loop.png"
            alt="인천항만공사, 오퍼, 하나은행, 신한은행, 어반플레이, 카카오뱅크, 서울과학기술대학교 창업지원단, 울진군, 피플에듀, 한국핀테크지원센터, 노원구청"
            width={2317}
            height={55}
            sizes="2317px"
          />
        </div>
      </section>
    </>
  );
}
