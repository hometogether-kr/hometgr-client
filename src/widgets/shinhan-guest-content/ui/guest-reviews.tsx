import Image from "next/image";

import { BtnCta } from "@/shared/ui/btn-cta";

import styles from "./guest-reviews.module.css";

const asset = "/images/shinhan/guest/";
const reviews = [
  {
    topic: "공간과 비용",
    name: "김O연",
    age: "22세",
    quote: "월세 때문에 알아봤는데, 방이 마음에 들었어요.",
    paragraphs: [
      "학교 근처 원룸을 알아보다가 월세가 부담돼서 홈투게더를 찾아봤어요.",
      "직접 가보니 방도 넉넉하고 책상 놓고 공부하기에도 좋더라고요.",
      "원룸보다 1.5배는 넓은 것 같네요.",
    ],
  },
  {
    topic: "함께 사는 규칙",
    name: "이O호",
    age: "24세",
    quote: "같이 살면 눈치 보일 줄 알았는데, 미리 정하니 편했어요.",
    paragraphs: [
      "처음에는 늦게 들어오거나 주방을 쓸 때 눈치가 보일까 걱정했어요.",
      "그런데 입주 전에 생활패턴을 이야기하고, 공용공간 사용 규칙도 확인하니까 훨씬 마음이 놓였어요.",
    ],
  },
  {
    topic: "생활 중 소통",
    name: "박O우",
    age: "21세",
    quote: "불편한 이야기를 혼자 꺼내지 않아도 돼서 좋았어요.",
    paragraphs: [
      "첫 자취라 집주인께 불편한 점을 어떻게 말씀드려야 할지 어렵더라고요.",
      "생활 중 조율할 일이 생겼을 때 홈투게더에 먼저 이야기했어요.",
    ],
  },
];

export function ShinhanGuestReviews() {
  return (
    <section className={styles.section} aria-labelledby="shinhan-guest-reviews-heading">
      <div className={styles.container}>
        <h2 id="shinhan-guest-reviews-heading">홈투게더와 함께하신 분들</h2>
        <div className={styles.content}>
          <a
            className={styles.video}
            href="https://www.youtube.com/shorts/O8bQe1yCjOM"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="홈투게더 게스트 영상 후기 보기 (YouTube 새 창)"
          >
            <div className={styles.thumbnail}>
              <Image
                src={`${asset}review-video.png`}
                fill
                sizes="(max-width: 767px) calc(100vw - 40px), 336px"
                alt="어떤 분들에게 추천하나요? 게스트 인터뷰 영상"
              />
            </div>
            <div className={styles.videoCaption}>
              <p>
                홈투게더 게스트
                <br />
                영상 후기 보기
              </p>
              <span className={styles.videoAction}>
                <Image src={`${asset}review-play.svg`} width={18} height={18} alt="" />
                영상 후기 보기
                <Image src={`${asset}review-external.svg`} width={16} height={16} alt="" />
              </span>
            </div>
          </a>
          <div className={styles.reviews}>
            {reviews.map((review) => (
              <figure key={review.name} className={styles.review}>
                <figcaption className={styles.caption}>
                  <span className={styles.topic}>{review.topic}</span>
                  <span className={styles.author}>
                    <span>{review.name}</span>
                    <Image src={`${asset}review-dot.svg`} width={3} height={3} alt="" />
                    <span>{review.age}</span>
                    <Image src={`${asset}review-dot.svg`} width={3} height={3} alt="" />
                    <span>대학생</span>
                  </span>
                </figcaption>
                <blockquote>
                  <p className={styles.quote}>&quot;{review.quote}&quot;</p>
                  <div className={styles.body}>
                    {review.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </blockquote>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ShinhanGuestFinalCallToAction() {
  return (
    <section className={styles.finalCallToAction} aria-labelledby="shinhan-guest-final-heading">
      <div className={styles.container}>
        <h2 id="shinhan-guest-final-heading">
          <em>우리 학교 근처</em>에는
          <br />
          어떤 방이 있을까요?
        </h2>
        <p>
          방 사진과 비용, 함께 사는 조건을 먼저 살펴보세요.
          <br />
          마음에 드는 방이 있으면 상담을 신청할 수 있어요.
        </p>
        <BtnCta
          disabled
          size="xl"
          className={styles.finalButton}
          aria-describedby="shinhan-guest-final-notice"
        >
          우리 학교 근처 방 보기
        </BtnCta>
        <p id="shinhan-guest-final-notice" className={styles.notice}>
          위치·예산 수요조사 신청은 준비 중이에요.
        </p>
      </div>
    </section>
  );
}
