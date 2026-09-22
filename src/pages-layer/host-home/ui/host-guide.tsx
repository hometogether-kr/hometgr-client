import Image from "next/image";

import { hostContainer, SectionHeading } from "./section-heading";

import styles from "./host-layout.module.css";

export function HostGuide() {
  return (
    <section className={styles.guide} aria-label="처음 시작하는 집주인 가이드">
      <div className={hostContainer}>
        <SectionHeading description="시작하는 분들을 위한 홈투게더 안내서">
          처음 시작하는 집주인 가이드
        </SectionHeading>
        <div className={styles.guideGrid}>
          <article>
            <a
              className={styles.guideCard}
              href="https://blog.naver.com/home_together_/224417826561"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/host-landing/guide-service.png"
                alt=""
                width={1737}
                height={906}
                sizes="(min-width: 1280px) 384px, (min-width: 768px) calc((100vw - 72px) / 2), calc(100vw - 48px)"
              />
              <div className={styles.guideText}>
                <p className={styles.guideCategory}>이용 가이드</p>
                <h3>홈투게더 서비스 알아보기</h3>
                <p className={styles.guideDescription}>개인방은 따로, 생활공간은 함께</p>
                <span className="sr-only">네이버 블로그, 새 탭에서 열림</span>
              </div>
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
