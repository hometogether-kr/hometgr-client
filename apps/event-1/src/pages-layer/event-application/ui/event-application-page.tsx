import Image from "next/image";

import { ApplicationFlow } from "@/features/submit-application";

import styles from "./event-application-page.module.css";

const spaces = [
  { image: "private-room.png", label: "나만의 방" },
  { image: "living-room.png", label: "함께 쉬는 거실" },
  { image: "kitchen.png", label: "함께 쓰는 주방" },
];

export function EventApplicationPage() {
  return (
    <>
      <header className={styles.header}>
        <Image
          src="/event_1/images/logo.svg"
          width={155}
          height={28}
          alt="Home Together"
          unoptimized
          priority
        />
        <p>
          <span className={styles.desktopBrand}>홈투게더&nbsp;&nbsp; / &nbsp;&nbsp;</span>월세 지원
          이벤트
        </p>
      </header>
      <main className={styles.main}>
        <section className={styles.hero} aria-labelledby="event-title">
          <p className={styles.badge}>대학생 입주 혜택</p>
          <h1 id="event-title" className={styles.title}>
            <span>홈투게더 입주하면,</span>
            <strong>한 달 월세 지원</strong>
          </h1>
          <div className={styles.heroDetails}>
            <p className={styles.introduction}>
              거주를 원하는 대학교를 알려주세요.
              <br />
              홈투게더 입주 가능한 집과
              <span className={styles.mobileBreak} />
              <span className={styles.desktopSpace}> </span>월세 지원 혜택을 안내해드려요.
            </p>
            <div className={styles.spaces}>
              <div className={styles.photos}>
                {spaces.map((space) => (
                  <figure className={styles.photo} key={space.image}>
                    <Image
                      src={`/event_1/images/${space.image}`}
                      alt=""
                      fill
                      sizes="(max-width: 767px) 30vw, 192px"
                      priority
                    />
                    <figcaption>{space.label}</figcaption>
                  </figure>
                ))}
              </div>
              <p className={styles.caption}>홈투게더 공간 예시</p>
            </div>
          </div>
        </section>
        <ApplicationFlow />
      </main>
      <footer className={styles.footer}>
        <p>
          본 혜택은 홈투게더에 입주하는
          <span className={styles.mobileBreak} />
          <span className={styles.desktopSpace}> </span>대학생에게만 적용됩니다.
        </p>
        <small>© HomeTogether. All rights reserved.</small>
      </footer>
    </>
  );
}
