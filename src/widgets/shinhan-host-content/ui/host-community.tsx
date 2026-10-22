import Image from "next/image";

import styles from "./host-community.module.css";

const reviews = [
  {
    label: "빈방 활용",
    quote: "짐만 두던 방이\n생활비에 보탬이 되네요.",
    name: "이정숙 · 64세 · 집주인",
    intro: "아이가 독립한 뒤로 방 하나를 거의 창고처럼 쓰고 있었어요.",
    body: "방을 어떻게 준비해야 할지 막막했는데 홈투게더와 하나씩 정리했죠. 비워두던 방에 학생이 들어오고 월세를 받으니, 매달 생활비에 보탬이 돼요.",
  },
  {
    label: "각자의 생활",
    quote: "밥까지 챙겨줘야 하는 줄\n알았어요.",
    name: "박미영 · 59세 · 집주인",
    intro: "처음에는 예전 하숙처럼 밥하고 빨래까지 해줘야 하나 싶었어요.",
    body: "각자 식사와 집안일을 챙기고, 함께 쓰는 공간의 규칙만 정하면 된다고 해서 시작했죠. 제 일상을 크게 바꾸지 않고도 함께 지낼 수 있어서 좋았어요.",
  },
  {
    label: "함께 사는 일상",
    quote: "각자 지내다가,\n마주치면 안부를 나눠요.",
    name: "김영호 · 68세 · 집주인",
    intro: "누군가와 같이 살면 종일 신경을 써야 할까 봐 망설였어요.",
    body: '막상 지내보니 학생은 학교생활을 하고, 저는 제 일상을 보내요. 그러다 저녁에 마주치면 "오늘 어땠어요?" 하고 한마디 나누는 게 생각보다 반갑더라고요.',
  },
];
const newsUrl = "https://www.youtube.com/watch?v=DdCxyz9kNs4";

export function ShinhanHostCommunity() {
  return (
    <>
      <section className={styles.community} aria-labelledby="shinhan-host-community-heading">
        <div className={styles.container}>
          <div className={styles.intro}>
            <header className={styles.heading}>
              <p>홈투게더 운영 현황</p>
              <h2 id="shinhan-host-community-heading">
                노원구 공릉동에서 시작해,
                <br />
                현재 <em>55가구</em>를 관리하고 있습니다.
              </h2>
              <p className={styles.description}>
                방 준비부터 청년 입주, 거주 중 관리까지 함께합니다.
              </p>
            </header>
            <div className={styles.mapWrap}>
              <Image
                className={styles.map}
                src="/images/host-landing/map.png"
                alt="홈투게더가 시작된 노원구 공릉동 지도"
                width={1658}
                height={877}
                sizes="(min-width:768px) 1658px, 700px"
              />
              <Image
                className={styles.connector}
                src="/images/host-landing/map-connector.svg"
                alt=""
                width={134}
                height={82}
              />
              <p className={styles.count}>
                <strong>55</strong>
                <span>
                  <small>2026.09 기준</small>가구 관리 중
                </span>
              </p>
            </div>
          </div>
          <div className={styles.reviews}>
            {reviews.map((review) => (
              <figure key={review.name} className={styles.review}>
                <figcaption>
                  <p className={styles.label}>{review.label}</p>
                  <blockquote>“{review.quote}”</blockquote>
                  <p className={styles.reviewName}>{review.name}</p>
                </figcaption>
                <div className={styles.reviewBody}>
                  <p>{review.intro}</p>
                  <p>{review.body}</p>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>
      <section className={styles.news} aria-labelledby="shinhan-host-news-heading">
        <div className={`${styles.container} ${styles.newsContent}`}>
          <div className={styles.newsCopy}>
            <p className={styles.newsLabel}>MBC 뉴스데스크</p>
            <h2 id="shinhan-host-news-heading">
              MBC 뉴스에 소개된
              <br />
              홈투게더 이야기 보기
            </h2>
            <p>
              뉴스 속 홈투게더의 이야기를
              <br />
              영상으로 만나보세요.
            </p>
            <a
              className={styles.newsButton}
              href={newsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="MBC 공식 영상 보러가기 (새 창)"
            >
              영상 보러가기 ↗
            </a>
          </div>
          <a
            className={styles.thumbnail}
            href={newsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="MBC 뉴스 홈투게더 이야기 영상 (새 창)"
          >
            <Image
              src="/images/shinhan/host/community-mbc.png"
              alt="우리 손녀 왔네, 빈방 내주니 식구 생겼다 — MBC 뉴스데스크"
              fill
              sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1279px) 50vw, 632px"
            />
          </a>
        </div>
      </section>
    </>
  );
}
